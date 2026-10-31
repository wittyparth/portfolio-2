"use client";

import * as React from "react";
import Image from "next/image";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Heart } from "@/components/animate-ui/icons/heart";
import { MessageCircleMore } from "@/components/animate-ui/icons/message-circle-more";
import { Repeat } from "@/components/animate-ui/icons/repeat";
import type { SocialPost } from "@content/social";
import { profile } from "@/lib/content";
import { compact, longDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BrandIcon } from "./brand-icon";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { Image as ImageIcon, Rows3 } from "lucide-react";
import { FilterTabs } from "./filter-tabs";
import { ViewToggle } from "./view-toggle";
import { List } from "@/components/animate-ui/icons/list";
import {
  LedgerHead,
  RowNumber,
  ledgerList,
  ledgerRow,
  ledgerTitle,
} from "./ledger";

type Filter = "all" | SocialPost["platform"];
const PLATFORM = { x: "X", linkedin: "LinkedIn" } as const;
const LONG = 280;

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value?: number;
  label: string;
}) {
  if (value === undefined) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      aria-label={`${value} ${label}`}
    >
      {icon}
      <span className="tabular-nums">{compact(value)}</span>
    </span>
  );
}

function PostCard({ post }: { post: SocialPost }) {
  const [open, setOpen] = React.useState(false);
  const long = post.text.length > LONG;
  const id = React.useId();

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <header className="flex items-center gap-3">
        <Image
          src={`https://github.com/${profile.github}.png?size=80`}
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full border border-border"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{profile.name}</p>
          <p className="text-xs text-muted-foreground">
            on {PLATFORM[post.platform]} ·{" "}
            <time dateTime={post.date}>{longDate(post.date)}</time>
          </p>
        </div>
        <BrandIcon
          name={post.platform}
          className="size-4 shrink-0 text-muted-foreground"
        />
      </header>

      <AutoHeight
        className="mt-3"
        deps={[open]}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <p
          id={id}
          className={cn(
            "text-[15px] leading-relaxed whitespace-pre-line text-pretty",
            long && !open && "line-clamp-6",
          )}
        >
          {post.text}
        </p>
      </AutoHeight>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="mt-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}

      {post.images?.map((img) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={1200}
          height={750}
          sizes="(min-width: 640px) 21rem, 100vw"
          className="mt-3 h-auto w-full rounded-lg border border-border"
        />
      ))}

      <footer className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <Metric
          icon={<Heart size={13} />}
          value={post.metrics?.likes}
          label="likes"
        />
        <Metric
          icon={<MessageCircleMore size={13} />}
          value={post.metrics?.comments}
          label="comments"
        />
        <Metric
          icon={<Repeat size={13} />}
          value={post.metrics?.reposts}
          label="reposts"
        />
        <AnimateIcon animateOnHover asChild>
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground"
          >
            View on {PLATFORM[post.platform]} <span aria-hidden>↗</span>
          </a>
        </AnimateIcon>
      </footer>
    </article>
  );
}

const TABLE_COLS =
  "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[2rem_minmax(0,1fr)_8rem_4.5rem]";

function PostsTable({ posts }: { posts: SocialPost[] }) {
  return (
    <div>
      <LedgerHead
        cols={TABLE_COLS}
        labels={[
          "No.",
          "Post",
          { label: "Reactions", className: "hidden sm:block" },
          { label: "Date", className: "text-right" },
        ]}
      />
      <ol className={ledgerList}>
        {posts.map((p, i) => {
          const [first, ...rest] = p.text.split("\n").filter(Boolean);
          return (
            <li key={p.url + p.date}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={cn(TABLE_COLS, ledgerRow)}
              >
                <RowNumber n={i + 1} arrow="↗" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <BrandIcon
                      name={p.platform}
                      className="size-3 shrink-0 text-muted-foreground"
                    />
                    <span className={cn(ledgerTitle, "truncate text-[15px]")}>
                      {first}
                    </span>
                    {p.images?.length ? (
                      <ImageIcon
                        aria-label="Has an image"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                    ) : null}
                  </span>
                  {rest.length > 0 && (
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                      {rest.join(" ")}
                    </span>
                  )}
                </span>
                <span className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
                  <Metric
                    icon={<Heart size={12} />}
                    value={p.metrics?.likes}
                    label="likes"
                  />
                  <Metric
                    icon={<MessageCircleMore size={12} />}
                    value={p.metrics?.comments}
                    label="comments"
                  />
                </span>
                <time
                  dateTime={p.date}
                  className="text-right font-mono text-xs text-muted-foreground tabular-nums"
                >
                  {shortDate(p.date)}
                </time>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** List: one column on a timeline, a dated stop for each post. */
function Timeline({ posts }: { posts: SocialPost[] }) {
  return (
    <ol className="relative mt-8 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border sm:before:left-[5.75rem]">
      {posts.map((p) => (
        <li key={p.url + p.date} className="relative grid gap-3 pl-6 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:pl-0">
          <span aria-hidden className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-background bg-foreground/40 ring-1 ring-border sm:left-[calc(5.75rem-5px)]" />
          <time dateTime={p.date} className="font-mono text-xs leading-5 text-muted-foreground tabular-nums sm:pt-0.5 sm:text-right">
            {shortDate(p.date)}
            <span className="block opacity-60">{p.date.slice(0, 4)}</span>
          </time>
          <div>
            <PostCard post={p} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SocialWall({ posts }: { posts: SocialPost[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [view, setView] = React.useState<"wall" | "list" | "table">("wall");
  const sorted = React.useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );
  const shown = sorted.filter((p) => filter === "all" || p.platform === filter);
  const count = (p: SocialPost["platform"]) =>
    posts.filter((x) => x.platform === p).length;
  // Two columns filled alternately, so the newest posts sit at the top of both.
  const columns = [
    shown.filter((_, i) => i % 2 === 0),
    shown.filter((_, i) => i % 2 === 1),
  ];

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          label="Filter by platform"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: posts.length },
            {
              value: "x",
              label: (
                <>
                  <BrandIcon name="x" className="size-3" /> X
                </>
              ),
              count: count("x"),
            },
            {
              value: "linkedin",
              label: (
                <>
                  <BrandIcon name="linkedin" className="size-3" /> LinkedIn
                </>
              ),
              count: count("linkedin"),
            },
          ]}
        />
        <ViewToggle
          value={view}
          onChange={setView}
          views={[
            { value: "wall", label: "Wall", icon: <LayoutDashboard size={14} /> },
            { value: "list", label: "List", icon: <List size={14} /> },
            { value: "table", label: "Table", icon: <Rows3 className="size-3.5" /> },
          ]}
        />
      </div>
      {view === "table" ? (
        <div className="mt-8">
          <PostsTable posts={shown} />
        </div>
      ) : view === "list" ? (
        <Timeline posts={shown} />
      ) : (
        <>
          <div className="mt-8 space-y-4 sm:hidden">
            {shown.map((p) => (
              <PostCard key={p.url + p.date} post={p} />
            ))}
          </div>
          <div className="mt-8 hidden items-start gap-4 sm:grid sm:grid-cols-2">
            {columns.map((col, i) => (
              <div key={i} className="space-y-4">
                {col.map((p) => (
                  <PostCard key={p.url + p.date} post={p} />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
