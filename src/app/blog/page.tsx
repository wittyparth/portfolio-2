import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { BlogIndex } from "@/components/blog-index";
import { getPosts } from "@/lib/blog";

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  // Placeholder posts are not real writing yet; keep the index out of search until at least one post is real.
  const real = getPosts().some((p) => !p.placeholder);
  return pageMetadata({
    title: "Writing · Partha Saradhi",
    description: "Notes on building AI agents, the APIs they call, and making software people can trust.",
    path: "/blog",
  noindex: !real,
  });
}

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
