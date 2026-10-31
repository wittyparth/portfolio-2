import "server-only";
import { createHash, randomBytes } from "node:crypto";

const g = globalThis as unknown as { __visitorSecret?: string };
let warned = false;

/** Server secret for signing tokens and salting visitor hashes. Required in production, no fallback. */
export function serverSecret(): string {
  const env = process.env.GUESTBOOK_SECRET;
  if (env) return env;
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    if (!warned) {
      warned = true;
      console.error("[visitor] GUESTBOOK_SECRET is not set in production. Routes that need it will return 503.");
    }
    throw new Error("GUESTBOOK_SECRET is required in production");
  }
  return (g.__visitorSecret ??= process.env.UPSTASH_REDIS_REST_TOKEN ?? randomBytes(32).toString("hex"));
}

/** Salted hash of an IP, so no raw address is stored long-term. */
export const visitorHash = (ip: string, length = 32) =>
  createHash("sha256").update(`${serverSecret()}:${ip}`).digest("hex").slice(0, length);
