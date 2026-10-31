"use client";

import * as React from "react";
import { Tabs, TabsHighlight, TabsHighlightItem, TabsList, TabsTrigger } from "@animate-ui/react/primitives/tabs";

/** The site's pill filter: a gliding highlight under the active option. */
export function FilterTabs<T extends string>({
  value, onChange, options, label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; count?: number }[];
  label: string;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
      <TabsList aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-full border border-border bg-background p-0.5 text-sm [scrollbar-width:none]">
        <TabsHighlight className="rounded-full bg-foreground/[0.07] dark:bg-foreground/[0.12]">
          {options.map((o) => (
            <TabsHighlightItem key={o.value} value={o.value}>
              <TabsTrigger
                value={o.value}
                className="flex items-center gap-1.5 px-3 py-1 whitespace-nowrap text-muted-foreground transition-colors data-[state=active]:text-foreground"
              >
                {o.label}
                {o.count !== undefined && <span className="font-mono text-[11px] tabular-nums opacity-60">{o.count}</span>}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsHighlight>
      </TabsList>
    </Tabs>
  );
}
