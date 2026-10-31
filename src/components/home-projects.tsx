"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayoutDashboard } from "@/components/animate-ui/icons/layout-dashboard";
import { Rows3 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { ViewToggle } from "./view-toggle";
import { AutoHeight } from "@animate-ui/react/primitives/effects/auto-height";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down";
import { ProjectEntry } from "./project-entry";
import { ProjectTable } from "./project-table";

type View = "cards" | "table";
const KEY = "home-projects-view";

function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(KEY, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Featured projects as cards by default; the table trades the media for every project at a glance. */
export function HomeProjects({ featured, all }: { featured: Project[]; all: Project[] }) {
  const reduce = useReducedMotion();
  const [expanded, setExpanded] = React.useState(false);

  // Remember the reader's choice between visits. The server always renders cards.
  const view = React.useSyncExternalStore(
    subscribe,
    () => (localStorage.getItem(KEY) === "table" ? "table" : "cards") as View,
    () => "cards" as View,
  );
  const choose = (v: View) => {
    localStorage.setItem(KEY, v);
    window.dispatchEvent(new Event(KEY));
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {view === "table" && expanded ? `All ${all.length} projects` : `${featured.length} featured of ${all.length}`}
        </p>
        <ViewToggle
          value={view}
          onChange={choose}
          views={[
            { value: "cards", label: "Cards", icon: <LayoutDashboard size={14} /> },
            { value: "table", label: "Table", icon: <Rows3 className="size-3.5" /> },
          ]}
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {view === "cards" ? (
            <div className="space-y-6">
              {featured.map((p) => <ProjectEntry key={p.slug} project={p} />)}
            </div>
          ) : (
            <>
              <AutoHeight deps={[expanded]} transition={{ type: "spring", stiffness: 240, damping: 30 }}>
                <ProjectTable projects={expanded ? all : featured} />
              </AutoHeight>
              {all.length > featured.length && (
                <AnimateIcon animateOnHover asChild>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {expanded ? "Show fewer" : `Show all ${all.length}`}
                    <ChevronDown size={14} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                </AnimateIcon>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
