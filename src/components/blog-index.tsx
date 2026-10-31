"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { List } from "@/components/animate-ui/icons/list";
import { Rows3 } from "lucide-react";
import type { Post } from "@/lib/blog";
import { POST_TYPES, type PostType } from "@/lib/post-types";
import { longDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FilterTabs } from "./filter-tabs";
import { ViewToggle } from "./view-toggle";
import { LedgerHead, RowNumber, ledgerList, ledgerRow, ledgerTitle } from "./ledger";

type Item = Pick<Post, "slug" | "title" | "summary" | "date" | "type" | "tags" | "pinned" | "minutes">;
type View = "list" | "grid" | "table";

/** The date as it reads in a list: "Sep 2", with the year only where the list doesn't already say it. */
const stamp = (iso: string) => shortDate(iso);

function TypeBadge({ type, className }: { type: PostType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", POST_TYPES[type].dot)} />
      {POST_TYPES[type].label}
    </span>
  );
}

/** Type dot, date and at most one tag: everything a row needs to say before the title. */
function Meta({ post, year }: { post: Item; year?: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      <TypeBadge type={post.type} />
      <span aria-hidden>·</span>
      <time dateTime={post.date} className="tabular-nums">{year ? longDate(post.date) : stamp(post.date)}</time>
      {post.tags[0] && (
        <>
          <span aria-hidden>·</span>
          <span className="truncate">{post.tags[0]}</span>
        </>
      )}
    </span>
  );
}

/** The title carries a view-transition name, so switching List, Grid and Table slides it between layouts. */
const morph = (slug: string): React.CSSProperties => ({ viewTransitionName: `post-${slug}` });

function Pinned({ post }: { post: Item }) {
  return (
    <AnimateIcon animateOnHover asChild>
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
      >
        <Meta post={post} year />
        <h2 style={morph(post.slug)} className="mt-3 w-fit max-w-[30ch] text-2xl leading-tight font-semibold tracking-tight text-balance [overflow-wrap:anywhere]">{post.title}</h2>
        <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted-foreground">{post.summary}</p>
        <span className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
          {post.minutes} min read
          <span className="ml-auto inline-flex items-center gap-1 text-foreground">
            Read <ArrowRight size={14} />
          </span>
        </span>
      </Link>
    </AnimateIcon>
  );
}

