"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Coffee, Keyboard, Laptop, Monitor, Type } from "lucide-react";
import { uses, type UsesGlyph } from "@/lib/content";
import { cn } from "@/lib/utils";
import { TechLogo } from "./tech-logo";

const GLYPH: Record<UsesGlyph, React.ComponentType<{ className?: string }>> = {
  laptop: Laptop,
  monitor: Monitor,
  keyboard: Keyboard,
  type: Type,
  coffee: Coffee,
};

type Item = (typeof uses)[number]["items"][number];

function Icon({ item, className }: { item: Item; className?: string }) {
  const Glyph = item.glyph ? GLYPH[item.glyph] : null;
  if (item.logo) return <TechLogo name={item.logo} className={className} />;
  return Glyph ? <Glyph className={cn("text-foreground/80", className)} /> : null;
}

/** Always shows something: whichever key was last hovered, focused or pressed (the first one until then). */
function Readout({ item }: { item: Item }) {
  const reduce = useReducedMotion();
  return (
    <div className="sticky top-[4.25rem] z-10 -mx-2 mb-4 rounded-xl bg-background/90 px-2 py-3 backdrop-blur-md">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.name}
          initial={reduce ? false : { opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-[5.25rem] items-start gap-4 sm:min-h-[3.75rem]"
          aria-live="polite"
        >
          <Icon item={item} className="mt-0.5 size-9 shrink-0" />
          <div className="min-w-0">
            <p className="text-lg leading-tight font-semibold tracking-tight">{item.name}</p>
            <p className="mt-1 text-[15px] leading-snug text-pretty text-muted-foreground">{item.note}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Key({ item, active, onActive }: { item: Item; active: boolean; onActive: () => void }) {
  return (
    <button
      type="button"
      data-key
      onPointerEnter={(e) => e.pointerType === "mouse" && onActive()}
      onFocus={onActive}
      onClick={onActive}
      className={cn(
        "group/key relative flex h-[5rem] w-full flex-col justify-between rounded-xl border bg-card p-3 text-left outline-none",
        // The keycap: a solid edge underneath that collapses when it's pressed.
        "shadow-[0_4px_0_0_var(--border),0_6px_12px_-6px_rgb(0_0_0/0.25)] transition-[translate,box-shadow,border-color] duration-100",
        "focus-visible:ring-2 focus-visible:ring-ring/60 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--border)]",
        active ? "border-foreground/40" : "border-border hover:border-foreground/20",
      )}
    >
      <Icon item={item} className={cn("size-6", item.glyph === "coffee" && "group-hover/key:animate-[wiggle_0.5s_ease-in-out]")} />
      <span className="text-sm leading-tight font-medium tracking-tight">{item.name}</span>
    </button>
  );
}

// Literal class names so Tailwind can see them. Rows are 2 columns on phones and 4 from sm up.
const SPAN_SM = ["", "sm:col-span-1", "sm:col-span-2", "sm:col-span-3", "sm:col-span-4"];

/** Stretches the last key of a row so rows with an odd leftover cell still fill the plate. */
function spans(items: Item[]) {
  const w = items.map((i) => (i.wide ? 2 : 1));
  const smLeft = Math.max(0, 4 - w.reduce((a, b) => a + b, 0));
  const mobOdd = w.reduce((a, b) => a + (b === 2 ? 2 : 1), 0) % 2 === 1;
  return items.map((_, i) => {
    const last = i === items.length - 1;
    const sm = w[i] + (last ? smLeft : 0);
    return cn(SPAN_SM[sm], (w[i] === 2 || (last && mobOdd)) && "col-span-2");
  });
}

/** Arrow keys walk the keyboard like a keyboard: left/right along the row, up/down to the nearest key above or below. */
function walk(e: React.KeyboardEvent<HTMLDivElement>) {
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
  if (!dir) return;
  const keys = [...e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-key]")];
  const here = document.activeElement as HTMLButtonElement | null;
  if (!here || !keys.includes(here)) return;
  const c = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const from = c(here);
  let best: HTMLButtonElement | null = null;
  let bestScore = Infinity;
  for (const k of keys) {
    if (k === here) continue;
    const p = c(k);
    const dx = (p.x - from.x) * dir[0];
    const dy = (p.y - from.y) * dir[1];
    const along = dir[0] ? dx : dy;
    const across = dir[0] ? Math.abs(p.y - from.y) : Math.abs(p.x - from.x);
    if (along <= 4 || (dir[0] && across > 8)) continue;
    const score = along + across * 2;
    if (score < bestScore) {
      best = k;
      bestScore = score;
    }
  }
  if (best) {
    e.preventDefault();
    best.focus();
  }
}

export function UsesList() {
  const [active, setActive] = React.useState<Item>(uses[0].items[0]);

  return (
    <div>
      <Readout item={active} />
      {/* The plate the keys sit in: the page's one container. */}
      <div onKeyDown={walk} className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4">
        <div className="space-y-5">
          {uses.map((group) => {
            const cls = spans(group.items);
            return (
              <section key={group.group} aria-label={group.group}>
                <h2 className="mb-2 px-1 text-sm font-medium text-muted-foreground">{group.group}</h2>
                <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {group.items.map((item, i) => (
                    <li key={item.name} className={cls[i]}>
                      <Key item={item} active={active.name === item.name} onActive={() => setActive(item)} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
