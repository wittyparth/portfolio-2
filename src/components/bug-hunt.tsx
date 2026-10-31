"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bug } from "lucide-react";
import { Particles, ParticlesEffect } from "@animate-ui/react/primitives/effects/particles";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { useSound } from "./sound";

const ROUND_MS = 20_000;
const BEST_KEY = "bughunt-best";
// Number keys follow a numpad: 7 8 9 on top, 1 2 3 at the bottom.
const KEY_TO_CELL: Record<string, number> = { "7": 0, "8": 1, "9": 2, "4": 3, "5": 4, "6": 5, "1": 6, "2": 7, "3": 8 };

type Phase = "idle" | "playing" | "done";

const BEST_EVENT = "bughunt-best-change";
const subscribeBest = (cb: () => void) => {
  window.addEventListener(BEST_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(BEST_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
};
const readBest = () => Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;

export function BugHunt() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [bug, setBug] = React.useState<{ cell: number; id: number } | null>(null);
  const [squashed, setSquashed] = React.useState<{ cell: number; id: number } | null>(null);
  const [score, setScore] = React.useState(0);
  const best = React.useSyncExternalStore(subscribeBest, readBest, () => 0);
  const [left, setLeft] = React.useState(ROUND_MS);
  const sound = useSound();
  const endsAt = React.useRef(0);
  const pausedLeft = React.useRef<number | null>(null);
  const bugTimer = React.useRef<number | undefined>(undefined);
  const nextId = React.useRef(0);
  const scoreRef = React.useRef(0);

  const spawn = React.useCallback(function spawnBug() {
    window.clearTimeout(bugTimer.current);
    const remaining = Math.max(0, endsAt.current - Date.now());
    const life = 650 + 550 * (remaining / ROUND_MS); // speeds up as time runs out
    setBug((prev) => {
      let cell = Math.floor(Math.random() * 9);
      if (prev && cell === prev.cell) cell = (cell + 1 + Math.floor(Math.random() * 8)) % 9;
      return { cell, id: ++nextId.current };
    });
    bugTimer.current = window.setTimeout(spawnBug, life);
  }, []);

  const finish = React.useCallback(() => {
    window.clearTimeout(bugTimer.current);
    setBug(null);
    setPhase("done");
    if (scoreRef.current > readBest()) {
      localStorage.setItem(BEST_KEY, String(scoreRef.current));
      window.dispatchEvent(new Event(BEST_EVENT));
    }
  }, []);

  const start = () => {
    setScore(0);
    scoreRef.current = 0;
    setSquashed(null);
    endsAt.current = Date.now() + ROUND_MS;
    setLeft(ROUND_MS);
    setPhase("playing");
    spawn();
  };

  React.useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    const tick = () => {
      if (pausedLeft.current === null) {
        const l = endsAt.current - Date.now();
        setLeft(Math.max(0, l));
        if (l <= 0) return finish();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.hidden) {
        pausedLeft.current = endsAt.current - Date.now();
        window.clearTimeout(bugTimer.current);
      } else if (pausedLeft.current !== null) {
        endsAt.current = Date.now() + pausedLeft.current;
        pausedLeft.current = null;
        spawn();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase, finish, spawn]);

  React.useEffect(() => () => window.clearTimeout(bugTimer.current), []);

  const hit = React.useCallback(
    (cell: number) => {
      if (phase !== "playing" || !bug || bug.cell !== cell) return;
      setSquashed({ cell, id: bug.id });
      scoreRef.current += 1;
      setScore(scoreRef.current);
      sound.play("tap");
      spawn();
    },
    [phase, bug, sound, spawn],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== "playing") return;
      const cell = KEY_TO_CELL[e.key];
      if (cell !== undefined) hit(cell);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, hit]);

  return (
    <div className="w-full max-w-[22rem]">
      <div className="mb-3 flex items-baseline justify-between text-sm text-muted-foreground">
        <span className="inline-flex items-baseline gap-1.5">
          Squashed
          <span className="font-mono text-base text-foreground tabular-nums"><SlidingNumber number={score} /></span>
        </span>
        <span className="font-mono tabular-nums">{phase === "playing" ? `${(left / 1000).toFixed(1)}s` : `best ${best}`}</span>
      </div>

      <p className="mb-3 min-h-5 text-sm text-pretty" aria-live="polite">
        {phase === "done" ? (
          score === 0 ? "The bugs won this round." : score >= best ? `New best: ${score} bugs squashed.` : `${score} bugs squashed.`
        ) : phase === "idle" ? (
          <span className="text-muted-foreground">20 seconds. Tap the bugs, or use the number keys 1–9.</span>
        ) : null}
      </p>

      <div className="mb-3 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-foreground transition-[width] duration-100 ease-linear" style={{ width: `${(left / ROUND_MS) * 100}%` }} />
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-2" role="grid" aria-label="Bug hunt board">
          {Array.from({ length: 9 }, (_, i) => {
            const hasBug = phase === "playing" && bug?.cell === i;
            const burst = squashed?.cell === i ? squashed.id : null;
            return (
              <button
                key={i}
                type="button"
                onPointerDown={() => hit(i)}
                disabled={phase !== "playing"}
                aria-label={hasBug ? "Bug here, squash it" : "Empty"}
                className="relative grid aspect-square place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-accent disabled:hover:bg-card disabled:opacity-60"
              >
                <AnimatePresence>
                  {hasBug && (
                    <motion.span
                      key={bug!.id}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    >
                      <Bug className="size-8 text-foreground" strokeWidth={1.75} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {burst !== null && (
                  <Particles key={burst} animate className="pointer-events-none absolute inset-0 grid place-items-center">
                    <span />
                    <ParticlesEffect count={10} radius={26} className="size-1.5 rounded-full bg-foreground" />
                  </Particles>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex h-9 justify-center">
        {phase !== "playing" && (
          <button
            type="button"
            onClick={start}
            className="h-9 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            {phase === "done" ? "Play again" : "Start hunting"}
          </button>
        )}
      </div>
    </div>
  );
}
