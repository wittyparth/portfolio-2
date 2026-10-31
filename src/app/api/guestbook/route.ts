import { connection } from "next/server";
import { clientIp, rateLimit, store } from "@/lib/store";
import {
  normalizeMessage, normalizeName, validateFields, type GuestbookError,
} from "@/lib/guestbook";
import {
  addEntry, applyContentPolicy, checkToken, fakeEntry, hashIp, hashText, issueToken, listEntries,
} from "./guestbook-server";

const MAX_BODY_BYTES = 4096;
const DAY = 24 * 60 * 60;

const fail = (status: number, error: GuestbookError, headers?: HeadersInit) =>
  Response.json({ error }, { status, headers });

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  try {
    const page = await listEntries(url.searchParams.get("cursor"));
    return Response.json(
      { ...page, token: url.searchParams.has("token") ? issueToken() : undefined },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail(500, { code: "server_error", message: "Couldn't load the guestbook. Try again in a moment." });
  }
}

export async function POST(request: Request) {
  await connection();

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return fail(415, { code: "unsupported_media", message: "Send the note as JSON." });

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return fail(413, { code: "too_large", message: "That note is far too big." });

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, { code: "invalid_json", message: "Couldn't read that request." });
  }
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES)
    return fail(413, { code: "too_large", message: "That note is far too big." });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return fail(400, { code: "invalid_json", message: "That request wasn't valid JSON." });
  }

  try {
    const ipHash = hashIp(clientIp(request.headers));

    const attempts = await rateLimit(`gb:attempt:${ipHash}`, 20, 600);
    if (!attempts.ok)
      return fail(429, { code: "rate_limited", message: "Too many tries. Take a short break.", retryAfter: attempts.retryAfter },
        { "Retry-After": String(attempts.retryAfter) });

    const name = normalizeName(typeof body.name === "string" ? body.name : "");
    const message = normalizeMessage(typeof body.message === "string" ? body.message : "");

    // Bots fill the hidden field; give them a convincing success and store nothing.
    if (typeof body.company === "string" && body.company.trim() !== "")
      return Response.json({ entry: fakeEntry(name || "Guest", message || "…") }, { status: 201 });

    const tokenError = checkToken(body.token);
    if (tokenError) return fail(tokenError.code === "too_fast" ? 422 : 400, tokenError);

    const fieldError = validateFields(name, message);
    if (fieldError) return fail(422, fieldError);

    const cleanName = applyContentPolicy(name);
    if (!cleanName.ok) return fail(422, { code: "not_allowed", field: "name", message: "Let's keep names friendly." });
    const cleanMessage = applyContentPolicy(message);
    if (!cleanMessage.ok)
      return fail(422, { code: "not_allowed", field: "message", message: "Let's keep it kind. That note can't go up." });

    const burst = await rateLimit(`gb:10m:${ipHash}`, 3, 600);
    const daily = await rateLimit(`gb:day:${ipHash}`, 10, DAY);
    if (!burst.ok || !daily.ok) {
      const retryAfter = !daily.ok ? daily.retryAfter : burst.retryAfter;
      return fail(429, {
        code: "rate_limited",
        message: !daily.ok ? "That's plenty of notes for today. Come back tomorrow." : "You're signing fast. Wait a few minutes and try again.",
        retryAfter,
      }, { "Retry-After": String(retryAfter) });
    }

    const fresh = await store.set(`gb:dup:${ipHash}:${hashText(cleanMessage.text)}`, 1, { nx: true, ex: DAY });
    if (!fresh) return fail(409, { code: "duplicate", field: "message", message: "You already left this exact note." });

    const entry = await addEntry(cleanName.text, cleanMessage.text, ipHash);
    return Response.json({ entry }, { status: 201 });
  } catch {
    return fail(500, { code: "server_error", message: "Something broke on my end. Your note wasn't saved; try again." });
  }
}
