"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { Particles, ParticlesEffect } from "@animate-ui/react/primitives/effects/particles";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { LIMITS, accuracyFrom, consistency, wpmFrom, type Mode, type SubmitResponse, type WordSet } from "@/lib/typing";
import { WpmChart } from "./wpm-chart";

export type Result = {
  mode: Mode;
  set: WordSet;
  roundId: string | null;
  correct: number;
  incorrect: number;
  keystrokes: number;
  elapsedMs: number;
  net: number[];
  raw: number[];
  errors: number[];
};

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "done"; data: Extract<SubmitResponse, { ok: true }> }
  | { status: "error"; message: string; final: boolean };

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function Stat({ label, value, suffix, hint }: { label: string; value: number; suffix?: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xl tabular-nums" title={hint}>
        <CountingNumber number={value} />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </dd>
    </div>
  );
}

export function Results({
  result, onNext, onRetry, onSubmitted, defaultName,
}: {
  result: Result;
  onNext: () => void;
  onRetry: () => void;
  onSubmitted: (name: string) => void;
  defaultName: string;
}) {
  const ms = result.mode * 1000;
  const wpm = wpmFrom(result.correct, ms);
  const typed = result.raw.reduce((a, b) => a + b / 12, 0);
  const raw = wpmFrom(typed, ms);
  const acc = accuracyFrom(result.correct, result.incorrect);
  const cons = consistency(result.raw);

  const pbKey = `typing:pb:${result.mode}:${result.set}`;
  const [pb] = React.useState(() => {
    const previous = Number(localStorage.getItem(pbKey)) || null;
    return { beaten: wpm > 0 && acc >= LIMITS.minAccuracy && (previous === null || wpm > previous), previous };
  });
  const [name, setName] = React.useState(defaultName);
  const [submit, setSubmit] = React.useState<SubmitState>({ status: "idle" });
  const next = React.useRef<HTMLButtonElement>(null);
  const root = React.useRef<HTMLDivElement>(null);
  const mountedAt = React.useRef(0);

  const eligibility = !result.roundId
    ? "This round ran offline, so it can't go on the board."
    : result.correct < 1
      ? "Type at least one word to make the board."
      : acc < LIMITS.minAccuracy
        ? `The board needs ${LIMITS.minAccuracy * 100}% accuracy. You had ${Math.round(acc * 100)}%.`
        : null;

  React.useEffect(() => {
    if (pb.beaten) localStorage.setItem(pbKey, String(Math.round(wpm * 100) / 100));
    // Focus a neutral container, not a button: keys still in flight at the buzzer must not skip the results.
    mountedAt.current = performance.now();
    root.current?.focus({ preventScroll: true });
  }, [pb.beaten, pbKey, wpm]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submit.status === "sending" || submit.status === "done" || !result.roundId) return;
    setSubmit({ status: "sending" });
    try {
      const r = await fetch("/api/typing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundId: result.roundId,
          name,
          keystrokes: result.keystrokes,
          correct: result.correct,
          incorrect: result.incorrect,
          elapsedMs: Math.round(result.elapsedMs),
          samples: result.raw.map((x) => Math.round(x * 100) / 100),
        }),
      });
      const data = (await r.json()) as SubmitResponse;
      if (data.ok) {
        setSubmit({ status: "done", data });
        onSubmitted(name.trim());
      } else {
        // Name problems can be fixed; anything about the round itself can't.
        setSubmit({ status: "error", message: data.message, final: data.error !== "bad_name" && data.error !== "rate_limited" });
      }
    } catch {
      setSubmit({ status: "error", message: "Couldn't reach the board. Check your connection and try again.", final: false });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab" && !(e.target as HTMLElement).closest("form, button, a")) {
      e.preventDefault();
      if (performance.now() - mountedAt.current > 500) onNext();
    }
  };

  return (
    <div ref={root} tabIndex={-1} onKeyDown={onKeyDown} className="outline-none">
      <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-12">
        <div>
          <p className="text-sm text-muted-foreground">
            {result.mode}s · {result.set}
          </p>
          <Particles animate={pb.beaten} className="relative mt-1 inline-flex">
            <p className="font-mono text-7xl leading-none font-semibold tracking-tight tabular-nums">
              <CountingNumber number={Math.round(wpm)} />
            </p>
            <ParticlesEffect count={14} radius={70} spread={360} className="size-1.5 rounded-full bg-foreground" />
          </Particles>
          <p className="mt-1 text-sm text-muted-foreground">words per minute</p>
          <AnimatePresence>
            {pb.beaten && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400"
              >
                <Trophy className="size-3.5" />
                {pb.previous === null ? "First personal best" : `New personal best, up from ${Math.round(pb.previous)}`}
              </motion.p>
            )}
          </AnimatePresence>
          <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
            <Stat label="accuracy" value={Math.round(acc * 100)} suffix="%" />
            <Stat label="raw" value={Math.round(raw)} />
            <Stat label="consistency" value={Math.round(cons)} suffix="%" hint="How steady your speed stayed, second to second" />
            <div>
              <dt className="text-xs text-muted-foreground">characters</dt>
              <dd className="mt-1 font-mono text-xl tabular-nums">
                {result.correct}
                <span className="text-muted-foreground">/</span>
                <span className="text-red-600 dark:text-red-400">{result.incorrect}</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0 self-end">
          <WpmChart net={result.net} raw={result.raw} errors={result.errors} />
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <AutoHeight deps={[submit.status, eligibility]}>
          {eligibility ? (
            <p className="text-sm text-muted-foreground">{eligibility}</p>
          ) : submit.status === "done" ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="font-medium">
                {submit.data.improved ? "You're on the board" : "Saved, but your best still stands"}:
              </span>
              <span>
                <span className="font-mono tabular-nums">{ordinal(submit.data.rank)}</span> of{" "}
                <span className="font-mono tabular-nums">{submit.data.total}</span> on the {result.mode}s board
              </span>
              {!submit.data.improved && (
                <span className="text-muted-foreground">
                  (best <span className="font-mono">{Math.round(submit.data.best)}</span> wpm)
                </span>
              )}
            </div>
          ) : (
            <form onSubmit={send} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <label htmlFor="board-name" className="sr-only">Name for the leaderboard</label>
                <input
                  id="board-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (submit.status === "error" && !submit.final) setSubmit({ status: "idle" });
                  }}
                  maxLength={40}
                  placeholder="Your name for the board"
                  autoComplete="nickname"
                  disabled={submit.status === "sending" || (submit.status === "error" && submit.final)}
                  aria-invalid={submit.status === "error" && !submit.final}
                  aria-describedby="board-msg"
                  className="h-10 w-full rounded-full border border-border bg-background px-4 text-[16px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-foreground/40 aria-[invalid=true]:border-red-500/60 sm:text-sm"
                />
                <p id="board-msg" className="mt-2 min-h-4 px-4 text-xs text-muted-foreground" aria-live="polite">
                  {submit.status === "error" ? (
                    <span className="text-red-600 dark:text-red-400">{submit.message}</span>
                  ) : (
                    "Your best score per name is kept."
                  )}
                </p>
              </div>
              <button
                type="submit"
                disabled={!name.trim() || submit.status === "sending" || (submit.status === "error" && submit.final)}
                className="h-10 shrink-0 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {submit.status === "sending" ? "Submitting…" : "Submit score"}
              </button>
            </form>
          )}
        </AutoHeight>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          ref={next}
          onClick={onNext}
          className="group inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors hover:border-foreground/30"
        >
          Next test
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="size-4" />
          Same words again
        </button>
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">tab</kbd> next test
        </span>
      </div>
    </div>
  );
}
