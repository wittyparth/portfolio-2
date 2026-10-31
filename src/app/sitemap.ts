import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/projects", "/blog", "/posts", "/uses", "/life", "/play", "/guestbook"].map((path) => ({
    url: `${profile.site}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  const posts = getPosts()
    .filter((p) => !p.draft)
    .map((p) => ({ url: `${profile.site}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.6 }));
  const projects = getProjects().map((p) => ({ url: `${profile.site}/projects/${p.slug}`, priority: 0.8 }));
  return [...pages, ...projects, ...posts];
}
