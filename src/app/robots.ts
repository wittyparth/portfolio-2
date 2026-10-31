import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

// Search and AI crawlers are welcome everywhere except the API; a named group overrides "*", so each repeats the disallow.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${profile.site}/sitemap.xml`,
    host: profile.site,
  };
}
