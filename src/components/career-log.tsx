"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down";
import { AnimateIcon } from "@animate-ui/react/icons";
import { career, careerRoot, type Commit } from "@/lib/content";
import { cn } from "@/lib/utils";
import { TechIcons } from "./tech-icons";

// Short, stable "commit hashes" so the log looks like one.
function hash(s: string) {
  let h = 0x811c9dc5;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const month = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function span(c: Commit) {
  if (!c.end) return null;
  const [y1, m1] = c.start.split("-").map(Number);
  const [y2, m2] = c.end.split("-").map(Number);
  const months = (y2 - y1) * 12 + (m2 - m1);
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(" ");
}

// Each company gets its own lane in the graph, alternating left and right, like branches in `git log --graph`.
const LANES = [20, 54];
const laneOf = (() => {
  const seen = new Map<string, number>();
  return (branch: string) => {
    if (!seen.has(branch)) seen.set(branch, seen.size % 2);
    return seen.get(branch)!;
  };
})();
const lanes = career.map((c) => laneOf(c.branch));

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Splits "Cut regressions by {40}%" into text and an animated count. */
function DiffText({ text }: { text: string }) {
  const parts = text.split(/\{(\d+(?:\.\d+)?)\}/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <CountingNumber
            key={i}
            number={Number(p)}
            decimalPlaces={p.split(".")[1]?.length ?? 0}
            inView
            inViewOnce
            className="font-semibold text-foreground tabular-nums"
          />
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        ),
      )}
    </>
  );
}

const DIFF_STYLE = {
  "+": "bg-emerald-500/[0.07] text-foreground/85 [&>i]:text-emerald-600 dark:[&>i]:text-emerald-400",
  "-": "bg-rose-500/[0.07] text-foreground/85 [&>i]:text-rose-600 dark:[&>i]:text-rose-400",
  "~": "text-muted-foreground [&>i]:text-muted-foreground/60",
};

