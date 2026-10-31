"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { tech } from "@/lib/tech";
import { Tip } from "./tip";

// Logos that are effectively black would vanish in dark mode, so they keep the text color.
const INK = new Set(["000000", "0A0A0A", "181717", "191919"]);

export function TechIcon({ name, className }: { name: string; className?: string }) {
  const t = tech(name);
  if (!t.path) {
    return (
      <span className={cn("rounded-full border border-border px-2 py-px font-mono text-[11px] leading-5 text-muted-foreground", className)}>
        {t.name}
      </span>
    );
  }
  const brand = t.hex && !INK.has(t.hex) ? `#${t.hex}` : "var(--foreground)";
  return (
    <Tip label={t.name}>
      <span
        tabIndex={0}
        style={{ "--brand": brand } as CSSProperties}
        className={cn(
          "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors duration-200 outline-none hover:text-(--brand) focus-visible:text-(--brand) focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
      >
        <svg role="img" aria-label={t.name} viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d={t.path} />
        </svg>
      </span>
    </Tip>
  );
}

export function TechIcons({ stack, className }: { stack: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-0.5", className)} aria-label="Built with">
      {stack.map((s) => (
        <li key={s} className="contents">
          <TechIcon name={s} />
        </li>
      ))}
    </ul>
  );
}
