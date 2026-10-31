"use client";

import * as React from "react";
import { usePref } from "@/hooks/use-pref";
import Link from "next/link";
import { motion } from "motion/react";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down";
import { stack, type StackCategory, type StackLevel } from "@/lib/content";
import { tech, techKey } from "@/lib/tech";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { LayoutGrid } from "lucide-react";
import { FilterTabs } from "./filter-tabs";
import { TechLogo } from "./tech-logo";

// Every category is a constellation. The names are a joke; the labels underneath are not.
const SKY: { category: StackCategory; name: string }[] = [
  { category: "AI / ML", name: "Agentia" },
  { category: "Backend", name: "Serverus" },
  { category: "Data", name: "Tabula" },
  { category: "Frontend", name: "Pixelia" },
  { category: "Infra", name: "Containus" },
  { category: "Tools", name: "Instrumenta" },
];

const LEVEL: Record<StackLevel, { r: number; icon: number; label: string; rank: number }> = {
  daily: { r: 17, icon: 21, label: "Daily", rank: 0 },
  often: { r: 13, icon: 16, label: "Often", rank: 1 },
  dabbled: { r: 9, icon: 12, label: "Dabbled", rank: 2 },
};

const INK = new Set(["000000", "0A0A0A", "181717", "191919"]);

type Star = (typeof stack)[number] & { key: string; x: number; y: number; cluster: number; hex?: string; path?: string };
type Line = { a: Star; b: Star; cluster: number };

/** Lays each category out as a spiral, brightest stars in the middle, and joins every star to its nearest earlier neighbour. */
function chart(cols: number) {
  const BW = 280;
  const BH = cols === 3 ? 270 : 300;
  const step = cols === 3 ? 31 : 29;
  const stars: Star[] = [];
  const lines: Line[] = [];
  SKY.forEach(({ category }, cluster) => {
    const col = cluster % cols;
    const row = Math.floor(cluster / cols);
    const cx = col * BW + BW / 2;
    const cy = row * BH + BH / 2 + 14;
    const members = stack
      .filter((s) => s.category === category)
      .sort((a, b) => LEVEL[a.level].rank - LEVEL[b.level].rank);
    const placed: Star[] = [];
    members.forEach((s, i) => {
      const angle = i * 2.39996 + cluster * 1.3; // the golden angle keeps the spiral even
      const radius = i === 0 ? 0 : step * Math.sqrt(i + 0.35);
      const t = tech(s.name);
      const star: Star = {
        ...s,
        key: techKey(s.name),
        // Rounded so server and browser floating point agree (otherwise hydration mismatches).
        x: Math.round((cx + Math.cos(angle) * radius * 1.18) * 10) / 10,
        y: Math.round((cy + Math.sin(angle) * radius * 0.86) * 10) / 10,
        cluster,
        hex: t.hex && !INK.has(t.hex) ? `#${t.hex}` : undefined,
        path: t.path,
      };
      if (placed.length) {
        const near = placed.reduce((best, p) =>
          Math.hypot(p.x - star.x, p.y - star.y) < Math.hypot(best.x - star.x, best.y - star.y) ? p : best,
        );
        lines.push({ a: near, b: star, cluster });
      }
      placed.push(star);
      stars.push(star);
    });
  });
  return { stars, lines, W: cols * BW, H: Math.ceil(SKY.length / cols) * BH, rowH: BH };
}

// Faint background dust, fixed so it doesn't shimmer between renders.
const DUST = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 7919) % 1000) / 1000,
  y: ((i * 104729) % 997) / 997,
  r: (i % 3) * 0.35 + 0.5,
}));

function StarButton({
  star, W, H, size, dim, selected, onHover, onSelect,
}: {
  star: Star; W: number; H: number; size: number; dim: boolean; selected: boolean;
  onHover: (s: Star | null) => void; onSelect: (s: Star) => void;
}) {
  const level = LEVEL[star.level];
  return (
    <button
      type="button"
      aria-label={`${star.name}, ${level.label.toLowerCase()}`}
      aria-pressed={selected}
      onPointerEnter={() => onHover(star)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(star)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(star)}
      style={{
        left: `${(star.x / W) * 100}%`,
        top: `${(star.y / H) * 100}%`,
        width: level.r * 2 * size,
        height: level.r * 2 * size,
        "--brand": star.hex ?? "var(--foreground)",
      } as React.CSSProperties}
      className={cn(
        "group/star absolute grid after:absolute after:-inset-2 after:content-[''] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background transition-[opacity,color,border-color,box-shadow,scale] duration-300 outline-none",
        "hover:z-10 hover:scale-125 hover:border-(--brand) hover:text-(--brand) hover:shadow-[0_0_18px_-2px_var(--brand)] focus-visible:z-10 focus-visible:scale-125 focus-visible:text-(--brand) focus-visible:ring-2 focus-visible:ring-ring/60",
        star.level === "daily" ? "border-foreground/35" : star.level === "often" ? "border-foreground/20" : "border-foreground/10 [&>img]:opacity-75 [&>svg]:opacity-75",
        selected && "z-10 scale-125 border-(--brand) text-(--brand) shadow-[0_0_22px_-2px_var(--brand)]",
        dim && !selected && "opacity-25",
      )}
    >
      <TechLogo name={star.name} className="pointer-events-none" style={{ width: level.icon * size, height: level.icon * size }} />
      {star.level === "daily" && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 animate-pulse rounded-full border border-foreground/10 motion-reduce:animate-none"
          style={{ animationDuration: `${3 + (star.x % 3)}s` }}
        />
      )}
    </button>
  );
}

