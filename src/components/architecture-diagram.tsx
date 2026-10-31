"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Clock, Cog, Database, Globe, HardDrive, Layers, Monitor, Orbit, Server, ShieldCheck, Sparkles, Zap, type LucideIcon,
} from "lucide-react";
import { ScrollFade } from "@animate-ui/react/primitives/effects/scroll-fade";
import type { Architecture } from "@/lib/architecture";
import { tech } from "@/lib/tech";
import { cn } from "@/lib/utils";

type Node = Architecture["nodes"][number];
type Edge = Architecture["edges"][number];

const KIND: Record<Node["kind"], { icon: LucideIcon; label: string; tone: string }> = {
  client: { icon: Monitor, label: "Client", tone: "text-emerald-600 dark:text-emerald-400" },
  gateway: { icon: ShieldCheck, label: "Gateway", tone: "text-teal-600 dark:text-teal-400" },
  service: { icon: Server, label: "Service", tone: "text-sky-600 dark:text-sky-400" },
  worker: { icon: Cog, label: "Worker", tone: "text-amber-600 dark:text-amber-400" },
  queue: { icon: Layers, label: "Queue", tone: "text-orange-600 dark:text-orange-400" },
  scheduler: { icon: Clock, label: "Scheduler", tone: "text-amber-600 dark:text-amber-400" },
  database: { icon: Database, label: "Database", tone: "text-indigo-600 dark:text-indigo-400" },
  cache: { icon: Zap, label: "Cache", tone: "text-rose-600 dark:text-rose-400" },
  "vector-db": { icon: Orbit, label: "Vector DB", tone: "text-fuchsia-600 dark:text-fuchsia-400" },
  storage: { icon: HardDrive, label: "Storage", tone: "text-indigo-600 dark:text-indigo-400" },
  llm: { icon: Sparkles, label: "LLM", tone: "text-violet-600 dark:text-violet-400" },
  external: { icon: Globe, label: "External", tone: "text-neutral-500 dark:text-neutral-400" },
};

// Layout, in px. The diagram is drawn at the container's width (never narrower than MIN_W; it scrolls below that).
const MIN_W = 640;
const HEAD = 40;
const NODE_H = 58;
const ROW = 84;
const PAD_X = 8;

type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number; col: number };

function layout(arch: Architecture, width: number) {
  const laneW = width / arch.lanes.length;
  const col = new Map(arch.lanes.map((l, i) => [l.id, i]));
  const boxes = new Map<string, Box>();
  for (const n of arch.nodes) {
    const c = col.get(n.lane)!;
    const w = laneW - PAD_X * 2;
    const x = c * laneW + PAD_X;
    const y = HEAD + n.row * ROW;
    boxes.set(n.id, { x, y, w, h: NODE_H, cx: x + w / 2, cy: y + NODE_H / 2, col: c });
  }
  const rows = Math.max(...arch.nodes.map((n) => n.row)) + 1;
  return { boxes, laneW, height: HEAD + (rows - 1) * ROW + NODE_H + 18 };
}

