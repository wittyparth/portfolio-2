"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
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
import { TechLogo } from "./tech-logo";

/* ───────────────────────── What I build: an agent, running ───────────────────────── */

type NodeKey = "agent" | "voice" | "llm" | "tools" | "retrieval" | "evals";
const NODES: Record<NodeKey, { x: number; y: number; label: string; logos: string[]; note: string }> = {
  agent: { x: 160, y: 62, label: "agent", logos: ["LangGraph"], note: "LangGraph state machines that recover when a step fails." },
  voice: { x: 36, y: 26, label: "voice", logos: ["LiveKit"], note: "Voice agents on real phone calls, built at Lyzr AI." },
  llm: { x: 284, y: 26, label: "LLM", logos: ["Claude", "OpenAI API", "Gemini"], note: "Gemini, OpenAI or Claude, picked per task." },
  tools: { x: 284, y: 118, label: "tools", logos: ["MCP"], note: "Tool calling. MCPForge turns any OpenAPI spec into tools." },
  retrieval: { x: 36, y: 118, label: "retrieval", logos: ["Qdrant"], note: "RAG over Qdrant, grounded in real schemas (NL2SQL)." },
  evals: { x: 160, y: 136, label: "evals", logos: ["pytest"], note: "50+ test cases per voice agent before it ships." },
};
const W = 320;
const H = 176;
const STEP = 8;
const SPOKES: Exclude<NodeKey, "agent">[] = ["voice", "llm", "tools", "retrieval", "evals"];
const HOP = 1900;

type Ctx = { weather: Weather | null; time: string | null };
type Hop = { node: Exclude<NodeKey, "agent">; inbound?: boolean; tag: string; line: (c: Ctx) => string };

// One real request, end to end. The weather and the time are live; the rest is how the agents I build behave.
const RUN: Hop[] = [
  { node: "voice", inbound: true, tag: "call", line: () => "“How's Bengaluru right now?”" },
  { node: "llm", tag: "plan", line: () => "weather(), clock(), then answer" },
  { node: "tools", tag: "tool", line: (c) => (c.weather ? `weather → ${c.weather.temp}°C, ${c.weather.label.toLowerCase()}` : "weather → no answer, falling back") },
  { node: "tools", tag: "tool", line: (c) => `clock → ${c.time ?? "--:--"} IST` },
  { node: "retrieval", tag: "rag", line: () => "“chai or coffee?” → chai, after 4pm" },
  { node: "evals", tag: "eval", line: () => "grounded in tool output · pass" },
  {
    node: "voice",
    tag: "reply",
    line: (c) => (c.weather ? `“${c.weather.temp}° and ${c.weather.label.toLowerCase()}. Chai weather.”` : `“It's ${c.time ?? "evening"} here. Chai weather.”`),
  },
];

/**
 * The shape of the agents I build, mid-run: a request hops node to node with live data,
 * the trace prints underneath, and every node can be dragged (the wires follow).
 */
