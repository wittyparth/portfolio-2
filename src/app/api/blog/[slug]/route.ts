import { createHash } from "node:crypto";
import { getPost } from "@/lib/blog";
import { clientIp, rateLimit, store } from "@/lib/store";

// Per-post views (one per visitor per day) and reactions (up to MAX_REACTIONS per visitor, ever).
const MAX_REACTIONS = 3;
const YEAR = 60 * 60 * 24 * 365;

// Visitors are keyed by a salted hash, so no raw IP is stored long-term.
const visitor = (req: Request) =>
  createHash("sha256").update(`${process.env.GUESTBOOK_SECRET ?? "portfolio"}:${clientIp(req.headers)}`).digest("hex").slice(0, 24);

async function stats(slug: string, who: string) {
  const [views, reactions, mine] = await Promise.all([
    store.get<number>(`post:views:${slug}`),
    store.get<number>(`post:reactions:${slug}`),
    store.get<number>(`post:reacted:${slug}:${who}`),
  ]);
  return { views: Number(views ?? 0), reactions: Number(reactions ?? 0), mine: Number(mine ?? 0), max: MAX_REACTIONS };
}

export async function GET(req: Request, { params }: RouteContext<"/api/blog/[slug]">) {
  const { slug } = await params;
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 });
  return Response.json(await stats(slug, visitor(req)), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request, { params }: RouteContext<"/api/blog/[slug]">) {
  const { slug } = await params;
  if (!getPost(slug)) return Response.json({ error: "Unknown post" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
  const action = body?.action;
  if (action !== "view" && action !== "react") return Response.json({ error: "Unknown action" }, { status: 400 });

  const who = visitor(req);
  const limit = await rateLimit(`post:${who}`, 30, 60);
  if (!limit.ok) return Response.json({ error: "Slow down a little." }, { status: 429 });

  if (action === "view") {
    if (await store.set(`post:seen:${slug}:${who}`, 1, { nx: true, ex: 60 * 60 * 24 })) await store.incr(`post:views:${slug}`);
  } else {
    const key = `post:reacted:${slug}:${who}`;
    const mine = Number((await store.get<number>(key)) ?? 0);
    if (mine >= MAX_REACTIONS) return Response.json({ ...(await stats(slug, who)), capped: true });
    await store.incr(key);
    await store.expire(key, YEAR);
    await store.incr(`post:reactions:${slug}`);
  }
  return Response.json(await stats(slug, who));
}
