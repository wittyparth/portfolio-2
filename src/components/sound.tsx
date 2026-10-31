"use client";

import * as React from "react";

type SoundContext = { enabled: boolean; toggle: () => void; play: (kind?: "tap" | "toggle") => void };

const Ctx = React.createContext<SoundContext | null>(null);
const KEY = "sound-enabled";
const CHANGE = "sound-enabled-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const enabled = React.useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY) === "1",
    () => false,
  );
  const audio = React.useRef<AudioContext | null>(null);

  const blip = React.useCallback((kind: "tap" | "toggle") => {
    audio.current ??= new AudioContext();
    const ctx = audio.current;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(kind === "tap" ? 1400 : 880, t);
    osc.frequency.exponentialRampToValueAtTime(kind === "tap" ? 600 : 1320, t + 0.06);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(kind === "tap" ? 0.06 : 0.08, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }, []);

  const play = React.useCallback(
    (kind: "tap" | "toggle" = "tap") => {
      if (enabled) blip(kind);
    },
    [enabled, blip],
  );

  const toggle = React.useCallback(() => {
    const next = localStorage.getItem(KEY) !== "1";
    localStorage.setItem(KEY, next ? "1" : "0");
    window.dispatchEvent(new Event(CHANGE));
    if (next) blip("toggle");
  }, [blip]);

  React.useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], [data-sound]")) blip("tap");
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [enabled, blip]);

  const value = React.useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSound() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  return ctx;
}
