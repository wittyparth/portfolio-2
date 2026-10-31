import "server-only";
import { Redis } from "@upstash/redis";

// Upstash in production; an in-memory stand-in when the env vars are missing (local dev).

type SetOptions = { ex?: number; nx?: boolean };

export interface Store {
  readonly persistent: boolean;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: SetOptions): Promise<boolean>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  lpush(key: string, value: string): Promise<void>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  lrem(key: string, value: string): Promise<void>;
  ltrim(key: string, start: number, stop: number): Promise<void>;
  llen(key: string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zscore(key: string, member: string): Promise<number | null>;
  zrevrangeWithScores(key: string, start: number, stop: number): Promise<{ member: string; score: number }[]>;
  zrevrank(key: string, member: string): Promise<number | null>;
  zcard(key: string): Promise<number>;
}

// Keys written outside production get a "dev:" prefix so local testing never touches live data.
const NS = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production" ? "" : "dev:";

function upstash(): Store {
  const r = Redis.fromEnv();
  const raw: Store = {
    persistent: true,
    get: (k) => r.get(k),
    set: async (k, v, o) => {
      const res = o?.nx
        ? await r.set(k, v, o.ex ? { nx: true, ex: o.ex } : { nx: true })
        : await r.set(k, v, o?.ex ? { ex: o.ex } : undefined);
      return res === "OK";
    },
    del: async (k) => void (await r.del(k)),
    incr: (k) => r.incr(k),
    expire: async (k, s) => void (await r.expire(k, s)),
    lpush: async (k, v) => void (await r.lpush(k, v)),
    lrange: async (k, a, b) => (await r.lrange<string>(k, a, b)).map((x) => (typeof x === "string" ? x : JSON.stringify(x))),
    lrem: async (k, v) => void (await r.lrem(k, 0, v)),
    ltrim: async (k, a, b) => void (await r.ltrim(k, a, b)),
    llen: (k) => r.llen(k),
    zadd: async (k, s, m) => void (await r.zadd(k, { score: s, member: m })),
    zscore: (k, m) => r.zscore(k, m),
    zrevrangeWithScores: async (k, a, b) => {
      const flat = await r.zrange<(string | number)[]>(k, a, b, { rev: true, withScores: true });
      const out: { member: string; score: number }[] = [];
      for (let i = 0; i < flat.length; i += 2) out.push({ member: String(flat[i]), score: Number(flat[i + 1]) });
      return out;
    },
    zrevrank: (k, m) => r.zrevrank(k, m),
    zcard: (k) => r.zcard(k),
  };
  if (!NS) return raw;
  return Object.fromEntries(
    Object.entries(raw).map(([name, value]) => [
      name,
      typeof value === "function"
        ? (key: string, ...rest: unknown[]) => (value as (...a: unknown[]) => unknown)(NS + key, ...rest)
        : value,
    ]),
  ) as unknown as Store;
}

type Entry = { value: unknown; expires?: number };

function memory(): Store {
  const g = globalThis as unknown as { __memStore?: Map<string, Entry> };
  const m = (g.__memStore ??= new Map());
  const live = (k: string) => {
    const e = m.get(k);
    if (e?.expires && e.expires < Date.now()) {
      m.delete(k);
      return undefined;
    }
    return e;
  };
  const list = (k: string) => (live(k)?.value as string[] | undefined) ?? [];
  const zset = (k: string) => (live(k)?.value as Map<string, number> | undefined) ?? new Map<string, number>();
  const sorted = (k: string) => [...zset(k).entries()].sort((a, b) => b[1] - a[1]);

  return {
    persistent: false,
    get: async <T,>(k: string) => ((live(k)?.value as T) ?? null),
    set: async (k, v, o) => {
      if (o?.nx && live(k)) return false;
      m.set(k, { value: v, expires: o?.ex ? Date.now() + o.ex * 1000 : undefined });
      return true;
    },
    del: async (k) => void m.delete(k),
    incr: async (k) => {
      const e = live(k);
      const n = Number(e?.value ?? 0) + 1;
      m.set(k, { value: n, expires: e?.expires });
      return n;
    },
    expire: async (k, s) => {
      const e = live(k);
      if (e) e.expires = Date.now() + s * 1000;
    },
    lpush: async (k, v) => void m.set(k, { value: [v, ...list(k)] }),
    lrange: async (k, a, b) => list(k).slice(a, b === -1 ? undefined : b + 1),
    lrem: async (k, v) => void m.set(k, { value: list(k).filter((x) => x !== v) }),
    ltrim: async (k, a, b) => void m.set(k, { value: list(k).slice(a, b + 1) }),
    llen: async (k) => list(k).length,
    zadd: async (k, s, mem) => {
      const z = zset(k);
      z.set(mem, s);
      m.set(k, { value: z });
    },
    zscore: async (k, mem) => zset(k).get(mem) ?? null,
    zrevrangeWithScores: async (k, a, b) =>
      sorted(k).slice(a, b === -1 ? undefined : b + 1).map(([member, score]) => ({ member, score })),
    zrevrank: async (k, mem) => {
      const i = sorted(k).findIndex(([x]) => x === mem);
      return i === -1 ? null : i;
    },
    zcard: async (k) => zset(k).size,
  };
}

export const store: Store =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? upstash() : memory();

export async function rateLimit(id: string, limit: number, windowSeconds: number) {
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${id}:${bucket}`;
  const count = await store.incr(key);
  if (count === 1) await store.expire(key, windowSeconds);
  const retryAfter = windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds);
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}
