"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Bot, Database, Gauge, PhoneCall, Sparkles, Wrench } from "lucide-react";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { MapPin } from "@/components/animate-ui/icons/map-pin";
import { CloudRain } from "@/components/animate-ui/icons/cloud-rain";
import { CloudSun } from "@/components/animate-ui/icons/cloud-sun";
import { CloudMoon } from "@/components/animate-ui/icons/cloud-moon";
import { Flame } from "@/components/animate-ui/icons/flame";
import type { Weather } from "@/lib/live";
import { career, profile } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";

/* ───────────────────────── What I build: a draggable agent ───────────────────────── */

type NodeKey = "agent" | "caller" | "llm" | "tools" | "retrieval" | "evals";
const NODES: Record<NodeKey, { x: number; y: number; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; note: string }> = {
  agent: { x: 160, y: 88, label: "agent", icon: Bot, note: "LangGraph state machines that recover when a step fails." },
  caller: { x: 42, y: 42, label: "phone call", icon: PhoneCall, note: "Voice agents on real phone calls, built at Lyzr AI." },
  llm: { x: 278, y: 40, label: "LLM", icon: Sparkles, note: "Gemini, OpenAI or Claude, picked per task." },
  tools: { x: 286, y: 134, label: "tools", icon: Wrench, note: "Tool calling. MCPForge turns any OpenAPI spec into tools." },
  retrieval: { x: 40, y: 136, label: "retrieval", icon: Database, note: "RAG over Qdrant, grounded in real schemas (NL2SQL)." },
  evals: { x: 160, y: 18, label: "evals", icon: Gauge, note: "50+ test cases per voice agent before it ships." },
};
const W = 320;
const H = 170;
const EDGES: NodeKey[] = ["caller", "llm", "tools", "retrieval", "evals"];

/**
 * The shape of the agents I build. Every node can be dragged (the wires follow), packets run
 * along the wires, and hovering a node explains it.
 */
