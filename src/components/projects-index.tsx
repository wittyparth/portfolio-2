"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CursorContainer, CursorFollow, CursorProvider } from "@animate-ui/react/primitives/cursor";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { List } from "@/components/animate-ui/icons/list";
import { Rows3 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { techKey } from "@/lib/tech";
import { cn } from "@/lib/utils";
import { FilterTabs } from "./filter-tabs";
import { ProjectEntry } from "./project-entry";
import { LogoStack, ProjectTable } from "./project-table";
import { ViewToggle } from "./view-toggle";
import { TechLogo } from "./tech-logo";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { Tip } from "./tip";

type Status = Project["status"] | "all";
type View = "list" | "grid" | "table";

export const STATUS_DOT: Record<Project["status"], string> = {
  building: "bg-amber-500",
  shipped: "bg-emerald-500",
  archived: "bg-neutral-400",
};

function StatusDot({ status }: { status: Project["status"] }) {
  return (
    <Tip label={status[0].toUpperCase() + status.slice(1)}>
      <span tabIndex={-1} className="grid size-4 place-items-center">
        <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
        <span className="sr-only">{status}</span>
      </span>
    </Tip>
  );
}

/** Every technology used across projects, most used first, for the stack filter. */
function useStackOptions(projects: Project[]) {
  return React.useMemo(() => {
    const counts = new Map<string, { name: string; n: number }>();
    for (const p of projects)
      for (const s of p.stack) {
        const k = techKey(s);
        counts.set(k, { name: counts.get(k)?.name ?? s, n: (counts.get(k)?.n ?? 0) + 1 });
      }
    return [...counts.entries()]
      .sort((a, b) => b[1].n - a[1].n || a[1].name.localeCompare(b[1].name))
      .map(([key, v]) => ({ key, ...v }))
      // One-off tools add noise, not a useful filter.
      .filter((o) => o.n > 1);
  }, [projects]);
}

function StackFilter({
  options, value, onChange,
}: {
  options: { key: string; name: string; n: number }[];
  value: string | null;
  onChange: (k: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by technology">
      <span className="mr-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Stack</span>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <Tip key={o.key} label={`${o.name} · ${o.n}`}>
            <button
              type="button"
              aria-pressed={on}
              aria-label={`Only projects using ${o.name}`}
              onClick={() => onChange(on ? null : o.key)}
              className={cn(
                "group/f grid h-8 min-w-8 place-items-center rounded-full border px-2 text-muted-foreground transition-colors",
                on ? "border-foreground/40 bg-accent" : "border-transparent hover:bg-accent",
              )}
            >
              <TechLogo
                name={o.name}
                className={cn("transition-[filter,opacity] duration-200", !on && "opacity-60 grayscale group-hover/f:opacity-100 group-hover/f:grayscale-0")}
              />
            </button>
          </Tip>
        );
      })}
    </div>
  );
}

/** The studio index: one row per project. On a mouse, the hovered project's cover trails the cursor. */
function IndexList({ projects }: { projects: Project[] }) {
  const [hovered, setHovered] = React.useState<Project | null>(null);

  return (
    <CursorProvider>
      <div className="relative" onPointerLeave={() => setHovered(null)}>
        <Highlight className="rounded-lg bg-accent/70" hover transition={{ type: "spring", stiffness: 380, damping: 34 }}>
          <ul>
            {projects.map((p, i) => {
              const showYear = i === 0 || p.year !== projects[i - 1].year;
              return (
                <li key={p.slug} className={cn(showYear && "mt-4 first:mt-0")}>
                  <HighlightItem value={p.slug} className="-mx-3 rounded-lg">
                    <AnimateIcon animateOnHover asChild>
                      <Link
                        href={`/projects/${p.slug}`}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p)}
                        className="group/row relative grid grid-cols-[3.25rem_1fr_auto] items-center gap-x-4 px-3 py-3 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto_auto]"
                      >
                        <span className={cn("self-start pt-px font-mono text-sm text-muted-foreground tabular-nums", !showYear && "opacity-0")}>{p.year}</span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-[15px] font-medium">
                            {p.name}
                            <StatusDot status={p.status} />
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{p.tagline}</span>
                        </span>
                        <span className="hidden sm:block"><LogoStack stack={p.stack} /></span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                      </Link>
                    </AnimateIcon>
                  </HighlightItem>
                </li>
              );
            })}
          </ul>
        </Highlight>

        <CursorContainer className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          <CursorFollow side="right" align="center" sideOffset={24} className="pointer-events-none z-30">
            <AnimatePresence mode="popLayout">
              {hovered?.cover && (
                <motion.div
                  key={hovered.slug}
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="w-64 overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_48px_-16px_rgb(0_0_0/0.35)]"
                >
                  <Image src={hovered.cover} alt="" width={512} height={320} className="aspect-[16/10] w-full object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </CursorFollow>
        </CursorContainer>
      </div>
    </CursorProvider>
  );
}

