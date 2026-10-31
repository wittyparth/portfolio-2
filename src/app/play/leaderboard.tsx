"use client";

import * as React from "react";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import type { LeaderboardResponse, Mode, WordSet } from "@/lib/typing";
import { cn } from "@/lib/utils";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function ago(t: number) {
  if (!t) return "";
  const s = (t - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [u, sec] of units) if (Math.abs(s) >= sec) return rtf.format(Math.round(s / sec), u);
  return "just now";
}

type Loaded = { board: string; status: "error" } | { board: string; status: "ready"; data: LeaderboardResponse };
type State = { status: "loading" } | Loaded;

export function Leaderboard({
  mode, set, you, refreshKey,
}: { mode: Mode; set: WordSet; you: string | null; refreshKey: number }) {
  const board = `${mode}:${set}`;
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  // A board fetched for another mode reads as loading; a refresh of the same board keeps rows visible.
  const state: State = loaded && loaded.board === board ? loaded : { status: "loading" };

  React.useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/typing/leaderboard?mode=${mode}&set=${set}`, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<LeaderboardResponse>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => setLoaded({ board: `${mode}:${set}`, status: "ready", data }))
      .catch((e: Error) => e.name !== "AbortError" && setLoaded({ board: `${mode}:${set}`, status: "error" }));
    return () => ctrl.abort();
  }, [mode, set, refreshKey, attempt]);

  const me = you?.toLocaleLowerCase();
  const label = `${mode}s${set === "code" ? " · code" : ""}`;

  return (
    <section aria-labelledby="board-title" className="mt-20">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="board-title" className="text-lg font-medium tracking-tight">
          Leaderboard <span className="font-normal text-muted-foreground">· {label}</span>
        </h2>
        {state.status === "ready" && state.data.total > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {state.data.total} {state.data.total === 1 ? "typist" : "typists"}
          </span>
        )}
      </div>

      <AutoHeight deps={[state.status, state.status === "ready" ? state.data.entries.length : 0]}>
        {state.status === "loading" && (
          <ol className="space-y-1" aria-busy>
            {Array.from({ length: 5 }, (_, i) => (
              <li key={i} className="flex h-11 items-center gap-4 px-3">
                <span className="h-3 w-5 animate-pulse rounded bg-muted" />
                <span className="h-3 animate-pulse rounded bg-muted" style={{ width: `${30 + ((i * 17) % 30)}%` }} />
                <span className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ol>
        )}

        {state.status === "error" && (
          <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            The board didn&apos;t load.{" "}
            <button onClick={() => setAttempt((a) => a + 1)} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && state.data.entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
            <p className="text-sm">Nobody&apos;s on the {label} board yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Finish a round and the top spot is yours.</p>
          </div>
        )}

        {state.status === "ready" && state.data.entries.length > 0 && (
          <div>
            <div className="grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-3 px-3 pb-2 text-xs text-muted-foreground sm:grid-cols-[2.5rem_1fr_5rem_4rem_6.5rem]">
              <span>#</span>
              <span>Name</span>
              <span className="text-right">WPM</span>
              <span className="text-right">Acc</span>
              <span className="hidden text-right sm:block">When</span>
            </div>
            <ol>
              <Highlight className="rounded-lg bg-accent/70" hover transition={{ type: "spring", stiffness: 400, damping: 34 }}>
                {state.data.entries.map((e) => {
                  const mine = me !== undefined && e.name.toLocaleLowerCase() === me;
                  return (
                    <HighlightItem key={e.rank} value={String(e.rank)} className="rounded-lg">
                      <li
                        className={cn(
                          "relative grid h-11 grid-cols-[2rem_1fr_4.5rem_3.5rem] items-center gap-3 rounded-lg px-3 text-sm sm:grid-cols-[2.5rem_1fr_5rem_4rem_6.5rem]",
                          mine && "bg-foreground/[0.06] ring-1 ring-foreground/15",
                        )}
                      >
                        <span className={cn("font-mono tabular-nums", e.rank <= 3 ? "text-foreground" : "text-muted-foreground")}>
                          {e.rank}
                        </span>
                        <span className="truncate">
                          {e.name}
                          {mine && <span className="ml-2 text-xs text-muted-foreground">you</span>}
                        </span>
                        <span className="text-right font-mono font-medium tabular-nums">{Math.round(e.wpm)}</span>
                        <span className="text-right font-mono text-muted-foreground tabular-nums">{Math.round(e.accuracy * 100)}%</span>
                        <span className="hidden text-right text-muted-foreground sm:block">{ago(e.at)}</span>
                      </li>
                    </HighlightItem>
                  );
                })}
              </Highlight>
            </ol>
          </div>
        )}
      </AutoHeight>
    </section>
  );
}
