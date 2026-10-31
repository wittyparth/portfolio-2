import "server-only";

export const PUBLIC_CACHE = "public, s-maxage=30, stale-while-revalidate=300";

export function apiError(status: number, error: string, message: string, headers: HeadersInit = {}) {
  return Response.json({ ok: false, error, message }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Thrown-error fallback for route handlers. */
export const unavailable = () =>
  apiError(503, "unavailable", "Something went wrong on my end. Please try again in a moment.");

/** Reads a JSON object body, enforcing Content-Type and a byte cap. */
export async function readJson(
  request: Request,
  maxBytes = 2048,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; response: Response }> {
  const bad = (status: number, error: string, message: string) => ({ ok: false as const, response: apiError(status, error, message) });
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return bad(415, "unsupported_media", "Send the request as JSON.");
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) return bad(413, "too_large", "That request is too large.");
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return bad(400, "bad_request", "Couldn't read that request.");
  }
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return bad(413, "too_large", "That request is too large.");
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return bad(400, "bad_request", "That request wasn't valid JSON.");
  }
}