export function AgentGraph({ weather }: { weather: Weather | null }) {
  const [pos, setPos] = React.useState(() =>
    Object.fromEntries(Object.entries(NODES).map(([k, n]) => [k, { x: n.x, y: n.y }])) as Record<NodeKey, { x: number; y: number }>,
  );
  const [count, setCount] = React.useState(0);
  const hop = count % RUN.length;
  // The LLM node trades logos each time a run reaches it (hop 1 of every run).
  const llm = Math.max(0, Math.floor((count - 1) / RUN.length)) % NODES.llm.logos.length;
  const [hover, setHover] = React.useState<NodeKey | null>(null);
  const [dragging, setDragging] = React.useState<NodeKey | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const packet = React.useRef<SVGGElement>(null);
  const posRef = React.useRef(pos);
  const inView = useInView(wrapRef, { margin: "80px" });
  const reduce = useReducedMotion();
  const ist = useIst();
  const time = ist ? `${String(ist.h).padStart(2, "0")}:${String(ist.m).padStart(2, "0")}` : null;

  React.useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  // Advance the run one hop at a time while the tile is on screen.
  React.useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => {
      setCount((c) => c + 1);
    }, HOP);
    return () => window.clearInterval(id);
  }, [reduce, inView]);

  // The packet rides the active wire. Written straight to the DOM, no re-render per frame.
  React.useEffect(() => {
    if (reduce || !inView) return;
    const start = performance.now();
    const h = RUN[hop];
    let raf = 0;
    const tick = (t: number) => {
      const el = packet.current;
      const p = posRef.current;
      const k = Math.min(1, (t - start) / (HOP * 0.62));
      const e = 1 - Math.pow(1 - k, 3);
      const [from, to] = h.inbound ? [p[h.node], p.agent] : [p.agent, p[h.node]];
      el?.setAttribute("transform", `translate(${from.x + (to.x - from.x) * e} ${from.y + (to.y - from.y) * e})`);
      el?.setAttribute("opacity", k < 1 ? "1" : "0");
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hop, reduce, inView]);

  const toBox = (e: React.PointerEvent) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return null;
    return {
      x: Math.min(W - 20, Math.max(20, ((e.clientX - r.left) / r.width) * W)),
      y: Math.min(H - 26, Math.max(18, ((e.clientY - r.top) / r.height) * H)),
    };
  };
  const nudge = (k: NodeKey, dx: number, dy: number) =>
    setPos((s) => ({ ...s, [k]: { x: Math.min(W - 20, Math.max(20, s[k].x + dx)), y: Math.min(H - 26, Math.max(18, s[k].y + dy)) } }));

  const active = RUN[hop].node;
  const ctx: Ctx = { weather, time };
  const shown = (reduce ? [RUN.length - 3, RUN.length - 2, RUN.length - 1] : [count - 2, count - 1, count]).filter((n) => n >= 0);

  return (
    <div ref={wrapRef} className="relative">
      <div ref={boxRef} className="relative w-full select-none" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <pattern id="agent-dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" className="fill-foreground/[0.12]" />
            </pattern>
          </defs>
          <rect x={-8} y={-6} width={W + 16} height={H + 12} fill="url(#agent-dots)" />
          {SPOKES.map((k, i) => {
            const on = k === active || k === hover;
            return (
              <motion.line
                key={k}
                x1={pos.agent.x}
                y1={pos.agent.y}
                x2={pos[k].x}
                y2={pos[k].y}
                strokeWidth={on ? 1.5 : 1}
                strokeDasharray={on ? undefined : "2 4"}
                className={cn("transition-[stroke] duration-500", on ? "stroke-foreground/55" : "stroke-foreground/20")}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
              />
            );
          })}
          {!reduce && (
            <g ref={packet} opacity={0}>
              <circle r={7} className="fill-emerald-500/20" />
              <circle r={3} className="fill-emerald-500" />
            </g>
          )}
        </svg>

        {(Object.keys(NODES) as NodeKey[]).map((k) => {
          const n = NODES[k];
          const hub = k === "agent";
          const live = !reduce && k === active;
          const logo = k === "llm" ? n.logos[llm] : n.logos[0];
          return (
            <button
              key={k}
              type="button"
              title={n.note}
              aria-label={`${n.label}: ${n.note} Draggable; arrow keys move it.`}
              onPointerEnter={() => setHover(k)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setAnnounce(`${n.label}: ${n.note}`)}
              onPointerDown={(e) => {
                setTouched(true);
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging(k);
              }}
              onPointerMove={(e) => {
                if (dragging !== k) return;
                const p = toBox(e);
                if (p) setPos((s) => ({ ...s, [k]: p }));
              }}
              onPointerUp={() => setDragging(null)}
              onPointerCancel={() => setDragging(null)}
              onLostPointerCapture={() => setDragging(null)}
              onKeyDown={(e) => {
                const d = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key];
                if (!d) return;
                e.preventDefault();
                setTouched(true);
                nudge(k, d[0], d[1]);
              }}
              className={cn(
                "group/node absolute flex -translate-x-1/2 -translate-y-[38%] touch-none flex-col items-center gap-1.5 outline-none",
                dragging === k ? "z-20 cursor-grabbing" : "z-10 cursor-grab",
              )}
              style={{ left: `${(pos[k].x / W) * 100}%`, top: `${(pos[k].y / H) * 100}%` }}
            >
              <motion.span
                initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: dragging === k ? 1.12 : live ? 1.06 : 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className={cn(
                  "relative grid place-items-center bg-white shadow-[0_1px_2px_rgb(0_0_0/0.16),0_8px_16px_-8px_rgb(0_0_0/0.45)] ring-1 transition-shadow duration-300 group-focus-visible/node:ring-2 group-focus-visible/node:ring-foreground",
                  hub ? "size-11 rounded-[14px] ring-foreground/50 sm:size-12" : "size-9 rounded-[11px] sm:size-10",
                  !hub && (live ? "ring-2 ring-emerald-500" : "ring-black/10"),
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={logo}
                    initial={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.6, filter: "blur(3px)" }}
                    transition={{ duration: 0.3 }}
                    className="grid place-items-center"
                  >
                    <TechLogo name={logo} className={cn("dark:invert-0", hub ? "size-6 sm:size-7" : "size-5 sm:size-[22px]")} />
                  </motion.span>
                </AnimatePresence>
                {hub && !reduce && (
                  <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-[17px] border border-foreground/20 [animation-duration:2.6s]" />
                )}
              </motion.span>
              <span className={cn("text-xs leading-none transition-colors duration-300", live || hover === k ? "text-foreground" : "text-muted-foreground")}>
                {k === "llm" ? logo.replace(" API", "") : n.label}
              </span>
            </button>
          );
        })}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground"
          animate={{ opacity: touched ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          drag the nodes
        </motion.span>
      </div>

      {/* The trace: the last three hops, newest at the bottom. Mono because it is a log. */}
      <ol aria-hidden className="mt-3 h-[4.4rem] overflow-hidden border-t border-dashed border-border pt-2 font-mono text-[11.5px] leading-[1.35rem]">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((n, row, all) => {
            const i = n % RUN.length;
            const newest = row === all.length - 1;
            const age = all.length - 1 - row;
            return (
            <motion.li
              key={n}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(3px)" }}
              animate={{ opacity: age === 0 ? 1 : age === 1 ? 0.55 : 0.28, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 gap-2.5"
            >
              <span className={cn("w-10 shrink-0", newest ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{RUN[i].tag}</span>
              <span className="truncate text-foreground">{RUN[i].line(ctx)}</span>
            </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      <span className="sr-only" aria-live="polite">{announce}</span>
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
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const inView = useInView(wrapRef, { margin: "80px" });
  // The travelling pulse only runs while the tile is on screen.
  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduce) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView, reduce]);
  const s = STOPS[active];
  const edu = active === 0;

  return (
    <div ref={wrapRef} className="my-auto">
      <div className="relative w-full" style={{ aspectRatio: `${JW} / ${JH}` }}>
        <svg ref={svgRef} viewBox={`0 0 ${JW} ${JH}`} className="absolute inset-0 size-full" aria-hidden>
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
                  "absolute top-full left-1/2 mt-1 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap",
                  isEdu ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground",
                )}
              >
                {st.when}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 min-h-[2.75rem]">
        <p className="flex items-center gap-2 text-sm font-medium tracking-tight">
          {s.commit.company}
          {edu && (
            <span className="rounded-full bg-amber-500/15 px-1.5 font-mono text-[11px] leading-4 text-amber-800 dark:text-amber-200">IIT alum</span>
          )}
        </p>
        <p className="text-xs leading-snug text-muted-foreground">
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
    let id = 0;
    const tick = () => {
      const [h, m] = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: profile.timezone })
        .format(new Date())
        .split(":")
        .map(Number);
      setT((p) => (p && p.h === h && p.m === m ? p : { h, m }));
      // Wake on the next minute boundary, not every second.
      id = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(id);
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
            <span className="ml-1.5 text-[11px] text-muted-foreground">IST</span>
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
        {streak !== null && streak >= 2 && (
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
