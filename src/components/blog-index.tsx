"use client";

import * as React from "react";
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

const day = (iso: string) => String(Number(iso.slice(8, 10)));
const mon = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

function TypeBadge({ type, className }: { type: PostType; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase", className)}>
      <span className={cn("size-1.5 rounded-full", POST_TYPES[type].dot)} />
      {POST_TYPES[type].label}
    </span>
  );
}

function ReadMeter({ minutes, longest }: { minutes: number; longest: number }) {
  return (
    <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground tabular-nums">
      <span aria-hidden className="h-1 w-12 overflow-hidden rounded-full bg-foreground/10">
        <span className="block h-full rounded-full bg-foreground/45" style={{ width: `${Math.max(12, (minutes / longest) * 100)}%` }} />
      </span>
      {minutes} min
    </span>
  );
}

function Pinned({ post }: { post: Item }) {
  return (
    <AnimateIcon animateOnHover asChild>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
      >
        {/* A big faded date in the corner, like a magazine issue number. */}
        <span aria-hidden className="pointer-events-none absolute -top-4 right-4 text-[7rem] leading-none font-semibold tracking-tighter text-foreground/[0.04] tabular-nums select-none">
          {day(post.date).padStart(2, "0")}
        </span>
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10.5px] tracking-[0.12em] text-background uppercase">Start here</span>
          <TypeBadge type={post.type} />
        </span>
        <h2 className="mt-4 max-w-[30ch] text-2xl leading-tight font-semibold tracking-tight text-balance">{post.title}</h2>
        <p className="mt-2.5 max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted-foreground">{post.summary}</p>
        <span className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <time dateTime={post.date}>{longDate(post.date)}</time>
          <span aria-hidden>·</span>
          {post.minutes} min read
          {post.tags.map((t) => <span key={t} className="font-mono text-xs">#{t}</span>)}
          <span className="ml-auto inline-flex items-center gap-1 text-foreground">
            Read <ArrowRight size={14} />
          </span>
        </span>
      </Link>
    </AnimateIcon>
  );
}

/** List: entries by year, each with a tear-off calendar date, type, summary, tags and a reading meter. */
function Journal({ posts, longest }: { posts: Item[]; longest: number }) {
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
              <span className="opacity-70">{items.length} {items.length === 1 ? "post" : "posts"}</span>
            </h3>
            <ul>
              {items.map((p) => (
                <li key={p.slug}>
                  <HighlightItem value={p.slug} className="-mx-3 rounded-xl">
                    <AnimateIcon animateOnHover asChild>
                      <Link href={`/blog/${p.slug}`} className="group relative grid grid-cols-[3.25rem_1fr] gap-x-4 px-3 py-4">
                        <time
                          dateTime={p.date}
                          className="flex h-14 flex-col overflow-hidden rounded-lg border border-border bg-background text-center shadow-[0_1px_0_var(--border)] transition-transform duration-300 group-hover:-rotate-3"
                        >
                          <span className="bg-foreground/[0.06] py-0.5 font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">{mon(p.date)}</span>
                          <span className="grid flex-1 place-items-center text-lg leading-none font-medium tabular-nums">{day(p.date)}</span>
                        </time>
                        <span className="min-w-0">
                          <TypeBadge type={p.type} />
                          <span className="mt-1 flex items-start gap-3">
                            <span className="flex-1 text-[15.5px] leading-snug font-medium tracking-tight text-balance">{p.title}</span>
                            <ArrowRight size={14} className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </span>
                          <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-pretty text-muted-foreground">{p.summary}</span>
                          <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                            {p.tags.map((t) => <span key={t}>#{t}</span>)}
                            <span className="ml-auto"><ReadMeter minutes={p.minutes} longest={longest} /></span>
                          </span>
                        </span>
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

/** Grid: index cards with the date stamped large in the corner. */
function Cards({ posts, longest }: { posts: Item[]; longest: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/blog/${p.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
          >
            <span className="flex items-start justify-between gap-3">
              <TypeBadge type={p.type} className="mt-1" />
              <time dateTime={p.date} className="text-right leading-none">
                <span className="block text-3xl font-semibold tracking-tighter tabular-nums">{day(p.date).padStart(2, "0")}</span>
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{mon(p.date)} {p.date.slice(0, 4)}</span>
              </time>
            </span>
            <h3 className="mt-6 text-[17px] leading-snug font-semibold tracking-tight text-balance">{p.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-pretty text-muted-foreground">{p.summary}</p>
            <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 font-mono text-[11px] text-muted-foreground">
              {p.tags.map((t) => <span key={t}>#{t}</span>)}
              <span className="ml-auto"><ReadMeter minutes={p.minutes} longest={longest} /></span>
            </span>
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
                  <span className={cn(ledgerTitle, "truncate")}>{p.title}</span>
                  {p.pinned && <span className="shrink-0 rounded-full border border-border px-1.5 font-mono text-[10px] leading-4 text-muted-foreground">pinned</span>}
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
  const longest = Math.max(...posts.map((p) => p.minutes));

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
  const tags = [...new Set(ofType.flatMap((p) => p.tags))].sort();
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
          onChange={setView}
          views={[
            { value: "list", label: "List", icon: <List size={14} /> },
            { value: "grid", label: "Grid", icon: <LayoutDashboard size={14} /> },
            { value: "table", label: "Table", icon: <Rows3 className="size-3.5" /> },
          ]}
        />
      </div>
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1" role="group" aria-label="Filter by topic">
          <span className="mr-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Topics</span>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              onClick={() => filter(type, tag === t ? null : t)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors",
                tag === t ? "border-foreground/40 bg-accent text-foreground" : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              #{t}
            </button>
          ))}
          {tag && (
            <button type="button" onClick={() => filter(type, null)} className="ml-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Clear
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        {pinned && <div className="mb-10"><Pinned post={pinned} /></div>}
        {filtering && (
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            {matching.length} {matching.length === 1 ? "post" : "posts"}
            {type !== "all" && ` · ${POST_TYPES[type].label.toLowerCase()}`}
            {tag && ` · #${tag}`}
          </p>
        )}
        {list.length === 0 && !pinned ? (
          <p className="text-muted-foreground">
            Nothing here yet.{" "}
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => filter("all", null)}>
              Show everything
            </button>
          </p>
        ) : view === "table" ? (
          <BlogTable posts={list} />
        ) : view === "grid" ? (
          <Cards posts={list} longest={longest} />
        ) : (
          <Journal posts={list} longest={longest} />
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
