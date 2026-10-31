"use client";

import * as React from "react";

const EVENT = "pref-change";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null; // Private mode or storage disabled: fall back to the default.
  }
}

/**
 * A small UI preference remembered in localStorage (a view toggle, a layout choice).
 * The server and first paint always use `fallback`, so there's no hydration mismatch;
 * unknown stored values are ignored.
 */
export function usePref<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  const stored = React.useSyncExternalStore(subscribe, () => read(key), () => null);
  const value = stored && (allowed as readonly string[]).includes(stored) ? (stored as T) : fallback;
  const set = React.useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, next);
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );
  return [value, set] as const;
}