/** List: entries by year, each a type dot, date, title and summary. */
function Journal({ posts }: { posts: Item[] }) {
  const years = React.useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const p of posts) map.set(p.date.slice(0, 4), [...(map.get(p.date.slice(0, 4)) ?? []), p]);
    return [...map];
  }, [posts]);

  return (
    <Highlight className="rounded-xl bg-accent/60" hover transition={{ type: "spring", stiffness: 380, damping: 34 }}>
      <div className="space-y-10">
        {years.map(([year, items]) => (
          <section key={year} aria-label={year}>
            <h3 className="mb-2 flex items-center gap-3 font-mono text-xs text-muted-foreground tabular-nums">
              {year}
              <span className="h-px flex-1 bg-border" />
              <span className="opacity-80">{items.length} {items.length === 1 ? "post" : "posts"}</span>
            </h3>
            <ul>
              {items.map((p) => (
                <li key={p.slug}>
                  <HighlightItem value={p.slug} className="-mx-3 rounded-xl">
                    <AnimateIcon animateOnHover asChild>
                      <Link href={`/blog/${p.slug}`} className="group relative block px-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-xl">
                        <Meta post={p} />
                        <span className="mt-1.5 flex items-start gap-3">
                          <span style={morph(p.slug)} className="text-[16px] leading-snug font-medium tracking-tight text-balance [overflow-wrap:anywhere]">{p.title}</span>
                          <ArrowRight size={14} className="mt-1 ml-auto shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-pretty text-muted-foreground">{p.summary}</span>
                      </Link>
                    </AnimateIcon>
                  </HighlightItem>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Highlight>
  );
}

/** Grid: index cards, type and date above, then title and summary. */
function Cards({ posts }: { posts: Item[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/blog/${p.slug}`}
            className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 motion-reduce:transition-none"
          >
            <Meta post={p} year />
            <h3 style={morph(p.slug)} className="mt-3 w-fit text-[17px] leading-snug font-semibold tracking-tight text-balance [overflow-wrap:anywhere]">{p.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-pretty text-muted-foreground">{p.summary}</p>
            <span className="mt-auto pt-4 text-xs text-muted-foreground tabular-nums">{p.minutes} min read</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const TABLE_COLS = "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[2rem_minmax(0,1fr)_6rem_3.5rem_4.5rem]";

function BlogTable({ posts }: { posts: Item[] }) {
  return (
    <div>
      <LedgerHead
        cols={TABLE_COLS}
        labels={["No.", "Title", { label: "Type", className: "hidden sm:block" }, { label: "Read", className: "hidden sm:block" }, { label: "Date", className: "text-right" }]}
      />
      <ol className={ledgerList}>
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className={cn(TABLE_COLS, ledgerRow)}>
              <RowNumber n={i + 1} />
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span style={morph(p.slug)} className={cn(ledgerTitle, "truncate")}>{p.title}</span>
                                  </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">{p.summary}</span>
              </span>
              <TypeBadge type={p.type} className="hidden sm:inline-flex" />
              <span className="hidden font-mono text-xs text-muted-foreground tabular-nums sm:block">{p.minutes} min</span>
              <time dateTime={p.date} className="text-right font-mono text-xs text-muted-foreground tabular-nums">{shortDate(p.date)}</time>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Index({ posts, initialType, initialTag }: { posts: Item[]; initialType: PostType | "all"; initialTag: string | null }) {
  const [type, setType] = React.useState<PostType | "all">(initialType);
  const [tag, setTag] = React.useState<string | null>(initialTag);
  const [view, setView] = React.useState<View>("list");
  
  // List, Grid and Table share post titles by name, so the browser slides each title to its new place.
  const changeView = (next: View) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setView(next);
    doc.startViewTransition(() => ReactDOM.flushSync(() => setView(next)));
  };

  // Filters live in the URL so they're shareable, written only when the reader changes them.
  const filter = (nextType: PostType | "all", nextTag: string | null) => {
    setType(nextType);
    setTag(nextTag);
    const q = new URLSearchParams();
    if (nextType !== "all") q.set("type", nextType);
    if (nextTag) q.set("tag", nextTag);
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `/blog?${qs}` : "/blog");
  };

  const types = (Object.keys(POST_TYPES) as PostType[])
    .map((t) => ({ t, n: posts.filter((p) => p.type === t).length }))
    .filter((x) => x.n > 0);
  const ofType = posts.filter((p) => type === "all" || p.type === type);
  const filtering = type !== "all" || tag !== null;
  const matching = ofType.filter((p) => !tag || p.tags.includes(tag));
  // The pinned post leads the unfiltered list view only; everywhere else it's just another post.
  const pinned = !filtering && view === "list" ? posts.find((p) => p.pinned) : undefined;
  const list = matching.filter((p) => p !== pinned);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          label="Filter by type"
          value={type}
          onChange={(t) => filter(t, null)}
          options={[
            { value: "all" as const, label: "All", count: posts.length },
            ...types.map(({ t, n }) => ({ value: t, label: POST_TYPES[t].label, count: n })),
          ]}
        />
        <ViewToggle
          value={view}
          onChange={changeView}
          views={[
            { value: "list", label: "List", icon: <List size={14} /> },
            { value: "grid", label: "Grid", icon: <LayoutDashboard size={14} /> },
            { value: "table", label: "Table", icon: <Rows3 className="size-3.5" /> },
          ]}
        />
      </div>
      <div className="mt-8">
        {pinned && <div className="mb-10"><Pinned post={pinned} /></div>}
        {filtering && (
          <p className="mb-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            {matching.length} {matching.length === 1 ? "post" : "posts"}
            {tag && (
              <button
                type="button"
                onClick={() => filter(type, null)}
                aria-label={`Clear tag ${tag}`}
                className="inline-flex min-h-6 items-center gap-1 rounded-full border border-border px-2.5 text-xs text-foreground transition-colors hover:bg-accent"
              >
                {tag} <span aria-hidden>×</span>
              </button>
            )}
          </p>
        )}
        {list.length === 0 && !pinned ? (
          <p className="text-muted-foreground">
            Nothing filed under that yet.{" "}
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => filter("all", null)}>
              Show everything
            </button>
          </p>
        ) : view === "table" ? (
          <BlogTable posts={list} />
        ) : view === "grid" ? (
          <Cards posts={list} />
        ) : (
          <Journal posts={list} />
        )}
      </div>
    </div>
  );
}

function WithParams({ posts }: { posts: Item[] }) {
  const params = useSearchParams();
  const t = params.get("type");
  const tag = params.get("tag");
  return (
    <Index
      posts={posts}
      initialType={t && t in POST_TYPES ? (t as PostType) : "all"}
      initialTag={tag && posts.some((p) => p.tags.includes(tag)) ? tag : null}
    />
  );
}

export function BlogIndex({ posts }: { posts: Item[] }) {
  return (
    <React.Suspense fallback={<Index posts={posts} initialType="all" initialTag={null} />}>
      <WithParams posts={posts} />
    </React.Suspense>
  );
}
