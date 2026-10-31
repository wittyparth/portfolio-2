import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { BlogIndex } from "@/components/blog-index";
import { getPosts } from "@/lib/blog";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: `Writing · ${profile.name}`,
  description: "Notes on building AI agents, the APIs they call, and making software people can trust.",
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function BlogPage() {
  const posts = getPosts().map(({ slug, title, summary, date, type, tags, pinned, minutes }) => ({ slug, title, summary, date, type, tags, pinned, minutes }));
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader
        title="Writing"
        intro={
          <>
            Notes on building AI agents, the APIs they call, and making software people can trust. Also available as{" "}
            <a href="/rss.xml" className="underline decoration-muted-foreground/40 underline-offset-[3px] transition-colors hover:text-foreground">
              RSS
            </a>
            .
          </>
        }
      />
      <BlogIndex posts={posts} />
    </main>
  );
}
