import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import { clientIp, rateLimit, store, storeUnavailable } from "@/lib/store";
import { readJson } from "@/lib/http";
import {
  LIMITS, accuracyFrom, generateText, isMode, isWordSet, leaderboardKey, wpmFrom,
  type SubmitResponse,
} from "@/lib/typing";
import type { Round } from "../start/route";

let matcher: RegExpMatcher | null = null;

function normalizeName(raw: unknown): { ok: true; name: string } | { ok: false; message: string } {
  if (typeof raw !== "string") return { ok: false, message: "Enter a name." };
  const name = raw
    .normalize("NFKC")
    .replace(/[\p{Cc}\p{Cf}\u2028\u2029]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const length = [...name].length;
  if (length < LIMITS.nameMin) return { ok: false, message: "Enter a name." };
  if (length > LIMITS.nameMax) return { ok: false, message: `Keep it to ${LIMITS.nameMax} characters.` };
  if (!/^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u.test(name)) {
    return { ok: false, message: "Letters, numbers, spaces and . _ ' - only." };
  }
  if (/(https?:|www\.|\.(com|net|org|io|dev|xyz|ru|in)\b)/i.test(name)) {
    return { ok: false, message: "No links in names." };
  }
  matcher ??= new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
  if (matcher.hasMatch(name)) return { ok: false, message: "Pick a friendlier name." };
  return { ok: true, name };
}

const MAX_SAMPLES = 130; // longest round is 60s, plus the +-2 tolerance below

type Entry = { name: string; wpm: number; accuracy: number; at: number };

const fail = (status: number, error: string, message: string, headers: HeadersInit = {}) =>
  Response.json({ ok: false, error, message } satisfies SubmitResponse, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

const isCount = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < 1e6;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parse<T>(v: unknown): T | null {
  if (v == null) return null;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return null;
    }
  }
  return v as T;
}

export async function POST(request: Request) {
  const down = storeUnavailable();
  if (down) return down;
  try {
    return await handle(request);
  } catch {
    return fail(503, "unavailable", "Couldn't save that result. Try again in a moment.");
  }
}

async function handle(request: Request) {
  const ip = clientIp(request.headers);
  const limit = await rateLimit(`typing-submit:${ip}`, 8, 60);
  if (!limit.ok) {
    return fail(429, "rate_limited", "Too many submissions. Try again in a minute.", {
      "Retry-After": String(limit.retryAfter),
    });
  }

  const read = await readJson(request, 4096);
  if (!read.ok) return read.response;

  const { roundId, name, keystrokes, correct, incorrect, elapsedMs, samples } = read.body;
  if (typeof roundId !== "string" || !UUID.test(roundId)) return fail(400, "bad_request", "Missing round.");
  if (![keystrokes, correct, incorrect, elapsedMs].every(isCount)) return fail(400, "bad_request", "Invalid result.");
  if (!Array.isArray(samples) || samples.length > MAX_SAMPLES || !samples.every((s) => typeof s === "number" && Number.isFinite(s))) {
    return fail(400, "bad_request", "Invalid result.");
  }

  const checked = normalizeName(name);
  if (!checked.ok) return fail(422, "bad_name", checked.message);

  if (await store.get(`typing:used:${roundId}`))
    return fail(409, "round_used", "This round was already submitted. Play another one.");
  const round = parse<Round>(await store.get(`typing:round:${roundId}`));
  if (!round || !isMode(round.mode) || !isWordSet(round.set)) {
    return fail(410, "round_expired", "This round expired. Play another one to submit.");
  }

  const mode = round.mode;
  const durationMs = mode * 1000;
  const k = keystrokes as number;
  const c = correct as number;
  const e = incorrect as number;
  const elapsed = elapsedMs as number;

  const invalid = (why: string) => fail(422, "invalid_result", why);

  if (Date.now() - round.issuedAt < durationMs - LIMITS.elapsedToleranceMs) {
    return invalid("That finished faster than the clock allows.");
  }
  if (Math.abs(elapsed - durationMs) > LIMITS.elapsedToleranceMs) return invalid("The round length didn't match.");
  if (c < 1) return invalid("Type at least one word to make the board.");
  if (c > generateText(round.seed, round.set).length) return invalid("More characters than the round had.");
  if (k < c + e) return invalid("Keystrokes didn't add up.");
  if (k / mode > LIMITS.maxKeystrokesPerSecond) return invalid("That's faster than humanly possible.");
  if (samples.length < mode - 2 || samples.length > mode + 2) return invalid("Timing samples didn't match.");
  if (samples.some((s: number) => s < 0 || s > LIMITS.maxSample)) return invalid("Timing samples didn't match.");

  const wpm = Math.round(wpmFrom(c, durationMs) * 100) / 100;
  const accuracy = Math.round(accuracyFrom(c, e) * 1000) / 1000;
  if (wpm > LIMITS.maxWpm) return invalid("That's faster than humanly possible.");
  if (accuracy < LIMITS.minAccuracy) return invalid(`The board needs at least ${LIMITS.minAccuracy * 100}% accuracy.`);

  // The result is valid: claim the round now (atomic, so concurrent submits can't both pass).
  // Rejected attempts above leave it open, so a flaky network or a fixable name doesn't burn the round.
  const claimed = await store.set(`typing:used:${roundId}`, 1, { nx: true, ex: 60 * 60 });
  if (!claimed) return fail(409, "round_used", "This round was already submitted. Play another one.");
  await store.del(`typing:round:${roundId}`);

  const key = leaderboardKey(mode, round.set);
  const member = checked.name.toLocaleLowerCase();
  // Accuracy breaks ties without ever outweighing a 0.01 WPM difference.
  const score = wpm + accuracy / 1000;
  const existing = await store.zscore(key, member);
  const improved = existing === null || score > existing;
  if (improved) {
    const entry: Entry = { name: checked.name, wpm, accuracy, at: Date.now() };
    await store.set(`${key}:entry:${member}`, entry);
    await store.zadd(key, score, member);
  }

  const [rank, total] = await Promise.all([store.zrevrank(key, member), store.zcard(key)]);
  return Response.json(
    {
      ok: true,
      wpm,
      accuracy,
      rank: (rank ?? 0) + 1,
      total,
      improved,
      best: improved ? wpm : Math.floor((existing as number) * 100) / 100,
    } satisfies SubmitResponse,
    { headers: { "Cache-Control": "no-store" } },
  );
}
