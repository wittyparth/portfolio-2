"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Home section header, doubling as the divider between sections: a small diamond that turns
 * and a flat hairline that draws itself across as the heading scrolls up the page.
 */
export function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 62%"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const turn = useTransform(scrollYProgress, [0, 1], [0, 135]);
  return (
    <div ref={ref} className="mb-6 flex items-center gap-3">
      <motion.span
        aria-hidden
        className="size-2 shrink-0 border border-foreground/60 bg-background"
        style={reduce ? { rotate: 45 } : { rotate: turn }}
      />
      <h2 className="shrink-0 text-lg font-medium tracking-tight">{title}</h2>
      <motion.span
        aria-hidden
        className="h-px flex-1 origin-left bg-border"
        style={reduce ? undefined : { scaleX: draw }}
      />
      {action && <span className="shrink-0">{action}</span>}
    </div>
  );
}
