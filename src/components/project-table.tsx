"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CursorContainer, CursorFollow, CursorProvider } from "@animate-ui/react/primitives/cursor";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { TechLogo } from "./tech-logo";
import { LedgerHead, RowNumber, ledgerList, ledgerRow, ledgerTitle } from "./ledger";

const STATUS: Record<Project["status"], { label: string; dot: string }> = {
  building: { label: "Building", dot: "bg-amber-500" },
  shipped: { label: "Shipped", dot: "bg-emerald-500" },
  archived: { label: "Archived", dot: "bg-neutral-400" },
};

const COLS = "grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[2rem_minmax(0,1fr)_7.5rem_5.5rem_3rem]";

/** Overlapping logo chips, like an avatar stack; the rest are summed up as +n. */
export function LogoStack({ stack, max = 4 }: { stack: string[]; max?: number }) {
  const shown = stack.slice(0, max);
  return (
    <span className="flex items-center" aria-label={stack.join(", ")}>
      {shown.map((s, i) => (
        <span
          key={s}
          title={s}
          style={{ zIndex: max - i }}
          className="-ml-1.5 grid size-6 place-items-center rounded-full border border-border bg-background ring-2 ring-background transition-[margin] duration-300 ease-out first:ml-0 group-hover/row:ml-0.5 group-hover/row:first:ml-0"
        >
          <TechLogo name={s} className="size-3.5" />
        </span>
      ))}
      {stack.length > max && (
        <span className="ml-1.5 font-mono text-[11px] text-muted-foreground tabular-nums">+{stack.length - max}</span>
      )}
    </span>
  );
}

/**
 * Projects as a ledger: hairlines between rows and nothing around them.
 * Hovering a row fans its stack out, swaps the number for an arrow, and (on a mouse) trails the cover beside the cursor.
 */
export function ProjectTable({ projects, header = true }: { projects: Project[]; header?: boolean }) {
  const [hovered, setHovered] = React.useState<Project | null>(null);

  return (
    <CursorProvider>
      <div className="relative" onPointerLeave={() => setHovered(null)}>
        {header && <LedgerHead cols={COLS} labels={["No.", "Project", { label: "Stack", className: "hidden sm:block" }, { label: "Status", className: "hidden sm:block" }, { label: "Year", className: "text-right" }]} />}
        <ol className={ledgerList}>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(p)}
                onFocus={() => setHovered(null)}
                className={cn(COLS, ledgerRow)}
              >
                <RowNumber n={i + 1} />

                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className={ledgerTitle}>{p.name}</span>
                    {p.featured && (
                      <span className="rounded-full border border-border px-1.5 font-mono text-[10px] leading-4 text-muted-foreground">featured</span>
                    )}
                    <span className={cn("size-1.5 shrink-0 rounded-full sm:hidden", STATUS[p.status].dot)} aria-label={STATUS[p.status].label} />
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">{p.tagline}</span>
                </span>

                <span className="hidden sm:block">
                  <LogoStack stack={p.stack} />
                </span>

                <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                  <span className={cn("size-1.5 rounded-full", STATUS[p.status].dot, p.status === "building" && "animate-pulse")} />
                  {STATUS[p.status].label}
                </span>

                <span className="text-right font-mono text-xs text-muted-foreground tabular-nums">{p.year}</span>
              </Link>
            </li>
          ))}
        </ol>

        <CursorContainer className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          <CursorFollow side="right" align="center" sideOffset={28} className="pointer-events-none z-30">
            <AnimatePresence mode="popLayout">
              {hovered?.cover && (
                <motion.div
                  key={hovered.slug}
                  initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: -1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  className="w-56 overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_48px_-16px_rgb(0_0_0/0.35)]"
                >
                  <Image src={hovered.cover} alt="" width={448} height={280} className="aspect-[16/10] w-full object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </CursorFollow>
        </CursorContainer>
      </div>
    </CursorProvider>
  );
}
