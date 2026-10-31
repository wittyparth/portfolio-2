import { clientIp, rateLimit, store, storeUnavailable } from "@/lib/store";
import { PUBLIC_CACHE, apiError, unavailable } from "@/lib/http";
import { visitorHash } from "@/lib/visitor";

export async function GET() {
  try {
    const views = Number((await store.get<number>("views:site")) ?? 0);
    return Response.json({ views }, { headers: { "Cache-Control": PUBLIC_CACHE } });
  } catch {
    return unavailable();
  }
}

export async function POST(req: Request) {
  const down = storeUnavailable();
  if (down) return down;
  try {
    const who = visitorHash(clientIp(req.headers));
    const limit = await rateLimit(`views:${who}`, 30, 60);
    if (!limit.ok) return apiError(429, "rate_limited", "Slow down a little.", { "Retry-After": String(limit.retryAfter) });
    // Count each visitor once per day.
    const fresh = await store.set(`views:seen:${who}`, 1, { nx: true, ex: 60 * 60 * 24 });
    const views = fresh ? await store.incr("views:site") : Number((await store.get<number>("views:site")) ?? 0);
    return Response.json({ views }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}
