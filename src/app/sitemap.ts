import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/seo";

// Only URLs that are indexable and real. Placeholder posts and projects are noindex, so they stay out.
// lastModified comes from content dates; pages with no honest date omit it rather than claim "now".
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().filter((p) => !p.draft && !p.placeholder);
  const projects = getProjects().filter((p) => !p.placeholder);
  const latestPost = posts.map((p) => p.updated ?? p.date).sort().at(-1);

  const pages: MetadataRoute.Sitemap = [
    { url: siteUrl(""), changeFrequency: "monthly", priority: 1 },
    { url: siteUrl("/projects"), changeFrequency: "monthly", priority: 0.8 },
    ...(posts.length ? [{ url: siteUrl("/blog"), lastModified: latestPost, changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    { url: siteUrl("/posts"), changeFrequency: "weekly", priority: 0.5 },
    { url: siteUrl("/uses"), changeFrequency: "yearly", priority: 0.5 },
    { url: siteUrl("/life"), changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl("/play"), changeFrequency: "yearly", priority: 0.3 },
    { url: siteUrl("/guestbook"), changeFrequency: "weekly", priority: 0.3 },
  ];
  return [
    ...pages,
    ...projects.map((p) => ({ url: siteUrl(`/projects/${p.slug}`), priority: 0.7 })),
    ...posts.map((p) => ({ url: siteUrl(`/blog/${p.slug}`), lastModified: p.updated ?? p.date, priority: 0.6 })),
  ];
}
