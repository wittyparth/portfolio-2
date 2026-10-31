import { career, profile, socials } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { getProjects } from "@/lib/projects";
import { X_URL, siteUrl } from "@/lib/seo";

// /llms.txt: a plain-Markdown map of the site for AI assistants. Generated from content, so it never drifts.
// Placeholder projects and posts are left out until they are real.
export function GET() {
  const projects = getProjects().filter((p) => !p.placeholder);
  const posts = getPosts().filter((p) => !p.draft && !p.placeholder);
  const edu = career.find((c) => c.company.startsWith("IIT"));

  const lines = [
    `# ${profile.fullName}`,
    "",
    `> ${profile.fullName} is an ${profile.role} at ${profile.company.name} in ${profile.city}, India. He builds AI agents and the backends that make them dependable: voice agents, tool calling, retrieval and evals, mostly in Python and TypeScript.`,
    "",
    ...(edu ? [`He graduated with a B.Tech in Electrical Engineering from ${edu.company} in 2025.`, ""] : []),
    "## About",
    `- [Home](${siteUrl("/")}): who he is, work history, tools, projects and contact`,
    `- [Uses](${siteUrl("/uses")}): hardware and software he works with`,
    `- [Posts](${siteUrl("/posts")}): shorter thoughts from X and LinkedIn`,
    "",
    "## Projects",
    ...projects.map((p) => `- [${p.name}](${siteUrl(`/projects/${p.slug}`)}): ${p.tagline}`),
    `- [All projects](${siteUrl("/projects")})`,
    "",
    ...(posts.length
      ? ["## Writing", ...posts.map((p) => `- [${p.title}](${siteUrl(`/blog/${p.slug}`)}): ${p.summary}`), `- [RSS feed](${siteUrl("/rss.xml")})`, ""]
      : []),
    "## Elsewhere",
    ...socials.map((s) => `- [${s.name}](${s.href})`),
    ...(socials.some((s) => s.href === X_URL) ? [] : [`- [X](${X_URL})`]),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