/** A smooth path between two boxes: side to side across lanes, top/bottom within a lane. */
function route(a: Box, b: Box, offset: number) {
  if (a.col === b.col) {
    const down = b.y > a.y;
    const x1 = a.cx + offset * 1.5;
    const x2 = b.cx + offset * 1.5;
    const y1 = down ? a.y + a.h : a.y;
    const y2 = down ? b.y : b.y + b.h;
    const my = (y1 + y2) / 2;
    return { d: `M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my };
  }
  const right = b.col > a.col;
  const x1 = right ? a.x + a.w : a.x;
  const x2 = right ? b.x : b.x + b.w;
  const y1 = a.cy + offset;
  const y2 = b.cy + offset;
  const dx = Math.max(30, Math.abs(x2 - x1) * 0.45) * (right ? 1 : -1);
  return { d: `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

function NodeIcon({ node }: { node: Node }) {
  const t = node.tech ? tech(node.tech) : null;
  if (t?.path) {
    return (
      <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
        <path d={t.path} />
      </svg>
    );
  }
  const Icon = KIND[node.kind].icon;
  return <Icon className="size-3.5" aria-hidden />;
}

export function ArchitectureDiagram({ data, compact = false }: { data: Architecture; compact?: boolean }) {
  const reduce = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [hover, setHover] = React.useState<string | null>(null);
  const [pinned, setPinned] = React.useState<string | null>(null);
  const active = hover ?? pinned;
  const uid = React.useId().replace(/:/g, "");

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(MIN_W, Math.floor(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = width || MIN_W;
  const { boxes, laneW, height } = React.useMemo(() => layout(data, W), [data, W]);
  const byId = React.useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);

  // Pairs drawn both ways (A→B and B→A) are pulled apart so they don't overlap.
  const edges = React.useMemo(() => {
    const keys = new Set(data.edges.map((e) => `${e.from}>${e.to}`));
    return data.edges.map((e, i) => {
      const twin = keys.has(`${e.to}>${e.from}`);
      const offset = twin ? (e.from < e.to ? -7 : 7) : 0;
      return { ...e, i, ...route(boxes.get(e.from)!, boxes.get(e.to)!, offset) };
    });
  }, [data, boxes]);

  const linked = (e: Edge) => active !== null && (e.from === active || e.to === active);
  const neighbours = React.useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    for (const e of data.edges) {
      if (e.from === active) set.add(e.to);
      if (e.to === active) set.add(e.from);
    }
    return set;
  }, [active, data]);

  const focus = active ? byId.get(active) : null;
  const focusLinks = focus
    ? data.edges
        .filter((e) => e.from === focus.id || e.to === focus.id)
        .map((e) => ({ dir: e.from === focus.id ? "→" : "←", other: byId.get(e.from === focus.id ? e.to : e.from)!, label: e.label }))
    : [];

  return (
    <figure className={cn("not-prose", compact ? "" : "my-8 sm:-mx-4")}>
      <div className={cn("overflow-hidden border border-border bg-card", compact ? "border-0" : "rounded-xl")}>
        {data.title && !compact && (
          <figcaption className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium">{data.title}</span>
            <span className="hidden items-center gap-3 font-mono text-[10.5px] text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5"><span className="h-px w-4 bg-foreground/50" />request</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-foreground/50" />async</span>
              <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dotted border-sky-500" />stream</span>
            </span>
          </figcaption>
        )}

        {compact && (
          <div className="flex h-12 items-center border-b border-border px-4 text-sm font-medium">
            {data.title ?? "Architecture"}
          </div>
        )}
        <ScrollFade orientation="horizontal" className="overflow-x-auto [scrollbar-width:thin]">
          <div ref={wrapRef} className="relative" style={{ width: width ? W : "100%", minWidth: MIN_W, height }}>
            {/* Lanes */}
            {data.lanes.map((l, i) => (
              <div
                key={l.id}
                className={cn("absolute top-0 bottom-0 border-border/70", i > 0 && "border-l border-dashed", i % 2 === 1 && "bg-muted/25")}
                style={{ left: i * laneW, width: laneW }}
              >
                <p className="px-3 pt-3 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{l.label}</p>
              </div>
            ))}

            {/* Edges */}
            <svg className="pointer-events-none absolute inset-0" width={W} height={height} aria-hidden>
              <defs>
                <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0.5 L7.5 4 L0 7.5 z" className="fill-foreground/45" />
                </marker>
                <marker id={`${uid}-arrow-on`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0.5 L7.5 4 L0 7.5 z" className="fill-foreground" />
                </marker>
              </defs>
              {edges.map((e) => {
                const on = linked(e);
                const dim = active !== null && !on;
                return (
                  <g key={e.i} className="transition-opacity duration-300" style={{ opacity: dim ? 0.15 : 1 }}>
                    <motion.path
                      d={e.d}
                      fill="none"
                      markerEnd={`url(#${uid}-arrow${on ? "-on" : ""})`}
                      strokeWidth={on ? 1.8 : 1.25}
                      strokeDasharray={e.style === "async" ? "5 4" : e.style === "stream" ? "2 4" : undefined}
                      strokeLinecap="round"
                      className={cn(
                        e.style === "stream" ? "stroke-sky-500/80" : on ? "stroke-foreground" : "stroke-foreground/40",
                        e.style === "stream" && !reduce && "[animation:arch-march_0.9s_linear_infinite]",
                      )}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 + e.i * 0.04, ease: "easeOut" }}
                    />
                    {/* A packet travels along the edges of whatever you're looking at. */}
                    {on && !reduce && (
                      <circle r="3" className={e.style === "stream" ? "fill-sky-500" : "fill-foreground"}>
                        <animateMotion dur={e.style === "async" ? "2.2s" : "1.4s"} repeatCount="indefinite" path={e.d} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Labels for the focused node's edges, only where they have room (within a lane); the panel lists them all */}
            {edges.filter((e) => linked(e) && boxes.get(e.from)!.col === boxes.get(e.to)!.col).map((e) =>
              e.label ? (
                <span
                  key={`l${e.i}`}
                  className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-foreground shadow-sm"
                  style={{ left: e.mx, top: e.my }}
                >
                  {e.label}
                </span>
              ) : null,
            )}

            {/* Nodes */}
            {data.nodes.map((n, i) => {
              const b = boxes.get(n.id)!;
              const kind = KIND[n.kind];
              const isActive = active === n.id;
              const dim = neighbours !== null && !neighbours.has(n.id);
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  aria-pressed={pinned === n.id}
                  aria-label={`${n.label}: ${kind.label}${n.tech ? `, ${n.tech}` : ""}. ${n.note ?? ""}`}
                  onPointerEnter={(ev) => ev.pointerType === "mouse" && setHover(n.id)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => setPinned(pinned === n.id ? null : n.id)}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 + i * 0.03, duration: 0.3 }}
                  className={cn(
                    "absolute z-10 flex items-center gap-2 rounded-lg border bg-background px-2 text-left shadow-[0_1px_2px_rgb(0_0_0/0.06)] outline-none transition-[opacity,border-color,box-shadow] duration-300",
                    "focus-visible:ring-2 focus-visible:ring-ring/60",
                    isActive ? "border-foreground/60 shadow-[0_6px_20px_-8px_rgb(0_0_0/0.35)]" : "border-border hover:border-foreground/30",
                    dim && "opacity-35",
                  )}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                >
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-md border border-border bg-muted/50", kind.tone)}>
                    <NodeIcon node={n} />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="line-clamp-2 text-[11.5px] font-medium [overflow-wrap:anywhere]">{n.label}</span>
                    <span className="mt-0.5 block truncate font-mono text-[9.5px] text-muted-foreground uppercase">
                      {n.tech ?? kind.label}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </ScrollFade>

        {/* Detail for the hovered or tapped part */}
        <div className="min-h-[4.5rem] border-t border-border px-4 py-3 text-sm" aria-live="polite">
          {focus ? (
            <div>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{focus.label}</span>
                <span className={cn("font-mono text-[10.5px] uppercase", KIND[focus.kind].tone)}>{KIND[focus.kind].label}</span>
                {focus.tech && <span className="font-mono text-[10.5px] text-muted-foreground uppercase">· {focus.tech}</span>}
              </p>
              {focus.note && <p className="mt-1 text-pretty text-muted-foreground">{focus.note}</p>}
              {focusLinks.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {focusLinks.map((l, i) => (
                    <span key={i} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                      {l.dir} {l.other.label}
                      {l.label && <span className="opacity-60"> · {l.label}</span>}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Hover or tap any part to trace what it talks to. {data.nodes.length} parts, {data.edges.length} connections.
              <span className="sm:hidden"> Swipe sideways to see it all.</span>
            </p>
          )}
        </div>
      </div>

      {data.flow && data.flow.length > 0 && !compact && (
        <ol className="mt-5 space-y-2.5">
          {data.flow.map((step, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-foreground/85">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-border font-mono text-[11px] text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <span className="text-pretty">{step}</span>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
