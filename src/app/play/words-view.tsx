"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  charsState: number[];
  currIndex: number;
  typing: boolean;
  dimmed: boolean;
};

type Caret = { x: number; y: number; h: number; offset: number };

export function WordsView({ text, charsState, currIndex, typing, dimmed }: Props) {
  const reduce = useReducedMotion();
  const container = React.useRef<HTMLDivElement>(null);
  const chars = React.useRef<(HTMLSpanElement | null)[]>([]);
  const [caret, setCaret] = React.useState<Caret | null>(null);

  const words = React.useMemo(() => {
    let i = 0;
    return text.split(" ").map((w, wi, all) => {
      const letters = [...w].map((ch) => ({ ch, i: i++ }));
      const space = wi < all.length - 1 ? i++ : null;
      return { letters, space };
    });
  }, [text]);

  const measure = React.useCallback(() => {
    const box = container.current;
    if (!box) return;
    const next = chars.current[currIndex + 1];
    const last = chars.current[text.length - 1];
    const lineHeight = parseFloat(getComputedStyle(box).lineHeight) || 40;
    const target = next ?? last;
    if (!target) return;
    const x = next ? target.offsetLeft : target.offsetLeft + target.offsetWidth;
    const top = target.offsetTop;
    const offset = Math.max(0, top - lineHeight);
    setCaret({ x, y: top - offset, h: lineHeight, offset });
  }, [currIndex, text.length]);

  React.useLayoutEffect(measure, [measure]);
  React.useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (container.current) ro.observe(container.current);
    return () => ro.disconnect();
  }, [measure]);

  const charClass = (i: number, isSpace: boolean) => {
    const s = charsState[i];
    if (s === 1) return "text-foreground";
    if (s === 2) return isSpace ? "bg-red-500/25 rounded-[3px]" : "text-red-600 dark:text-red-400";
    if (i <= currIndex) return "text-muted-foreground underline decoration-red-500/70 decoration-2 underline-offset-[6px]";
    return "text-muted-foreground";
  };

  const tween = reduce ? { duration: 0 } : { type: "tween" as const, ease: [0.16, 1, 0.3, 1] as const, duration: 0.11 };

  return (
    <div
      className={cn(
        "relative h-[calc(3*2.25rem)] overflow-hidden font-mono text-[1.35rem] leading-9 transition-opacity duration-300 select-none sm:h-[calc(3*2.75rem)] sm:text-[1.7rem] sm:leading-[2.75rem]",
        dimmed && "opacity-45",
      )}
      aria-hidden
    >
      <motion.div
        ref={container}
        data-words
        className="relative"
        animate={{ y: -(caret?.offset ?? 0) }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
      >
        {words.map((w, wi) => (
          <span key={wi} className="inline-block whitespace-pre">
            {w.letters.map(({ ch, i }) => (
              <span key={i} ref={(el) => void (chars.current[i] = el)} className={cn("transition-colors duration-75", charClass(i, false))}>
                {ch}
              </span>
            ))}
            {w.space !== null && (
              <span ref={(el) => void (chars.current[w.space!] = el)} className={charClass(w.space, true)}>
                {" "}
              </span>
            )}
          </span>
        ))}
        {caret && (
          <motion.span
            aria-hidden
            className={cn(
              "absolute top-0 left-0 w-[2.5px] rounded-full bg-foreground",
              !typing && "animate-[caret-blink_1.1s_steps(2,start)_infinite] motion-reduce:animate-none",
            )}
            initial={false}
            animate={{ x: caret.x - 1, y: caret.y + caret.h * 0.18 + caret.offset }}
            style={{ height: caret.h * 0.64 }}
            transition={tween}
          />
        )}
      </motion.div>
      <style>{`@keyframes caret-blink { to { opacity: 0 } }`}</style>
    </div>
  );
}
