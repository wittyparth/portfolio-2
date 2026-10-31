import type * as React from "react";
import { cn } from "@/lib/utils";
import { INK_HEX, techKey, techMeta } from "@/lib/tech-client";
import { Glyph } from "./glyph";
import logos from "@/lib/tech-logos.json";

const COLOUR = logos as Record<string, { src: string; ink?: boolean }>;

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
  const t = techMeta(name);
  if (t.mono) return <Glyph src={t.mono} color={t.hex && !INK_HEX.has(t.hex) ? `#${t.hex}` : undefined} style={style} className={className} />;
  return (
    <span aria-hidden style={style} className={cn("grid size-4 place-items-center font-mono text-[8px] font-semibold", className)}>
      {name.slice(0, 2)}
    </span>
  );
}
