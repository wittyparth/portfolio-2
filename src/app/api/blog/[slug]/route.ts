import { getPost } from "@/lib/blog";
import { clientIp, rateLimit, store, storeUnavailable } from "@/lib/store";
import { PUBLIC_CACHE, apiError, readJson, unavailable } from "@/lib/http";
import { visitorHash } from "@/lib/visitor";

// Per-post views (one per visitor per day) and reactions (up to MAX_REACTIONS per visitor, ever).
const MAX_REACTIONS = 3;
const YEAR = 60 * 60 * 24 * 365;

const visitor = (req: Request) => visitorHash(clientIp(req.headers), 24);

async function stats(slug: string, who: string) {
  const [views, reactions, mine] = await Promise.all([
    store.get<number>(`post:views:${slug}`),
    store.get<number>(`post:reactions:${slug}`),
    store.get<number>(`post:reacted:${slug}:${who}`),
  ]);
  return { views: Number(views ?? 0), reactions: Number(reactions ?? 0), mine: Number(mine ?? 0), max: MAX_REACTIONS };
}

export async function GET(_req: Request, { params }: RouteContext<"/api/blog/[slug]">) {
  try {
    const { slug } = await params;
    if (!getPost(slug)) return apiError(404, "not_found", "Unknown post.");
    // Per-visitor `mine` is omitted so the response is identical for everyone and safe to share from a CDN.
    const [views, reactions] = await Promise.all([
      store.get<number>(`post:views:${slug}`),
      store.get<number>(`post:reactions:${slug}`),
    ]);
    return Response.json(
      { views: Number(views ?? 0), reactions: Number(reactions ?? 0), max: MAX_REACTIONS },
      { headers: { "Cache-Control": PUBLIC_CACHE } },
    );
  } catch {
    return unavailable();
  }
}

export async function POST(req: Request, { params }: RouteContext<"/api/blog/[slug]">) {
  const down = storeUnavailable();
  if (down) return down;
  try {
    const { slug } = await params;
    if (!getPost(slug)) return apiError(404, "not_found", "Unknown post.");

    const read = await readJson(req, 512);
    if (!read.ok) return read.response;
    const action = read.body.action;
    if (action !== "view" && action !== "react") return apiError(400, "bad_request", "Unknown action.");

    const who = visitor(req);
    const limit = await rateLimit(`post:${who}`, 30, 60);
    if (!limit.ok) return apiError(429, "rate_limited", "Slow down a little.", { "Retry-After": String(limit.retryAfter) });

    if (action === "view") {
      if (await store.set(`post:seen:${slug}:${who}`, 1, { nx: true, ex: 60 * 60 * 24 })) await store.incr(`post:views:${slug}`);
    } else {
      // Increment first, then undo if that went over the cap: two racing requests can't both slip past a read-then-write check.
      const key = `post:reacted:${slug}:${who}`;
      const mine = await store.incrExpire(key, YEAR);
      if (mine > MAX_REACTIONS) {
        await store.decr(key);
        return Response.json({ ...(await stats(slug, who)), capped: true }, { headers: { "Cache-Control": "no-store" } });
      }
      await store.incr(`post:reactions:${slug}`);
    }
    return Response.json(await stats(slug, who), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return unavailable();
  }
}
