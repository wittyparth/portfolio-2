import { clientIp, store } from "@/lib/store";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  // Count each visitor once per day.
  const fresh = await store.set(`views:seen:${ip}`, 1, { nx: true, ex: 60 * 60 * 24 });
  const views = fresh ? await store.incr("views:site") : Number((await store.get<number>("views:site")) ?? 0);
  return Response.json({ views });
}
