"use client";

import type { ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const KINDS = {
  note: { icon: Info, label: "Note", tone: "text-sky-600 dark:text-sky-400" },
  tip: { icon: Lightbulb, label: "Tip", tone: "text-emerald-600 dark:text-emerald-400" },
  warn: { icon: TriangleAlert, label: "Careful", tone: "text-amber-600 dark:text-amber-400" },
};

export function Callout({ type = "note", children }: { type?: keyof typeof KINDS; children: ReactNode }) {
  const kind = KINDS[type];
  const Icon = kind.icon;
  return (
    <aside className="my-7 flex gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3.5 text-[15px] leading-relaxed sm:-mx-4">
      <Icon aria-hidden className={cn("mt-1 size-4 shrink-0", kind.tone)} />
      <div className="min-w-0 [&>p]:m-0 [&>p+p]:mt-3">
        <span className="sr-only">{kind.label}: </span>
        {children}
      </div>
    </aside>
  );
}