function Detail({ star, usedIn, onClose }: { star: Star; usedIn: { slug: string; name: string }[]; onClose: () => void }) {
  const level = LEVEL[star.level];
  return (
    <motion.div
      key={star.key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="mt-4 flex gap-4 rounded-xl border border-border bg-card p-4"
      style={{ "--brand": star.hex ?? "var(--foreground)" } as React.CSSProperties}
      aria-live="polite"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-(--brand)/40 text-(--brand) shadow-[0_0_24px_-6px_var(--brand)]">
        <TechLogo name={star.name} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="font-medium">{star.name}</p>
          <p className="text-xs text-muted-foreground">
            {SKY[star.cluster].name} · {level.label}
          </p>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">{star.take}</p>
        {usedIn.length > 0 && (
          <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            Used in
            {usedIn.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="rounded-full border border-border px-2 py-0.5 text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground">
                {p.name}
              </Link>
            ))}
          </p>
        )}
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center self-start rounded-full text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        ✕
      </button>
    </motion.div>
  );
}

/** Signal bars: three for daily, two for often, one for dabbled. */
function Bars({ level }: { level: StackLevel }) {
  const on = 3 - LEVEL[level].rank;
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((b) => (
        <span key={b} className={cn("w-[3px] rounded-[1px]", b < on ? "bg-foreground/55" : "bg-foreground/12")} style={{ height: 4 + b * 3 }} />
      ))}
    </span>
  );
}

