// Tiny, dependency-free triggers for the site's overlays (⌘K palette, resume viewer).
// The overlays themselves load lazily (see components/lazy-overlays.tsx), so a request made
// before they mount is remembered here and picked up when they do.

export const PALETTE_EVENT = "open-command-palette";
export const RESUME_EVENT = "open-resume";
/** Fired on any request, so the lazy loader can mount the overlays right away. */
export const OVERLAY_REQUEST = "overlay-request";

const pending = new Set<string>();

function request(event: string) {
  pending.add(event);
  window.dispatchEvent(new Event(OVERLAY_REQUEST));
  window.dispatchEvent(new Event(event));
}

/** True (once) if this overlay was asked for before it mounted. */
export function takePending(event: string) {
  if (typeof window === "undefined") return false;
  return pending.delete(event);
}

/** Mark a request as handled by a mounted overlay. */
export const settle = (event: string) => pending.delete(event);

export const openCommandPalette = () => request(PALETTE_EVENT);
export const openResume = () => request(RESUME_EVENT);
