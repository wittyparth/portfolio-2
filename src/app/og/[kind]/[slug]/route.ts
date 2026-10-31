import { getPost } from "@/lib/blog";
import { getProject } from "@/lib/projects";
import { longDate } from "@/lib/format";
import { ogCard } from "@/lib/og";

// Share images: /og/blog/<slug> and /og/projects/<slug>. A route handler rather than opengraph-image files,
// whose generated wrapper reads params outside a Suspense boundary and trips instant-navigation validation.
export async function GET(_req: Request, { params }: RouteContext<"/og/[kind]/[slug]">) {
  const { kind, slug } = await params;
  if (kind === "site") {
    return ogCard({ kicker: "AI Engineer · Lyzr AI", title: "Partha Saradhi Munakala builds AI agents that ship.", footer: "Bengaluru, India" });
  }
  if (kind === "blog") {
    const post = getPost(slug);
    if (!post) return new Response("Not found", { status: 404 });
    return ogCard({ kicker: "Writing", title: post.title, footer: `${longDate(post.date)} · ${post.minutes} min read` });
  }
  if (kind === "projects") {
    const p = getProject(slug);
    if (!p) return new Response("Not found", { status: 404 });
    return ogCard({ kicker: "Projects", title: `${p.name}: ${p.tagline}`, footer: `${p.year} · ${p.stack.slice(0, 4).join(" · ")}` });
  }
  return new Response("Not found", { status: 404 });
}
