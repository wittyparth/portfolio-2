import "server-only";
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  RegExpMatcher, TextCensor, asteriskCensorStrategy, englishDataset, englishRecommendedTransformers, keepStartCensorStrategy,
} from "obscenity";
import { store } from "@/lib/store";
import {
  MIN_FILL_MS, PAGE_SIZE, type GuestbookEntry, type GuestbookError,
} from "@/lib/guestbook";

const LIST_KEY = "gb:entries";
const CAP = 1000;
const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type StoredEntry = GuestbookEntry & { ipHash: string };

const g = globalThis as unknown as { __gbSecret?: string };
const SECRET =
  process.env.GUESTBOOK_SECRET ??
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  (g.__gbSecret ??= randomBytes(32).toString("hex"));

const sign = (value: string) => createHmac("sha256", SECRET).update(value).digest("base64url");

export function issueToken(now = Date.now()) {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export function checkToken(token: unknown, now = Date.now()): GuestbookError | null {
  if (typeof token !== "string" || !token.includes(".")) return { code: "token_invalid", message: "Something's off with this form. Reload the page and try again." };
  const [ts, mac] = token.split(".");
  const expected = sign(ts);
  const a = Buffer.from(mac ?? "");
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return { code: "token_invalid", message: "Something's off with this form. Reload the page and try again." };
  const age = now - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > TOKEN_MAX_AGE_MS)
    return { code: "token_invalid", message: "This page has been open a long time. Reload it and sign again." };
  if (age < MIN_FILL_MS) return { code: "too_fast", message: "Whoa, that was fast. Give it a second and send again." };
  return null;
}

export const hashIp = (ip: string) => createHash("sha256").update(`${SECRET}:${ip}`).digest("hex").slice(0, 32);
export const hashText = (text: string) => createHash("sha256").update(text.toLowerCase()).digest("hex").slice(0, 32);

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const censor = new TextCensor().setStrategy(keepStartCensorStrategy(asteriskCensorStrategy()));
const REJECT = new Set([
  "abo", "abeed", "africoon", "arabush", "boonga", "chingchong", "chink", "kike", "negro", "nigger", "fag", "dyke",
  "retard", "spastic", "tranny", "rape", "incest", "bestiality", "blowjob", "buttplug", "deepthroat", "dildo",
  "double penetration", "ejaculate", "felch", "fellatio", "finger bang", "fisting", "gangbang", "handjob", "hentai",
  "jizz", "lubejob", "masturbate", "orgy", "porn", "scat", "semen", "cum", "jerk off",
]);

/** Rejects slurs and explicit content; censors mild swearing. */
export function applyContentPolicy(text: string): { ok: true; text: string } | { ok: false } {
  const matches = matcher.getAllMatches(text, true);
  if (matches.length === 0) return { ok: true, text };
  for (const m of matches) {
    const word = englishDataset.getPayloadWithPhraseMetadata(m).phraseMetadata?.originalWord;
    if (word && REJECT.has(word)) return { ok: false };
  }
  return { ok: true, text: censor.applyTo(text, matches) };
}

const toPublic = ({ id, name, message, createdAt }: StoredEntry): GuestbookEntry => ({ id, name, message, createdAt });

async function readAll(): Promise<{ raw: string; entry: StoredEntry }[]> {
  const raws = await store.lrange(LIST_KEY, 0, CAP - 1);
  const out: { raw: string; entry: StoredEntry }[] = [];
  for (const raw of raws) {
    try {
      const entry = JSON.parse(raw) as StoredEntry;
      if (entry && typeof entry.id === "string") out.push({ raw, entry });
    } catch {
      // skip corrupt rows rather than failing the whole page
    }
  }
  return out;
}

export async function listEntries(cursor?: string | null) {
  const all = await readAll();
  const parsed = Number(cursor);
  const before = cursor && Number.isFinite(parsed) ? parsed : Infinity;
  const older = all.filter(({ entry }) => entry.createdAt < before);
  const page = older.slice(0, PAGE_SIZE).map(({ entry }) => toPublic(entry));
  const nextCursor = older.length > PAGE_SIZE ? String(page[page.length - 1].createdAt) : null;
  return { entries: page, nextCursor, total: all.length };
}

export async function addEntry(name: string, message: string, ipHash: string) {
  const entry: StoredEntry = { id: randomUUID(), name, message, createdAt: Date.now(), ipHash };
  await store.lpush(LIST_KEY, JSON.stringify(entry));
  await store.ltrim(LIST_KEY, 0, CAP - 1);
  return toPublic(entry);
}

export async function deleteEntry(id: string) {
  const all = await readAll();
  const hit = all.find(({ entry }) => entry.id === id);
  if (!hit) return false;
  await store.lrem(LIST_KEY, hit.raw);
  return true;
}

export function fakeEntry(name: string, message: string): GuestbookEntry {
  return { id: randomUUID(), name, message, createdAt: Date.now() };
}

export function tokensMatch(given: string, expected: string) {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
