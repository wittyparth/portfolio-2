"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
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

/** The keyboard's little OLED: types out whichever key was last hovered, focused or pressed. */
function Display({ item, presses }: { item: Item | null; presses: number }) {
  const text = item ? item.note : "Press any key.";
  const [typed, setTyped] = React.useState(text);

  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (reduce) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [text, reduce]);

  return (
    <div className="sticky top-16 z-10 mb-8 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 font-mono text-[13px] text-emerald-300/90 shadow-[inset_0_1px_8px_rgb(0_0_0/0.6)]">
      <div className="flex items-center justify-between text-[10.5px] tracking-[0.14em] text-neutral-500 uppercase">
        <span>{item ? item.name : "uses.sh"}</span>
        <span className="flex items-center gap-1.5 tabular-nums">
          {presses > 0 && <span className="mr-2">{presses} {presses === 1 ? "press" : "presses"}</span>}
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_var(--color-emerald-400)]" />
          on
        </span>
      </div>
      <p className="mt-1.5 min-h-5" aria-live="polite">
        <span className="text-neutral-500">&gt; </span>
        {reduce ? text : typed}
        <span aria-hidden className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-pulse bg-emerald-300/80 motion-reduce:animate-none" />
      </p>
    </div>
  );
}

function Key({ item, active, onActive, onPress }: { item: Item; active: boolean; onActive: () => void; onPress: () => void }) {
  const Glyph = item.glyph ? GLYPH[item.glyph] : null;
  return (
    <button
      type="button"
      onPointerEnter={(e) => e.pointerType === "mouse" && onActive()}
      onFocus={onActive}
      onClick={() => {
        onActive();
        onPress();
      }}
      className={cn(
        "group/key relative flex h-[5.5rem] w-full flex-col justify-between rounded-xl border bg-card p-3 text-left outline-none",
        // The keycap: a solid edge underneath that collapses when it's pressed.
        "shadow-[0_4px_0_0_var(--border),0_6px_12px_-6px_rgb(0_0_0/0.25)] transition-[translate,box-shadow,border-color] duration-100",
        "active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--border)] focus-visible:ring-2 focus-visible:ring-ring/60",
        active ? "border-foreground/30" : "border-border hover:border-foreground/20",
      )}
    >
      <span className="grid size-8 place-items-center rounded-lg border border-border bg-background">
        {item.logo ? (
          <TechLogo name={item.logo} className="size-[18px]" />
        ) : Glyph ? (
          <Glyph className={cn("size-[18px] text-foreground/80", item.glyph === "coffee" && "group-hover/key:animate-[wiggle_0.5s_ease-in-out]")} />
        ) : null}
      </span>
      {/* The key's legend: its first letter, top right, like a real keycap. */}
      <span aria-hidden className="absolute top-2.5 right-3 font-mono text-[11px] text-muted-foreground/70">{item.name[0]}</span>
      <span className="text-sm leading-tight font-medium tracking-tight">{item.name}</span>
      <span className="sr-only">: {item.note}</span>
      {active && <span aria-hidden className="absolute right-3 bottom-3 size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_var(--color-emerald-500)]" />}
    </button>
  );
}

export function UsesList() {
  const [active, setActive] = React.useState<Item | null>(null);
  const [presses, setPresses] = React.useState(0);

  return (
    <div>
      <Display item={active} presses={presses} />
      {/* The plate the keys sit in. */}
      <div className="rounded-[22px] border border-border bg-muted/50 p-3 shadow-[inset_0_2px_6px_rgb(0_0_0/0.08)] sm:p-4 dark:bg-muted/30">
        <div className="space-y-5">
          {uses.map((group, row) => (
            <section key={group.group}>
              <h2 className="mb-2 flex items-baseline gap-2 px-1 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">
                <span className="opacity-60">R{row + 1}</span>
                {group.group}
              </h2>
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {group.items.map((item) => (
                  <li key={item.name} className={cn(item.wide && "col-span-2")}>
                    <Key
                      item={item}
                      active={active?.name === item.name}
                      onActive={() => setActive(item)}
                      onPress={() => setPresses((n) => n + 1)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
