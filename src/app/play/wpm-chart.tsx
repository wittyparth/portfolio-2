"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

type Props = { net: number[]; raw: number[]; errors: number[] };

const W = 640;
const H = 180;
const PAD = { l: 40, r: 12, t: 12, b: 28 };

export function WpmChart({ net, raw, errors }: Props) {
  const reduce = useReducedMotion();
  const [hover, setHover] = React.useState<number | null>(null);
  const n = Math.max(net.length, 1);
  const max = Math.max(20, ...net, ...raw) * 1.15;
  const step = max > 150 ? 50 : max > 60 ? 25 : 10;
  const top = Math.ceil(max / step) * step;

  const x = (i: number) => PAD.l + (n === 1 ? 0 : (i / (n - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - v / top) * (H - PAD.t - PAD.b);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const grid = Array.from({ length: Math.floor(top / step) + 1 }, (_, i) => i * step);
  const draw = reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } };

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <figure className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Words per minute over ${n} seconds`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {grid.map((g) => (
          <g key={g}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.l - 8} y={y(g)} dy="0.32em" textAnchor="end" className="fill-muted-foreground font-mono text-[13px]">
              {g}
            </text>
          </g>
        ))}
        {[0, Math.floor((n - 1) / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-muted-foreground font-mono text-[13px]">
            {i + 1}s
          </text>
        ))}
        <motion.path d={path(raw)} fill="none" className="stroke-muted-foreground/60" strokeWidth={1.5} strokeDasharray="3 4" strokeLinecap="round" {...draw} />
        <motion.path d={path(net)} fill="none" className="stroke-foreground" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" {...draw} />
        {errors.map((e, i) =>
          e > 0 ? (
            <g key={i} className="stroke-red-500" strokeWidth={1.75} strokeLinecap="round">
              <line x1={x(i) - 3} x2={x(i) + 3} y1={y(raw[i] ?? 0) - 3} y2={y(raw[i] ?? 0) + 3} />
              <line x1={x(i) - 3} x2={x(i) + 3} y1={y(raw[i] ?? 0) + 3} y2={y(raw[i] ?? 0) - 3} />
            </g>
          ) : null,
        )}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} className="stroke-foreground/30" strokeWidth={1} />
            <circle cx={x(hover)} cy={y(net[hover] ?? 0)} r={3.5} className="fill-background stroke-foreground" strokeWidth={2} />
          </g>
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 rounded bg-foreground" />wpm</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-0 w-4 border-t border-dashed border-muted-foreground" />raw</span>
          <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">× errors</span>
        </span>
        <span className="font-mono tabular-nums" aria-live="polite">
          {hover !== null
            ? `${hover + 1}s · ${Math.round(net[hover] ?? 0)} wpm · ${Math.round(raw[hover] ?? 0)} raw${errors[hover] ? ` · ${errors[hover]} err` : ""}`
            : "hover for per-second detail"}
        </span>
      </figcaption>
    </figure>
  );
}