function Grid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/projects/${p.slug}`}
            className="group/row flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_16px_32px_-20px_rgb(0_0_0/0.35)]"
          >
            <div className="overflow-hidden border-b border-border bg-muted">
              {p.cover ? (
                <Image
                  src={p.cover}
                  alt=""
                  width={800}
                  height={500}
                  sizes="(min-width: 640px) 22rem, 100vw"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="aspect-[16/10]" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="flex items-center gap-2 font-medium tracking-tight">
                {p.name}
                <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">{p.year}</span>
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.tagline}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <LogoStack stack={p.stack} />
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", STATUS_DOT[p.status], p.status === "building" && "animate-pulse")} />
                  {p.status[0].toUpperCase() + p.status.slice(1)}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The shelf at a glance: totals that count up once, separated by hairlines. */
function Stats({ projects }: { projects: Project[] }) {
  const tools = new Set(projects.flatMap((p) => p.stack.map(techKey))).size;
  const years = projects.map((p) => Number(p.year));
  const ongoing = projects.some((p) => p.status === "building");
  const items = [
    { n: projects.length, label: "Projects" },
    { n: projects.filter((p) => p.status === "shipped").length, label: "Shipped" },
    { n: projects.filter((p) => p.status === "building").length, label: "Building" },
    { n: tools, label: "Tools used" },
  ];
  return (
    <dl className="mt-10 grid grid-cols-2 gap-y-5 sm:grid-cols-[repeat(4,1fr)_auto] sm:divide-x sm:divide-border">
      {items.map((s) => (
        <div key={s.label} className="sm:px-5 sm:first:pl-0">
          <dt className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">{s.label}</dt>
          <dd className="mt-1 text-3xl font-medium tracking-tight tabular-nums">
            <CountingNumber number={s.n} inView inViewOnce />
          </dd>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-1 sm:pl-5">
        <dt className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">Since</dt>
        <dd className="mt-1 flex items-baseline gap-1.5 text-3xl font-medium tracking-tight tabular-nums">
          {Math.min(...years)}
          <span className="text-sm font-normal text-muted-foreground">→ {ongoing ? "now" : Math.max(...years)}</span>
        </dd>
      </div>
    </dl>
  );
}

export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const [status, setStatus] = React.useState<Status>("all");
  const [stack, setStack] = React.useState<string | null>(null);
  const [view, setView] = React.useState<View>("list");
  const stackOptions = useStackOptions(projects);

  const filtered = projects.filter(
    (p) => (status === "all" || p.status === status) && (!stack || p.stack.some((s) => techKey(s) === stack)),
  );
  const filtering = status !== "all" || stack !== null;
  const featured = filtering ? [] : filtered.filter((p) => p.featured);
  const rest = filtering ? filtered : filtered.filter((p) => !p.featured);
  const count = (s: Project["status"]) => projects.filter((p) => p.status === s).length;

  return (
    <div>
      <Stats projects={projects} />
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <FilterTabs
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All", count: projects.length },
            ...(["building", "shipped", "archived"] as const)
              .filter((s) => count(s) > 0)
              .map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1), count: count(s) })),
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
      <div className="mt-4 flex items-center gap-3">
        <StackFilter options={stackOptions} value={stack} onChange={setStack} />
        {stack && (
          <button type="button" onClick={() => setStack(null)} className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-muted-foreground">
          No projects match that. <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => { setStatus("all"); setStack(null); }}>Show everything</button>
        </p>
      )}

      {view === "grid" ? (
        <div className="mt-8"><Grid projects={filtered} /></div>
      ) : view === "table" ? (
        filtered.length > 0 && <div className="mt-8"><ProjectTable projects={filtered} /></div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-10" aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="mb-5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Featured</h2>
              <div className="space-y-6">
                {featured.map((p) => <ProjectEntry key={p.slug} project={p} />)}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section className="mt-14" aria-labelledby="index-heading">
              <h2 id="index-heading" className="mb-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                {filtering ? `${rest.length} ${rest.length === 1 ? "project" : "projects"}` : "Everything else"}
              </h2>
              <IndexList projects={rest} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
