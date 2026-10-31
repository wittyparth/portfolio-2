"use client";

import * as React from "react";
import { ScrollProgress, ScrollProgressProvider } from "@animate-ui/react/primitives/scroll-progress";
import type { Heading } from "@/lib/mdx-content";
import { cn } from "@/lib/utils";

/** One scroll source for the page: the bar under the top edge and the rail beside the contents. */
export function Reading({ children }: { children: React.ReactNode }) {
  return (
    <ScrollProgressProvider global>
      <ScrollProgress
        mode="scaleX"
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-foreground/80"
      />
      {children}
    </ScrollProgressProvider>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(null);
  React.useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    // The active section is the last heading that has scrolled past the upper third of the viewport.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atEnd ? els[els.length - 1].id : current);
    };
    update();
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);
  return active;
}

export function Toc({ headings }: { headings: Heading[] }) {
  const ids = React.useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);
  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 text-xs font-medium text-muted-foreground">On this page</p>
      <div className="relative pl-4">
        <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-border" />
        <ScrollProgress mode="scaleY" aria-hidden className="absolute inset-y-0 left-0 w-px origin-top bg-foreground" />
        <ul className="space-y-2">
          {headings.map((h) => (
            <li key={h.id} className={cn(h.depth === 3 && "pl-3")}>
              <a
                href={`#${h.id}`}
                aria-current={active === h.id ? "location" : undefined}
                className={cn(
                  "block leading-snug text-pretty text-muted-foreground transition-colors duration-200 hover:text-foreground",
                  active === h.id && "text-foreground",
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
