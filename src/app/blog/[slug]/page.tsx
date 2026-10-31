import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/mdx-components";
import { SplittingText } from "@animate-ui/react/primitives/texts/splitting";
import { ArticleLayout } from "@/components/article-layout";
import { BackLink } from "@/components/page-header";
import { PostStatsProvider, Reactions, Share, ViewCount } from "@/components/post-stats";
import { getPost, getPosts, neighbours, type Post } from "@/lib/blog";
import { profile } from "@/lib/content";
import { longDate } from "@/lib/format";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  "use cache";
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} · ${profile.name}`,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.date, url: `/blog/${post.slug}`, images: [{ url: `/og/blog/${post.slug}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [`/og/blog/${post.slug}`] },
  };
}

function Neighbour({ post, direction }: { post?: Post; direction: "newer" | "older" }) {
  if (!post) return <div className="hidden sm:block" />;
  const older = direction === "older";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col gap-1.5 rounded-xl border border-border p-4 transition-colors hover:bg-accent/60 ${older ? "sm:items-end sm:text-right" : ""}`}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {!older && <span aria-hidden className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>}
        {older ? "Older post" : "Newer post"}
        {older && <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>}
      </span>
      <span className="text-[15px] leading-snug font-medium text-balance">{post.title}</span>
    </Link>
  );
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  "use cache";
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { default: Body } = await import(`@content/blog/${slug}.mdx`);
  const { newer, older } = neighbours(slug);
  const url = `${profile.site}/blog/${slug}`;

  return (
    <PostStatsProvider slug={slug}>
      <ArticleLayout
        headings={post.headings}
        header={
          <header className="pt-16 sm:pt-20">
            <BackLink href="/blog" label="Writing" />
            <h1 className="mt-6 text-[2rem] leading-[1.15] font-semibold tracking-[-0.03em] text-balance sm:text-[2.25rem]">
              <SplittingText text={post.title} type="chars" stagger={0.012} />
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-pretty text-muted-foreground">{post.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-muted-foreground">
              <time dateTime={post.date}>{longDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{post.minutes} min read</span>
              <span aria-hidden>·</span>
              <ViewCount />
              {post.tags.length > 0 && (
                <ul className="flex gap-1.5 sm:ml-auto">
                  {post.tags.map((t) => (
                    <li key={t}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(t)}`}
                        className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs transition-colors hover:border-foreground/30 hover:text-foreground"
                      >
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </header>
        }
      >
        <article className="mt-10 border-t border-border pt-4 text-[16.5px] leading-[1.75] text-foreground/90">
          <Body components={mdxComponents} />
        </article>

        <footer className="mt-16">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <Reactions />
              <span className="hidden text-sm text-muted-foreground sm:inline">Found this useful?</span>
            </div>
            <Share url={url} title={post.title} />
          </div>
          {post.updated && <p className="mt-4 text-sm text-muted-foreground">Last updated {longDate(post.updated)}.</p>}
          <nav aria-label="More posts" className="mt-10 grid gap-3 sm:grid-cols-2">
            <Neighbour post={newer} direction="newer" />
            <Neighbour post={older} direction="older" />
          </nav>
        </footer>
      </ArticleLayout>
    </PostStatsProvider>
  );
}
