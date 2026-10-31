"use client";

import * as React from "react";
import useTypingGame from "react-typing-game-hook";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Tabs, TabsHighlight, TabsHighlightItem, TabsList, TabsTrigger } from "@animate-ui/react/primitives/tabs";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { RotateCcw } from "lucide-react";
import { useSound } from "@/components/sound";
import { Tip } from "@/components/tip";
import { MODES, generateText, type Mode, type WordSet } from "@/lib/typing";
import { WordsView } from "./words-view";
import { Results, type Result } from "./results";
import { Leaderboard } from "./leaderboard";

type Round = { roundId: string | null; seed: number };
const SENTINEL = " ";
const NAME_KEY = "typing:name";

async function requestRound(mode: Mode, set: WordSet): Promise<Round> {
  try {
    const r = await fetch("/api/typing/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, set }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const d = (await r.json()) as { roundId: string; seed: number };
    return { roundId: d.roundId, seed: d.seed };
  } catch {
    return { roundId: null, seed: Math.floor(Math.random() * 2 ** 32) };
  }
}

function Segmented<T extends string>({
  value, options, onChange, label, disabled,
}: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; disabled?: boolean }) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsList aria-label={label} className={`flex rounded-full border border-border p-0.5 text-sm ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <TabsHighlight className="rounded-full bg-accent">
          {options.map((o) => (
            <TabsHighlightItem key={o.value} value={o.value}>
              <TabsTrigger
                value={o.value}
                tabIndex={disabled ? -1 : undefined}
                className="min-h-7 px-3 py-1 text-muted-foreground transition-colors data-[state=active]:text-foreground"
              >
                {o.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsHighlight>
      </TabsList>
    </Tabs>
  );
}

export function TypingGame() {
  const reduce = useReducedMotion();
  const sound = useSound();
  const [mode, setMode] = React.useState<Mode>(30);
  const [set, setSet] = React.useState<WordSet>("words");
  const [round, setRound] = React.useState<Round | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [result, setResult] = React.useState<Result | null>(null);
  const [boardKey, setBoardKey] = React.useState(0);
  const [you, setYou] = React.useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(NAME_KEY),
  );
  const [typingNow, setTypingNow] = React.useState(false);
  const idleTimer = React.useRef<number | undefined>(undefined);

  // Placeholder words for the first paint; the real round replaces them before typing is allowed.
  const text = React.useMemo(() => generateText(round?.seed ?? 7, set), [round?.seed, set]);
  const {
    states: { charsState, currIndex, correctChar, errorChar, phase },
    actions: { insertTyping, deleteTyping, resetTyping, endTyping },
  } = useTypingGame(text, { skipCurrentWordOnSpace: true, pauseOnError: false, countErrors: "everytime" });

  const input = React.useRef<HTMLInputElement>(null);
  const prev = React.useRef(SENTINEL);
  const startAt = React.useRef<number | null>(null);
  const keystrokes = React.useRef(0);
  const typedPerSecond = React.useRef<number[]>([]);
  const errorsPerSecond = React.useRef<number[]>([]);
  const netSamples = React.useRef<number[]>([]);
  const live = React.useRef({ correctChar, errorChar });
  React.useLayoutEffect(() => {
    live.current = { correctChar, errorChar };
  }, [correctChar, errorChar]);

  const ready = round !== null && !fetching;
  const running = phase === 1 && result === null;

  const clearRun = React.useCallback(() => {
    startAt.current = null;
    keystrokes.current = 0;
    typedPerSecond.current = [];
    errorsPerSecond.current = [];
    netSamples.current = [];
    prev.current = SENTINEL;
    if (input.current) input.current.value = SENTINEL;
    setElapsed(0);
    setResult(null);
  }, []);

  const newRound = React.useCallback(
    async (m: Mode = mode, s: WordSet = set) => {
      clearRun();
      setFetching(true);
      resetTyping();
      const r = await requestRound(m, s);
      setRound(r);
      setFetching(false);
      requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
    },
    [mode, set, clearRun, resetTyping],
  );

  const restartSame = React.useCallback(() => {
    clearRun();
    resetTyping();
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }, [clearRun, resetTyping]);

  React.useEffect(() => {
    let alive = true;
    requestRound(30, "words").then((r) => alive && setRound(r));
    return () => {
      alive = false;
    };
  }, []);

  // Clock: samples once per whole second, ends the round exactly at the mode length.
  React.useEffect(() => {
    if (!running) return;
    const duration = mode * 1000;
    const id = window.setInterval(() => {
      if (startAt.current === null) return;
      const ms = Math.min(Date.now() - startAt.current, duration);
      setElapsed(ms);
      const whole = Math.floor(ms / 1000);
      while (netSamples.current.length < whole) {
        const sec = netSamples.current.length + 1;
        netSamples.current.push(live.current.correctChar / 5 / (sec / 60));
        const seen = errorsPerSecond.current.reduce((a, b) => a + b, 0);
        errorsPerSecond.current.push(Math.max(0, live.current.errorChar - seen));
      }
      if (ms >= duration) {
        window.clearInterval(id);
        const elapsedMs = Date.now() - startAt.current;
        endTyping();
        const raw = Array.from({ length: mode }, (_, i) => (typedPerSecond.current[i] ?? 0) * 12);
        const errs = Array.from({ length: mode }, (_, i) => errorsPerSecond.current[i] ?? 0);
        setResult({
          mode,
          set,
          roundId: round?.roundId ?? null,
          correct: live.current.correctChar,
          incorrect: live.current.errorChar,
          keystrokes: keystrokes.current,
          elapsedMs,
          net: netSamples.current.slice(0, mode),
          raw,
          errors: errs,
        });
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [running, mode, set, endTyping, round?.roundId]);

  const bucket = () => {
    if (startAt.current === null) startAt.current = Date.now();
    return Math.min(mode - 1, Math.floor((Date.now() - startAt.current) / 1000));
  };

  const insert = (ch: string) => {
    if (result || !ready) return;
    const b = bucket();
    insertTyping(ch);
    keystrokes.current++;
    typedPerSecond.current[b] = (typedPerSecond.current[b] ?? 0) + 1;
    setTypingNow(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setTypingNow(false), 600);
    sound.play("tap");
  };

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const native = e.nativeEvent as InputEvent;
    const next = el.value;
    if (native.inputType === "insertFromPaste" || native.inputType === "insertFromDrop") {
      el.value = prev.current;
      return;
    }
    if (native.inputType === "deleteWordBackward" || native.inputType === "deleteSoftLineBackward") {
      if (!result && ready) {
        deleteTyping(true);
        keystrokes.current++;
      }
    } else {
      // Diff by common prefix and suffix so caret position and IME rewrites can't confuse us.
      const a = prev.current;
      let p = 0;
      while (p < a.length && p < next.length && a[p] === next[p]) p++;
      let sfx = 0;
      while (sfx < a.length - p && sfx < next.length - p && a[a.length - 1 - sfx] === next[next.length - 1 - sfx]) sfx++;
      const removed = a.length - p - sfx;
      for (let i = 0; i < removed; i++) {
        if (!result && ready) {
          deleteTyping(false);
          keystrokes.current++;
        }
      }
      for (const raw of next.slice(p, next.length - sfx)) {
        const ch = raw === " " ? " " : raw;
        if (ch === "\n" || ch === "\r") continue;
        insert(ch);
      }
    }
    if (next.length === 0 || next.endsWith(" ") || next.length > 40) {
      el.value = SENTINEL;
      prev.current = SENTINEL;
    } else {
      prev.current = next;
    }
    pinCaret(el);
  };

  const pinCaret = (el: HTMLInputElement) => {
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      void newRound();
    } else if (e.key === "Escape") {
      e.preventDefault();
      restartSame();
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Any key focuses the test when nothing else wants it.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (focused || result || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, button, a, [role='tab'], [contenteditable='true'], [role='dialog']")) return;
      if (e.key.length === 1 || e.key === "Tab") {
        if (e.key === "Tab") return;
        input.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, result]);

  const changeMode = (m: Mode) => {
    setMode(m);
    void newRound(m, set);
  };
  const changeSet = (s: WordSet) => {
    setSet(s);
    void newRound(mode, s);
  };

  const timeLeft = Math.max(0, Math.ceil((mode * 1000 - elapsed) / 1000));
  const liveWpm = elapsed >= 1000 ? Math.round(correctChar / 5 / (elapsed / 60000)) : 0;
  const liveAcc = correctChar + errorChar === 0 ? 100 : Math.round((correctChar / (correctChar + errorChar)) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Test length"
          value={String(mode) as `${Mode}`}
          options={MODES.map((m) => ({ value: String(m) as `${Mode}`, label: `${m}s` }))}
          onChange={(v) => changeMode(Number(v) as Mode)}
          disabled={running}
        />
        <Segmented
          label="Word set"
          value={set}
          options={[{ value: "words", label: "words" }, { value: "code", label: "code" }]}
          onChange={changeSet}
          disabled={running}
        />
        <Tip label="New words (tab)">
          <motion.button
            whileTap={{ scale: 0.9, rotate: -90 }}
            onClick={() => void newRound()}
            aria-label="New words"
            className="ml-auto grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </motion.button>
        </Tip>
      </div>

      <div className="mt-8 min-h-[17.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          {result ? (
            <motion.div
              key="results"
              initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Results
                result={result}
                onNext={() => void newRound()}
                onRetry={restartSame}
                onSubmitted={(name) => {
                  setYou(name);
                  localStorage.setItem(NAME_KEY, name);
                  setBoardKey((k) => k + 1);
                }}
                defaultName={you ?? ""}
              />
            </motion.div>
          ) : (
            <motion.div
              key="test"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-5 flex h-9 items-end gap-6 font-mono tabular-nums">
                <span className="text-3xl leading-none font-medium text-foreground" aria-label={`${timeLeft} seconds left`}>
                  <SlidingNumber number={running ? timeLeft : mode} />
                </span>
                <AnimatePresence>
                  {running && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-baseline gap-5 pb-0.5 text-sm text-muted-foreground"
                    >
                      <span className="inline-flex items-baseline gap-1.5">
                        <span className="text-base text-foreground"><SlidingNumber number={liveWpm} /></span>wpm
                      </span>
                      <span className="inline-flex items-baseline gap-1.5">
                        <span className="inline-flex text-base text-foreground"><SlidingNumber number={liveAcc} />%</span>acc
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" onClick={() => input.current?.focus({ preventScroll: true })}>
                <WordsView text={text} charsState={charsState} currIndex={currIndex} typing={running && typingNow} dimmed={!focused || !ready} />
                <input
                  ref={input}
                  defaultValue={SENTINEL}
                  aria-label="Type the words shown"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="text"
                  enterKeyHint="next"
                  onInput={onInput}
                  onKeyDown={onKeyDown}
                  onPaste={(e) => e.preventDefault()}
                  onDrop={(e) => e.preventDefault()}
                  onFocus={(e) => {
                    setFocused(true);
                    pinCaret(e.currentTarget);
                  }}
                  onSelect={(e) => pinCaret(e.currentTarget)}
                  onBlur={() => setFocused(false)}
                  className="absolute inset-0 h-full w-full cursor-default resize-none bg-transparent text-[16px] text-transparent caret-transparent opacity-0 outline-none"
                />
                <AnimatePresence>
                  {(!focused || !ready) && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => input.current?.focus({ preventScroll: true })}
                      className="absolute inset-0 grid place-items-center text-sm text-foreground"
                    >
                      <span className="rounded-full border border-border bg-background/80 px-4 py-2 shadow-sm backdrop-blur">
                        {ready ? "Click here or press any key to start" : "Shuffling words…"}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <p className="mt-6 hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
                <span><kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">tab</kbd> new words</span>
                <span><kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">esc</kbd> restart</span>
                {round && round.roundId === null && <span>offline round · scores won&apos;t be saved</span>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Leaderboard mode={mode} set={set} you={you} refreshKey={boardKey} />
    </div>
  );
}
