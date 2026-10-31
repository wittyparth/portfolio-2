import { clientIp, rateLimit, store } from "@/lib/store";
import { isMode, isWordSet } from "@/lib/typing";

export type Round = { seed: number; mode: number; set: string; issuedAt: number };

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const limit = await rateLimit(`typing-start:${ip}`, 40, 60);
  if (!limit.ok) {
    return json(
      { ok: false, error: "rate_limited", message: "Too many rounds. Take a breath and try again in a moment." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request", message: "Invalid request." }, 400);
  }
  const { mode, set } = (body ?? {}) as { mode?: unknown; set?: unknown };
  if (!isMode(mode) || !isWordSet(set)) {
    return json({ ok: false, error: "bad_request", message: "Unknown mode." }, 400);
  }

  const roundId = crypto.randomUUID();
  const round: Round = {
    seed: crypto.getRandomValues(new Uint32Array(1))[0],
    mode,
    set,
    issuedAt: Date.now(),
  };
  // Generous expiry: the visitor may idle on the page before their first keystroke.
  await store.set(`typing:round:${roundId}`, round, { ex: 30 * 60 });

  return json({ ok: true, roundId, ...round });
}
