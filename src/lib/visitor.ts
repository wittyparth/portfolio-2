import "server-only";
import { createHash, randomBytes } from "node:crypto";

const g = globalThis as unknown as { __visitorSecret?: string };
let warned = false;

/**
 * Server secret for signing tokens and salting visitor hashes. GUESTBOOK_SECRET if set, else the Redis
 * token (also secret, and the same on every instance). Production refuses a per-instance random fallback.
 */
export function serverSecret(): string {
  const env = process.env.GUESTBOOK_SECRET ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (env) return env;
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    if (!warned) {
      warned = true;
      console.error("[visitor] Set GUESTBOOK_SECRET (or the Upstash env vars) in production. Routes that need it will return 503.");
    }
    throw new Error("GUESTBOOK_SECRET is required in production");
  }
  return (g.__visitorSecret ??= randomBytes(32).toString("hex"));
}

/** Salted hash of an IP, so no raw address is stored long-term. */
export const visitorHash = (ip: string, length = 32) =>
  createHash("sha256").update(`${serverSecret()}:${ip}`).digest("hex").slice(0, length);
