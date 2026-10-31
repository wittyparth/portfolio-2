// Browser-safe tech lookups. The simple-icons table stays in ./tech.ts (server and scripts);
// here we only read a small generated manifest and point at static SVGs (scripts/tech-glyphs.mjs).
import glyphs from "./tech-glyphs.json";

const GLYPHS = glyphs as Record<string, { title: string; hex: string; mono: string }>;

export const techKey = (name: string) => name.toLowerCase().replace(/[\s.\-_/]/g, "");

export type TechMeta = { name: string; hex?: string; mono?: string };

/** A tool's brand colour and single-colour glyph URL, if we have one. */
export function techMeta(name: string): TechMeta {
  const g = GLYPHS[techKey(name)];
  return g ? { name, hex: g.hex, mono: g.mono } : { name };
}

// Logos that are effectively black would vanish in dark mode, so they keep the text colour.
export const INK_HEX = new Set(["000000", "0A0A0A", "181717", "191919"]);
