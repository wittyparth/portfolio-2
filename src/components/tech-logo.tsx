import type * as React from "react";
import { cn } from "@/lib/utils";
import { tech, techKey } from "@/lib/tech";
import logos from "@/lib/tech-logos.json";

const COLOUR = logos as Record<string, { src: string; ink?: boolean }>;
// Logos that are effectively black would vanish in dark mode, so they keep the text color.
const INK = new Set(["000000", "0A0A0A", "181717", "191919"]);

/** A tool's real, full-colour logo (see scripts/tech-logos.mjs); falls back to the simple-icons glyph, then to initials. */
export function TechLogo({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const colour = COLOUR[techKey(name)];
  if (colour) {
    return (
      // Plain <img>: these are tiny static SVGs, next/image adds nothing here.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={colour.src} alt="" draggable={false} style={style} className={cn("size-4 object-contain", colour.ink && "dark:invert", className)} />
    );
  }
  const t = tech(name);
  if (t.path) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        style={style}
        className={cn("size-4", className)}
        fill={t.hex && !INK.has(t.hex) ? `#${t.hex}` : "currentColor"}
      >
        <path d={t.path} />
      </svg>
    );
  }
  return (
    <span aria-hidden style={style} className={cn("grid size-4 place-items-center font-mono text-[8px] font-semibold", className)}>
      {name.slice(0, 2)}
    </span>
  );
}
