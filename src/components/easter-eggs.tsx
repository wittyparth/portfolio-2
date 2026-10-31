"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FireworksBackground } from "@/components/animate-ui/backgrounds/fireworks";
import { profile } from "@/lib/content";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
const SHOW_MS = 7000;

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName);
}

let greeted = false;

function greet() {
  if (greeted) return;
  greeted = true;
  const big = "font: 600 15px/1.6 ui-sans-serif, system-ui; color: #10b981";
  const body = "font: 13px/1.6 ui-sans-serif, system-ui; color: inherit";
  console.log(
    `%cHey, curious developer.%c\nYou opened the console, so you're my kind of person.\n` +
      `· The source lives at https://github.com/${profile.github}\n` +
      `· Leave a note at ${location.origin}/guestbook\n` +
      `· Try the Konami code anywhere on the site.`,
    big,
    body,
  );
}

export function EasterEggs() {
  const [party, setParty] = React.useState(0);
  const progress = React.useRef(0);
  const timer = React.useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    greet();
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) {
        progress.current = 0;
        return;
      }
      const key = e.key.toLowerCase();
      if (key === KONAMI[progress.current]) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          setParty((p) => p + 1);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setParty(0), SHOW_MS);
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {party > 0 && (
        <motion.div
          key="party"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed inset-0 z-[60]"
        >
          {!reduce && <FireworksBackground className="absolute inset-0 bg-transparent" population={2} />}
          <div className="absolute inset-x-0 bottom-24 flex justify-center sm:bottom-10" role="status">
            <span className="rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
              ↑↑↓↓←→←→BA. You found it. Old-school, respect.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
