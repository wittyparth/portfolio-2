// Deletes typing test data from the dev namespace: node --env-file=.env.local scripts/clean-typing-keys.mjs
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const patterns = ["dev:typing:*", "dev:rl:typing-*"];
let deleted = 0;
for (const match of patterns) {
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, { match, count: 200 });
    cursor = String(next);
    if (keys.length) deleted += await redis.del(...keys);
  } while (cursor !== "0");
}
console.log(`deleted ${deleted} keys`);