export function AgentGraph() {
  const [pos, setPos] = React.useState(() =>
    Object.fromEntries(Object.entries(NODES).map(([k, n]) => [k, { x: n.x, y: n.y }])) as Record<NodeKey, { x: number; y: number }>,
  );
  const [focus, setFocus] = React.useState<NodeKey>("agent");
  const [dragging, setDragging] = React.useState<NodeKey | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const packets = React.useRef<(SVGCircleElement | null)[]>([]);
  const posRef = React.useRef(pos);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  // Packets ride the wires: out to a node and back, each on its own phase. Updated directly, no re-render.
  React.useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = (t: number) => {
      const p = posRef.current;
      EDGES.forEach((k, i) => {
        const el = packets.current[i];
        if (!el) return;
        const phase = ((t / 1600 + i * 0.37) % 2 + 2) % 2;
        const f = phase < 1 ? phase : 2 - phase;
        el.setAttribute("cx", String(p.agent.x + (p[k].x - p.agent.x) * f));
        el.setAttribute("cy", String(p.agent.y + (p[k].y - p.agent.y) * f));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const toSvg = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: Math.min(W - 14, Math.max(14, pt.x)), y: Math.min(H - 20, Math.max(14, pt.y)) };
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={(e) => {
          if (!dragging) return;
          const p = toSvg(e);
          if (p) setPos((s) => ({ ...s, [dragging]: p }));
        }}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        role="group"
        aria-label="Diagram of an AI agent: phone call, LLM, tools, retrieval and evals around an agent"
      >
        <defs>
          <pattern id="agent-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" className="fill-foreground/10" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#agent-dots)" />

        {EDGES.map((k) => {
          const lit = focus === k || focus === "agent";
          return (
            <motion.line
              key={k}
              x1={pos.agent.x}
              y1={pos.agent.y}
              x2={pos[k].x}
              y2={pos[k].y}
              strokeWidth={lit ? 1.4 : 1}
              strokeDasharray={k === "evals" ? "3 3" : undefined}
              className={cn("transition-[stroke] duration-300", lit ? "stroke-foreground/45" : "stroke-foreground/15")}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.4 + EDGES.indexOf(k) * 0.08 }}
            />
          );
        })}
        {EDGES.map((k, i) => (
          <circle
            key={k}
            ref={(el) => {
              packets.current[i] = el;
            }}
            r={2.2}
            cx={pos.agent.x}
            cy={pos.agent.y}
            className={cn("transition-[fill] duration-300", focus === k ? "fill-emerald-500" : "fill-foreground/60")}
          />
        ))}

        {(Object.keys(NODES) as NodeKey[]).map((k) => {
          const n = NODES[k];
          const Icon = n.icon;
          const hub = k === "agent";
          const r = hub ? 19 : 14;
          return (
            <g
              key={k}
              transform={`translate(${pos[k].x} ${pos[k].y})`}
              className={cn("outline-none", dragging === k ? "cursor-grabbing" : "cursor-grab")}
              tabIndex={0}
              role="button"
              aria-label={`${n.label}: ${n.note}`}
              onPointerEnter={() => setFocus(k)}
              onFocus={() => setFocus(k)}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture?.(e.pointerId);
                setDragging(k);
                setFocus(k);
              }}
            >
              <motion.g initial={reduce ? false : { scale: 0 }} animate={{ scale: dragging === k ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                {focus === k && <circle r={r + 5} className="fill-none stroke-foreground/20" strokeDasharray="2 3" />}
                <circle
                  r={r}
                  className={cn(
                    "transition-[fill,stroke] duration-300",
                    hub ? "fill-foreground stroke-foreground" : focus === k ? "fill-background stroke-foreground/60" : "fill-background stroke-foreground/20",
                  )}
                />
                <Icon
                  x={hub ? -9 : -7}
                  y={hub ? -9 : -7}
                  width={hub ? 18 : 14}
                  height={hub ? 18 : 14}
                  className={hub ? "text-background" : "text-foreground/80"}
                  strokeWidth={1.8}
                />
              </motion.g>
              <text y={r + 11} textAnchor="middle" className="fill-muted-foreground font-mono text-[8.5px]">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 min-h-[2.5rem] text-[13px] leading-snug text-pretty text-muted-foreground" aria-live="polite">
        <span className="font-mono text-foreground">{NODES[focus].label} · </span>
        {NODES[focus].note}
      </p>
    </div>
  );
}

/* ───────────────────────── Journey: IIT → Pursuit → Lyzr ───────────────────────── */

const JW = 300;
const JH = 116;
const JPATH = "M34 80 C 82 80 104 40 150 40 S 222 72 266 46";
const STOPS = [
  { at: { x: 34, y: 80 }, commit: career.find((c) => c.tag === "graduated")!, when: "2021–25", extra: "LeetCode Knight, 1887" },
  { at: { x: 150, y: 40 }, commit: career[1], when: "2025–26", extra: "Serverless backends on AWS" },
  { at: { x: 266, y: 46 }, commit: career[0], when: "now", extra: "Voice agents and customer AI prototypes" },
];

/** Where I've been, as one drawn line: a pulse travels from IIT to today; hover a stop for the detail. */
export function Journey() {
  const [active, setActive] = React.useState(2);
  const reduce = useReducedMotion();
  const s = STOPS[active];
  const edu = active === 0;

  return (
    <div>
      <div className="relative w-full" style={{ aspectRatio: `${JW} / ${JH}` }}>
        <svg viewBox={`0 0 ${JW} ${JH}`} className="absolute inset-0 size-full" aria-hidden>
          <path d={JPATH} className="fill-none stroke-foreground/10" strokeWidth={6} strokeLinecap="round" />
          <motion.path
            d={JPATH}
            className="fill-none stroke-foreground/50"
            strokeWidth={1.4}
            strokeDasharray="1 0"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.5, ease: [0.65, 0, 0.35, 1] }}
          />
          {!reduce && (
            <circle r={3.2} className="fill-emerald-500">
              <animateMotion dur="3.6s" repeatCount="indefinite" path={JPATH} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
          )}
        </svg>
        {STOPS.map((st, i) => {
          const isEdu = i === 0;
          return (
            <button
              key={st.commit.company}
              type="button"
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${st.commit.company}, ${st.when}`}
              aria-pressed={active === i}
              className="group/stop absolute -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${(st.at.x / JW) * 100}%`, top: `${(st.at.y / JH) * 100}%` }}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 transition-transform duration-300 group-hover/stop:-translate-y-1 group-hover/stop:rotate-[-4deg] group-focus-visible/stop:ring-2",
                  isEdu ? "ring-2 ring-amber-500/70" : active === i ? "ring-foreground/40" : "ring-border",
                )}
              >
                <Image src={st.commit.logo!} alt="" width={40} height={40} unoptimized={st.commit.logo!.endsWith(".svg")} className="size-full rounded-[10px] object-contain" />
              </span>
              <span
                className={cn(
                  "absolute top-full left-1/2 mt-1 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap",
                  isEdu ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground",
                )}
              >
                {st.when}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 min-h-[2.75rem]" aria-live="polite">
        <p className="flex items-center gap-2 text-sm font-medium tracking-tight">
          {s.commit.company}
          {edu && (
            <span className="rounded-full bg-amber-500/15 px-1.5 font-mono text-[10px] leading-4 text-amber-800 dark:text-amber-200">IIT alum</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {s.commit.role} · {s.extra}
        </p>
      </div>
    </div>
  );
}

/* ───────────────────────── Bengaluru, right now ───────────────────────── */

export function useIst() {
  const [t, setT] = React.useState<{ h: number; m: number } | null>(null);
  React.useEffect(() => {
    const tick = () => {
      const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: profile.timezone })
        .format(new Date())
        .split(":")
        .map(Number);
      setT((p) => (p && p.h === h && p.m === m ? p : { h, m }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Clock({ h, m }: { h: number; m: number }) {
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0" aria-hidden>
      <circle cx="20" cy="20" r="18.5" className="fill-background stroke-foreground/20" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="20" y1="3.5" x2="20" y2={i % 3 === 0 ? 7 : 5.5} className="stroke-foreground/40" strokeWidth={i % 3 === 0 ? 1.2 : 0.8} transform={`rotate(${i * 30} 20 20)`} />
      ))}
      <line x1="20" y1="20" x2="20" y2="11" className="stroke-foreground" strokeWidth="1.8" strokeLinecap="round" style={{ transform: `rotate(${(h % 12) * 30 + m * 0.5}deg)`, transformOrigin: "20px 20px", transition: "transform .6s" }} />
      <line x1="20" y1="20" x2="20" y2="6.5" className="stroke-foreground/70" strokeWidth="1.1" strokeLinecap="round" style={{ transform: `rotate(${m * 6}deg)`, transformOrigin: "20px 20px", transition: "transform .6s" }} />
      <circle cx="20" cy="20" r="1.6" className="fill-emerald-500" />
    </svg>
  );
}

/** The sun's path over Bengaluru today (roughly 6:00 to 18:15), with where it is now. */
function SunArc({ h, m }: { h: number; m: number }) {
  const mins = h * 60 + m;
  const rise = 6 * 60;
  const set = 18 * 60 + 15;
  const day = mins >= rise && mins <= set;
  const p = Math.min(1, Math.max(0, (mins - rise) / (set - rise)));
  const a = Math.PI * (1 - p);
  const x = 50 + 42 * Math.cos(a);
  const y = 30 - 24 * Math.sin(a);
  return (
    <svg viewBox="0 0 100 36" className="h-9 w-24 shrink-0" aria-hidden>
      <line x1="2" y1="30" x2="98" y2="30" className="stroke-foreground/15" />
      <path d="M8 30 A42 24 0 0 1 92 30" className="fill-none stroke-foreground/25" strokeDasharray="2 2.5" />
      {day ? (
        <>
          <path d={`M8 30 A42 24 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} className="fill-none stroke-amber-500/70" strokeWidth="1.2" />
          <circle cx={x} cy={y} r="6" className="fill-amber-400/25" />
          <circle cx={x} cy={y} r="3.2" className="fill-amber-400" />
        </>
      ) : (
        <circle cx="50" cy="12" r="3.4" className="fill-foreground/70" />
      )}
    </svg>
  );
}

export function LocalStrip({ weather, streak }: { weather: Weather | null; streak: number | null }) {
  const t = useIst();
  const Icon = weather && /rain|drizzle|shower|storm|thunder/.test(weather.label) ? CloudRain : weather?.isDay === false ? CloudMoon : CloudSun;
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-3">
        {t ? <Clock h={t.h} m={t.m} /> : <span className="size-10" />}
        <div className="leading-tight">
          <p className="inline-flex items-center font-mono text-lg font-medium tabular-nums">
            {t ? (
              <>
                <SlidingNumber number={Math.floor(t.h / 10)} />
                <SlidingNumber number={t.h % 10} />
                <span className="animate-pulse px-px motion-reduce:animate-none">:</span>
                <SlidingNumber number={Math.floor(t.m / 10)} />
                <SlidingNumber number={t.m % 10} />
              </>
            ) : (
              <span className="opacity-0">00:00</span>
            )}
            <span className="ml-1.5 text-[10px] text-muted-foreground">IST</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={12} animateOnHover /> {profile.city}, India
          </p>
        </div>
      </div>
      {t && <SunArc h={t.h} m={t.m} />}
      <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
        {weather && (
          <span className="inline-flex items-center gap-1.5">
            <Icon size={15} animateOnHover />
            <span className="font-mono text-sm text-foreground tabular-nums">{weather.temp}°</span>
            {weather.label}
          </span>
        )}
        {streak !== null && streak > 0 && (
          <Tip label="Consecutive days with a commit">
            <span className="inline-flex cursor-default items-center gap-1">
              <Flame size={15} animateOnHover className="text-orange-500" />
              <span className="font-mono text-sm text-foreground tabular-nums">{streak}</span>
              day streak
            </span>
          </Tip>
        )}
      </div>
    </div>
  );
}
