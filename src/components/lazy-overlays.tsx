"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { OVERLAY_REQUEST, openCommandPalette } from "@/lib/overlays";
import type { SearchIndex } from "./command-palette";

// None of these are needed for the first paint, so they stay out of the initial bundle.
const CommandPalette = dynamic(() => import("./command-palette").then((m) => m.CommandPalette), { ssr: false });
const ResumeViewer = dynamic(() => import("./resume").then((m) => m.ResumeViewer), { ssr: false });
const EasterEggs = dynamic(() => import("./easter-eggs").then((m) => m.EasterEggs), { ssr: false });

/** Mounts the overlays once the page is idle, or straight away when one is asked for. */
export function LazyOverlays({ index }: { index: SearchIndex }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    const idle = window.requestIdleCallback?.(go, { timeout: 4000 }) ?? window.setTimeout(go, 2500);
    // ⌘K before the palette has loaded: remember it, load, and the palette opens on mount.
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommandPalette();
      }
    };
    window.addEventListener(OVERLAY_REQUEST, go);
    window.addEventListener("keydown", onKey);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      window.removeEventListener(OVERLAY_REQUEST, go);
      window.removeEventListener("keydown", onKey);
    };
  }, [ready]);

  if (!ready) return null;
  return (
    <>
      <CommandPalette index={index} />
      <ResumeViewer />
      <EasterEggs />
    </>
  );
}
