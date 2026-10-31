"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Home section header, doubling as the divider between sections: a chapter number,
 * the title, and a rule that draws itself across when the section scrolls into view.
 */
export function SectionHead({ n, total, title, action }: { n: number; total: number; title: string; action?: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="inline-flex h-6 items-center rounded-md border border-border bg-background px-1.5 font-mono text-[11px] text-muted-foreground tabular-nums">
        {String(n).padStart(2, "0")}
        <span className="opacity-75">/{String(total).padStart(2, "0")}</span>
      </span>
      <h2 className="shrink-0 text-lg font-medium tracking-tight">{title}</h2>
      <motion.span
        aria-hidden
        className="h-px flex-1 origin-left bg-gradient-to-r from-border via-border to-transparent"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {action && <span className="shrink-0">{action}</span>}
    </div>
  );
}
