import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * A single-colour SVG drawn as a CSS mask, so it takes `color` (currentColor) or a given colour
 * like an inline icon would, without shipping its path in the JS bundle.
 */
export function Glyph({ src, color, className, style }: { src: string; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 shrink-0", className)}
      style={{
        backgroundColor: color ?? "currentColor",
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        ...style,
      }}
    />
  );
}
