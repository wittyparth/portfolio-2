"use client";

import * as React from "react";
import { usePref } from "@/hooks/use-pref";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { flushSync } from "react-dom";
import { CursorContainer, CursorFollow, CursorProvider } from "@animate-ui/react/primitives/cursor";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { List } from "@/components/animate-ui/icons/list";
import { ChevronDown, Rows3 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { techKey } from "@/lib/tech";
import { cn } from "@/lib/utils";
import { FilterTabs } from "./filter-tabs";
import { Cover } from "./project-media";
import { ProjectEntry } from "./project-entry";
import { LogoStack, ProjectTable } from "./project-table";
import { ViewToggle } from "./view-toggle";
import { TechLogo } from "./tech-logo";
import { Tip } from "./tip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Status = Project["status"] | "all";
type View = "list" | "grid" | "table";

/** Shared-element name for a project's title, so it glides between List, Grid and Table. */
export const vtName = (slug: string) => `pt-${slug}`;

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

/** One compact control: shows the chosen technology (logo and name), or "Stack" when nothing is chosen. */
function StackFilter({
  options, value, onChange,
}: {
  options: { key: string; name: string; n: number }[];
  value: string | null;
  onChange: (k: string | null) => void;
}) {
  const current = options.find((o) => o.key === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={current ? `Technology: ${current.name}` : "Filter by technology"}
        className={cn(
          "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          current ? "border-foreground/40 bg-accent text-foreground" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {current ? <TechLogo name={current.name} /> : null}
        {current ? current.name : "Stack"}
        <ChevronDown className="size-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 min-w-48">
        <DropdownMenuRadioGroup value={value ?? "all"} onValueChange={(v) => onChange(v === "all" ? null : v)}>
          <DropdownMenuRadioItem value="all">Any technology</DropdownMenuRadioItem>
          {options.map((o) => (
            <DropdownMenuRadioItem key={o.key} value={o.key}>
              <TechLogo name={o.name} />
              {o.name}
              <span className="ml-auto pr-2 font-mono text-[11px] text-muted-foreground tabular-nums">{o.n}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
                            <span style={{ viewTransitionName: vtName(p.slug) }}>{p.name}</span>
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
                  <Cover src={hovered.cover} placeholder={hovered.placeholder} width={512} height={320} sizes="256px" />
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
                <Cover
                  src={p.cover}
                  placeholder={p.placeholder}
                  width={800}
                  height={500}
                  sizes="(min-width: 768px) 340px, calc(100vw - 3rem)"
                  imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="aspect-[16/10]" />
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="flex items-center gap-2 font-medium tracking-tight">
                <span style={{ viewTransitionName: vtName(p.slug) }}>{p.name}</span>
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

export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const [status, setStatus] = React.useState<Status>("all");
  const [stack, setStack] = React.useState<string | null>(null);
  const [view, setView] = usePref<View>("projects-view", "list", ["list", "grid", "table"]);
  const stackOptions = useStackOptions(projects);
  const reduce = useReducedMotion();

  // Swap views inside a View Transition so each project's title glides to its new place. No-op without support or with reduced motion.
  const changeView = (next: View) => {
    if (next === view) return;
    const start = typeof document !== "undefined" && !reduce && "startViewTransition" in document
      ? (document as Document & { startViewTransition: (cb: () => void) => unknown }).startViewTransition.bind(document)
      : null;
    if (start) start(() => flushSync(() => setView(next)));
    else setView(next);
  };

  const filtered = projects.filter(
    (p) => (status === "all" || p.status === status) && (!stack || p.stack.some((s) => techKey(s) === stack)),
  );
  const filtering = status !== "all" || stack !== null;
  const featured = filtering ? [] : filtered.filter((p) => p.featured);
  const rest = filtering ? filtered : filtered.filter((p) => !p.featured);
  const count = (s: Project["status"]) => projects.filter((p) => p.status === s).length;

  return (
    <div>
      <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-border pt-6">
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
        {stackOptions.length > 0 && <StackFilter options={stackOptions} value={stack} onChange={setStack} />}
        <div className="ml-auto">
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
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-muted-foreground" role="status">
          Nothing matches that combination.{" "}
          <button type="button" className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-foreground" onClick={() => { setStatus("all"); setStack(null); }}>
            Show every project
          </button>
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
              <h2 id="featured-heading" className="mb-5 text-sm font-medium text-muted-foreground">Featured</h2>
              <div className="space-y-6">
                {featured.map((p) => <ProjectEntry key={p.slug} project={p} />)}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section className="mt-14" aria-labelledby="index-heading">
              <h2 id="index-heading" className="mb-3 text-sm font-medium text-muted-foreground">
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