function Diff({ commit, prev }: { commit: Commit; prev?: Commit }) {
  return (
    <div className="mt-3 mb-1 overflow-hidden rounded-lg border border-border bg-muted/30 font-mono text-[12.5px] leading-relaxed">
      <div className="flex flex-wrap items-center gap-x-2 border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>diff --career</span>
        <span className="truncate">a/{prev ? slug(prev.role) : "dev-null"}</span>
        <span className="truncate">b/{slug(commit.role)}</span>
      </div>
      <p className="px-3 pt-2 text-[11px] text-sky-600 dark:text-sky-400">
        @@ {month(commit.start)} → {commit.end ? month(commit.end) : "now"} · {commit.location} @@
      </p>
      <ul className="py-1.5">
        {commit.diff.map((d, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.25 }}
            className={cn("flex gap-3 px-3 py-1 font-sans text-[13.5px]", DIFF_STYLE[d.kind])}
          >
            <i className="w-2 shrink-0 font-mono not-italic select-none" aria-hidden>{d.kind}</i>
            <span className="sr-only">{d.kind === "+" ? "Added:" : d.kind === "-" ? "Removed:" : "Note:"}</span>
            <span className="text-pretty">
              <DiffText text={d.text} />
            </span>
          </motion.li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-3 py-2 font-sans">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          stack <TechIcons stack={commit.stack} />
        </span>
        {commit.projects?.length ? (
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            shipped
            {commit.projects.map((slug) => (
              <Link
                key={slug}
                href={`/projects/${slug}`}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {slug}
              </Link>
            ))}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** The line between two rows: straight down, or an S-curve when the career changes branch. */
function Connector({ from, to }: { from: number; to: number }) {
  const x1 = LANES[from];
  const x2 = LANES[to];
  return (
    <svg aria-hidden width="80" height="20" className="block text-border" fill="none">
      <path d={x1 === x2 ? `M${x1} 0 V20` : `M${x1} 0 C${x1} 12, ${x2} 8, ${x2} 20`} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CareerLog() {
  const [open, setOpen] = React.useState<string | null>(hash(career[0].role + career[0].start));

  return (
    <div>
      <p className="mb-5 font-mono text-xs text-muted-foreground">
        <span className="text-foreground/60 select-none">$ </span>git log --graph --career
      </p>
      <Highlight className="rounded-lg bg-accent/60" hover transition={{ type: "spring", stiffness: 380, damping: 34 }}>
        <ol>
          {career.map((c, i) => {
            const id = hash(c.role + c.start);
            const isOpen = open === id;
            const lane = lanes[i];
            const x = LANES[lane];
            const head = i === 0 && !c.end;
            const edu = c.tag === "graduated";
            const firstOfBranch = i === 0 || career[i - 1].branch !== c.branch;
            return (
              <li key={id}>
                {i > 0 && <Connector from={lanes[i - 1]} to={lane} />}
                <div className="relative grid grid-cols-[80px_1fr]">
                  {/* The lane: from the node down through any expanded diff. */}
                  <span aria-hidden className="absolute top-[50px] bottom-0 w-[1.5px] bg-border" style={{ left: x - 0.75 }} />
                  {i > 0 && <span aria-hidden className="absolute top-0 h-[8px] w-[1.5px] bg-border" style={{ left: x - 0.75 }} />}
                  {/* The commit node: the company's logo, or a dot when there isn't one. */}
                  <span aria-hidden className="absolute top-[8px] grid size-[42px] -translate-x-1/2 place-items-center" style={{ left: x }}>
                    {head && <span className="absolute -inset-1 animate-ping rounded-[14px] border-2 border-emerald-500/60 motion-reduce:animate-none" />}
                    {c.logo ? (
                      <span
                        className={cn(
                          "relative grid size-[42px] place-items-center overflow-hidden rounded-[12px] p-0.5 border bg-white",
                          head ? "border-emerald-500 ring-2 ring-emerald-500/25" : edu ? "border-amber-500 ring-2 ring-amber-500/25" : "border-border",
                        )}
                      >
                        <Image src={c.logo} alt="" width={42} height={42} className="size-full object-contain" unoptimized={c.logo.endsWith(".svg")} />
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "relative size-3 rounded-full border-2",
                          head ? "border-emerald-500 bg-emerald-500" : "border-foreground/50 bg-background",
                        )}
                      />
                    )}
                  </span>

                  <div className="col-start-2 min-w-0">
                    <HighlightItem value={id} className="-mx-2 rounded-lg">
                      <AnimateIcon animateOnHover asChild>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`${id}-diff`}
                          onClick={() => setOpen(isOpen ? null : id)}
                          className={cn("relative grid w-full grid-cols-[1fr_auto] gap-x-4 rounded-lg px-2 py-2.5 text-left", edu && "bg-gradient-to-r from-amber-500/[0.07] to-transparent")}
                        >
                          <span className="min-w-0">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-mono text-xs text-amber-600 dark:text-amber-400/90">{id}</span>
                              <span className="font-medium tracking-tight">{c.role}</span>
                              <span className={edu ? "font-medium text-amber-700 dark:text-amber-300" : "text-muted-foreground"}>· {c.company}</span>
                              {head && (
                                <span className="rounded-full border border-emerald-500/40 px-1.5 font-mono text-[10.5px] leading-[18px] text-emerald-700 dark:text-emerald-400">
                                  HEAD → {c.branch}
                                </span>
                              )}
                              {!head && firstOfBranch && (
                                <span className="rounded-full border border-border px-1.5 font-mono text-[10.5px] leading-[18px] text-muted-foreground">
                                  {c.branch}
                                </span>
                              )}
                              {edu && (
                                <span className="rounded-full bg-amber-500/15 px-1.5 font-mono text-[10.5px] leading-[18px] text-amber-800 dark:text-amber-200">
                                  IIT · alma mater
                                </span>
                              )}
                              {c.tag && (
                                <span className="rounded-full border border-amber-500/40 px-1.5 font-mono text-[10.5px] leading-[18px] text-amber-700 dark:text-amber-400">
                                  tag: {c.tag}
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-sm text-pretty text-muted-foreground">{c.message}</span>
                          </span>
                          <span className="flex items-start gap-2 pt-0.5 text-right">
                            <span className="font-mono text-xs leading-5 text-muted-foreground tabular-nums">
                              <span className="block">{c.end ? month(c.end).split(" ")[1] : "now"}</span>
                              {span(c) && <span className="block opacity-70">{span(c)}</span>}
                            </span>
                            <ChevronDown
                              size={14}
                              className={cn("mt-1 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")}
                            />
                          </span>
                        </button>
                      </AnimateIcon>
                    </HighlightItem>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`${id}-diff`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 32 }}
                          className="overflow-hidden"
                        >
                          <Diff commit={c} prev={career[i + 1]} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </li>
            );
          })}
          <li>
            <Connector from={lanes[lanes.length - 1]} to={0} />
            <div className="relative grid grid-cols-[80px_1fr] items-center">
              <span aria-hidden className="absolute top-0 h-[14px] w-[1.5px] bg-border" style={{ left: LANES[0] - 0.75 }} />
              <span aria-hidden className="absolute top-[10px] size-2 -translate-x-1/2 rotate-45 border border-foreground/40 bg-background" style={{ left: LANES[0] }} />
              <p className="col-start-2 px-2 py-1.5 font-mono text-xs text-muted-foreground">
                <span className="text-amber-600/80 dark:text-amber-400/70">{hash(careerRoot.message)}</span>{" "}
                {careerRoot.message} <span className="opacity-60">· {careerRoot.year}</span>
              </p>
            </div>
          </li>
        </ol>
      </Highlight>
    </div>
  );
}
