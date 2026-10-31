import { cn } from "@/lib/utils";

/**
 * The site's table style: hairlines between rows and nothing around them.
 * Rows are links with `group/row`; their number rolls up to reveal an arrow on hover.
 */
export function LedgerHead({ cols, labels }: { cols: string; labels: (string | { label: string; className?: string })[] }) {
  return (
    <div aria-hidden className={cn(cols, "border-b border-border pb-2 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground/80 uppercase")}>
      {labels.map((l) =>
        typeof l === "string" ? <span key={l}>{l}</span> : <span key={l.label} className={l.className}>{l.label}</span>,
      )}
    </div>
  );
}

export const ledgerRow = "group/row relative py-3.5 outline-none focus-visible:bg-accent/50";
export const ledgerList = "divide-y divide-border";

export function RowNumber({ n, arrow = "→" }: { n: number; arrow?: string }) {
  return (
    <span className="relative h-5 overflow-hidden font-mono text-xs text-muted-foreground tabular-nums">
      <span className="block transition-transform duration-300 ease-out group-hover/row:-translate-y-5 group-focus-visible/row:-translate-y-5 motion-reduce:transition-none">
        <span className="block leading-5">{String(n).padStart(2, "0")}</span>
        <span className="block leading-5 text-foreground">{arrow}</span>
      </span>
    </span>
  );
}

/** The row's title nudges right as the number rolls. */
export const ledgerTitle = "font-medium tracking-tight transition-transform duration-300 ease-out group-hover/row:translate-x-1 motion-reduce:transition-none";
