import { store } from "@/lib/store";
import { isMode, isWordSet, leaderboardKey, type LeaderboardResponse } from "@/lib/typing";

type Entry = { name: string; wpm: number; accuracy: number; at: number };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = Number(searchParams.get("mode") ?? 30);
  const set = searchParams.get("set") ?? "words";
  if (!isMode(mode) || !isWordSet(set)) {
    return Response.json({ ok: false, error: "bad_request", message: "Unknown mode." }, { status: 400 });
  }

  const key = leaderboardKey(mode, set);
  const [top, total] = await Promise.all([store.zrevrangeWithScores(key, 0, 9), store.zcard(key)]);
  const rows = await Promise.all(
    top.map(async ({ member, score }, i) => {
      const raw = await store.get<Entry | string>(`${key}:entry:${member}`);
      const e = typeof raw === "string" ? (JSON.parse(raw) as Entry) : raw;
      return {
        rank: i + 1,
        name: e?.name ?? member,
        wpm: e?.wpm ?? Math.floor(score * 100) / 100,
        accuracy: e?.accuracy ?? 0,
        at: e?.at ?? 0,
      };
    }),
  );

  return Response.json({ entries: rows, total } satisfies LeaderboardResponse, {
    headers: { "Cache-Control": "no-store" },
  });
}
