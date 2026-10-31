"use client";

import * as React from "react";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { ScrollFade } from "@animate-ui/react/primitives/effects/scroll-fade";
import type { Contributions, Day } from "@/lib/live";
import { profile } from "@/lib/content";

const LEVEL = [
  "bg-neutral-200/70 dark:bg-neutral-800/80",
  "bg-emerald-200 dark:bg-emerald-950",
  "bg-emerald-400 dark:bg-emerald-800",
  "bg-emerald-500 dark:bg-emerald-600",
  "bg-emerald-700 dark:bg-emerald-400",
];

const fmt = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function Heatmap({ data }: { data: Contributions }) {
  if (!data.total || !data.days.length) return null;
  return <HeatmapGrid data={data} />;
}

function HeatmapGrid({ data }: { data: Contributions }) {
  const [hover, setHover] = React.useState<Day | null>(null);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const weeks = React.useMemo(() => {
    const out: (Day | null)[][] = [];
    const first = new Date(data.days[0].date + "T00:00:00").getDay();
    let week: (Day | null)[] = Array(first).fill(null);
    for (const d of data.days) {
      week.push(d);
      if (week.length === 7) { out.push(week); week = []; }
    }
    if (week.length) out.push([...week, ...Array(7 - week.length).fill(null)]);
    return out;
  }, [data.days]);

  const months = React.useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((w, col) => {
      const d = w.find(Boolean);
      if (!d) return;
      const m = new Date(d.date + "T00:00:00").getMonth();
      if (m !== last && w[0] && Number(w[0].date.slice(8)) <= 7) {
        labels.push({ col, label: new Date(d.date + "T00:00:00").toLocaleString("en-US", { month: "short" }) });
        last = m;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono text-foreground tabular-nums">
            <CountingNumber number={data.total} thousandSeparator="," inView inViewOnce />
          </span>{" "}
          contributions in the last year
        </p>
        <p className="text-sm text-muted-foreground">
          longest streak <span className="font-mono text-foreground tabular-nums">{data.longest}</span> days
        </p>
      </div>

      <ScrollFade ref={scroller} orientation="horizontal" size={48} className="overflow-x-auto pb-1 [scrollbar-width:none]">
        <div className="min-w-[36rem]">
          <div className="relative mb-1.5 h-4 text-[11px] text-muted-foreground" aria-hidden>
            {months.map((m) => (
              <span key={m.col} className="absolute" style={{ left: `${(m.col / weeks.length) * 100}%` }}>
                {m.label}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover(null)}
            role="img"
            aria-label={`${data.total} GitHub contributions in the last year`}
          >
            {weeks.map((w, i) => (
              <div key={i} className="grid grid-rows-7 gap-[3px]">
                {w.map((d, j) =>
                  d ? (
                    <div
                      key={j}
                      onMouseEnter={() => setHover(d)}
                      className={`aspect-square rounded-[2px] transition-[transform,box-shadow] duration-150 hover:scale-[1.35] hover:ring-1 hover:ring-foreground/40 ${LEVEL[d.level]}`}
                    />
                  ) : (
                    <div key={j} className="aspect-square" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollFade>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {hover
            ? `${hover.count === 0 ? "No" : hover.count} contribution${hover.count === 1 ? "" : "s"} on ${fmt(hover.date)}`
            : (
              <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground">
                @{profile.github} on GitHub
              </a>
            )}
        </span>
        <span className="flex items-center gap-1" aria-hidden>
          less
          {LEVEL.map((c, i) => <i key={i} className={`size-2.5 rounded-[2px] ${c}`} />)}
          more
        </span>
      </div>
    </div>
  );
}
