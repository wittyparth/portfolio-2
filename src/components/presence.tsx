"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { presenceDot, presenceFor, type Presence } from "@/lib/presence";
import type { Weather } from "@/lib/live";
import { profile } from "@/lib/content";

function istNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric", hourCycle: "h23", weekday: "short", timeZone: profile.timezone,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 12);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { hour, day };
}

export function usePresence(weather: Weather | null) {
  const [presence, setPresence] = React.useState<Presence | null>(null);
  React.useEffect(() => {
    const update = () => {
      const { hour, day } = istNow();
      setPresence(presenceFor(hour, day, weather));
    };
    const id = setInterval(update, 60_000);
    const first = setTimeout(update, 0);
    return () => {
      clearInterval(id);
      clearTimeout(first);
    };
  }, [weather]);
  return presence;
}

export function PresenceDot({ presence }: { presence: Presence | null }) {
  return (
    <span
      className={`absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-[2.5px] border-background transition-colors duration-500 ${presence ? presenceDot[presence.state] : "bg-neutral-300 dark:bg-neutral-700"}`}
      aria-hidden
    />
  );
}

export function PresenceLine({ presence }: { presence: Presence | null }) {
  return (
    <span className="relative inline-flex min-h-5 items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {presence && (
          <motion.span
            key={presence.line}
            initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2"
          >
            <span className={`size-1.5 rounded-full ${presenceDot[presence.state]}`} />
            {presence.line}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