/** The plain view: every tool on a shelf by category, logo, name and how often it gets used. */
function Shelf({
  stars, expanded, selected, onSelect,
}: {
  stars: Star[]; expanded: boolean; selected: Star | null; onSelect: (s: Star) => void;
}) {
  const groups = SKY.map((c, cluster) => ({ ...c, items: stars.filter((s) => s.cluster === cluster) }));
  const shown = expanded ? groups : groups.slice(0, 2);
  return (
    <div className="relative">
      <AutoHeight deps={[expanded]} transition={{ type: "spring", stiffness: 220, damping: 30 }}>
        <div className="space-y-6 pb-1">
          {shown.map((g) => (
            <section key={g.name} aria-label={g.category}>
              <h3 className="mb-2.5 flex items-baseline gap-2 text-sm font-medium text-foreground/80">
                {g.category}
                <span className="tabular-nums opacity-60">{g.items.length}</span>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      aria-pressed={selected?.key === s.key}
                      aria-label={`${s.name}, ${LEVEL[s.level].label.toLowerCase()}`}
                      onClick={() => onSelect(s)}
                      style={{ "--brand": s.hex ?? "var(--foreground)" } as React.CSSProperties}
                      className={cn(
                        "group/tool flex items-center gap-2 rounded-lg border bg-background py-1.5 pr-2.5 pl-2 text-sm transition-[border-color,box-shadow,translate] duration-200 outline-none hover:-translate-y-0.5 hover:border-(--brand)/50 hover:shadow-[0_6px_16px_-8px_var(--brand)] focus-visible:ring-2 focus-visible:ring-ring/50",
                        selected?.key === s.key ? "border-(--brand)/60 shadow-[0_6px_16px_-8px_var(--brand)]" : "border-border",
                      )}
                    >
                      <TechLogo name={s.name} className="size-4 transition-transform duration-300 group-hover/tool:scale-110" />
                      {s.name}
                      <Bars level={s.level} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </AutoHeight>
      {!expanded && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      )}
    </div>
  );
}

export function Stack({ usedIn }: { usedIn: Record<string, { slug: string; name: string }[]> }) {
  const mobile = useIsMobile();
  const cols = mobile ? 2 : 3;
  const { stars, lines, W, H, rowH } = React.useMemo(() => chart(cols), [cols]);
  const [expanded, setExpanded] = React.useState(false);
  const [view, setView] = usePref<"sky" | "shelf">("stack-view", "sky", ["sky", "shelf"]);
  const [hover, setHover] = React.useState<Star | null>(null);
  const [selected, setSelected] = React.useState<Star | null>(null);
  const lit = hover?.cluster ?? selected?.cluster ?? null;
  // Heights are measured in px so the fold can animate; aspect-ratio changes can't.
  const skyRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const el = skyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = width / W;
  const height = scale ? (expanded ? H : rowH - 6) * scale : undefined;
  // Constellation names stay 12px on screen however far the chart is scaled down.
  const labelSize = scale ? Math.round((12 / scale) * 10) / 10 : 14;
  const counts = { daily: 0, often: 0, dabbled: 0 };
  for (const s of stack) counts[s.level]++;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-4">
          {(["daily", "often", "dabbled"] as const).map((l) => (
            <span key={l} className="flex items-center gap-1.5">
              {view === "sky" ? (
                <span
                  className={cn("rounded-full border", l === "daily" ? "size-3 border-foreground/50" : l === "often" ? "size-2.5 border-foreground/30" : "size-2 border-foreground/15")}
                />
              ) : (
                <Bars level={l} />
              )}
              {LEVEL[l].label} <span className="tabular-nums opacity-60">{counts[l]}</span>
            </span>
          ))}
        </span>
        <FilterTabs
          label="Stack view"
          value={view}
          onChange={setView}
          options={[
            { value: "sky", label: <><Sparkles size={14} />Sky</> },
            { value: "shelf", label: <><LayoutGrid className="size-3.5" />Shelf</> },
          ]}
        />
      </div>

      {view === "shelf" ? (
        <Shelf stars={stars} expanded={expanded} selected={selected} onSelect={(st) => setSelected(selected?.key === st.key ? null : st)} />
      ) : (
      <div
        ref={skyRef}
        className="relative overflow-hidden rounded-2xl border border-border bg-[radial-gradient(ellipse_at_top,var(--muted),transparent_70%)] transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={height ? { height } : { aspectRatio: `${W} / ${rowH - 6}` }}
      >
        <div className="absolute inset-x-0 top-0" style={{ aspectRatio: `${W} / ${H}` }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden>
            {DUST.map((d, i) => (
              <circle key={i} cx={d.x * W} cy={d.y * H} r={d.r} className="fill-foreground/15" />
            ))}
            {lines.map((l, i) => (
              <motion.line
                key={i}
                x1={l.a.x}
                y1={l.a.y}
                x2={l.b.x}
                y2={l.b.y}
                strokeWidth={1}
                className={cn(
                  "transition-[stroke,opacity] duration-300",
                  lit === l.cluster ? "stroke-foreground/50" : "stroke-foreground/20",
                  lit !== null && lit !== l.cluster && "opacity-30",
                )}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.15 + (i % 12) * 0.05, ease: "easeOut" }}
              />
            ))}
            {SKY.map((c, i) => {
              const col = i % cols;
              const row = Math.floor(i / cols);
              return (
                <text
                  key={c.name}
                  x={col * 280 + 16}
                  y={row * rowH + 14 + labelSize}
                  fontSize={labelSize}
                  className={cn(
                    "font-medium transition-[fill] duration-300",
                    lit === i ? "fill-foreground" : "fill-muted-foreground",
                  )}
                >
                  {c.name}
                  <tspan className="fill-muted-foreground/70 font-normal"> · {c.category}</tspan>
                </text>
              );
            })}
          </svg>
          {stars.map((s) => (
            <StarButton
              key={s.key}
              star={s}
              W={W}
              H={H}
              size={scale ? Math.min(1, Math.max(0.68, scale)) : 1}
              dim={lit !== null && lit !== s.cluster}
              selected={selected?.key === s.key}
              onHover={setHover}
              onSelect={(st) => setSelected(selected?.key === st.key ? null : st)}
            />
          ))}
        </div>
        {/* Hover label: the star's name, near the bottom of the sky. */}
        {hover && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-foreground/80">
            {hover.name} · {LEVEL[hover.level].label.toLowerCase()}
          </p>
        )}
        {!expanded && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      )}

      {selected && <Detail star={selected} usedIn={usedIn[selected.key] ?? []} onClose={() => setSelected(null)} />}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {view === "sky" ? "Hover a star to light its constellation, tap for where I used it." : "Tap any tool for where I\u2019ve used it."}
        </p>
        <AnimateIcon animateOnHover asChild>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex min-h-7 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? (view === "sky" ? "Fold the sky" : "Fold the shelf") : `Show all ${stack.length}`}
            <ChevronDown size={14} className={cn("transition-transform duration-300", expanded && "rotate-180")} />
          </button>
        </AnimateIcon>
      </div>
    </div>
  );
}
