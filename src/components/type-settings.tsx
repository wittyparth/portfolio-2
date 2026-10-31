"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Reading preferences live on <html> as data attributes (see globals.css). layout.tsx applies the
// saved values before first paint, so there's no flash of the default font.
export const FONTS = [
  { value: "sans", label: "Sans", sample: "font-sans" },
  { value: "serif", label: "Serif", sample: "font-[family-name:var(--font-serif)]" },
  { value: "readable", label: "Readable", sample: "font-[family-name:var(--font-readable)]" },
  { value: "mono", label: "Mono", sample: "font-mono" },
] as const;
export const SIZES = ["sm", "md", "lg", "xl"] as const;
const SIZE_LABEL = { sm: "Small", md: "Default", lg: "Large", xl: "Larger" };

type Font = (typeof FONTS)[number]["value"];
type Size = (typeof SIZES)[number];
const EVENT = "type-settings-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function set(key: "font" | "size", value: string) {
  localStorage.setItem(`type-${key}`, value);
  document.documentElement.dataset[key] = value;
  window.dispatchEvent(new Event(EVENT));
}

export function TypeSettings({ className }: { className?: string }) {
  const font = React.useSyncExternalStore(subscribe, () => (localStorage.getItem("type-font") ?? "sans") as Font, () => "sans" as Font);
  const size = React.useSyncExternalStore(subscribe, () => (localStorage.getItem("type-size") ?? "md") as Size, () => "md" as Size);
  const i = SIZES.indexOf(size);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Reading settings: font and text size" className={cn("font-serif text-[13px] font-semibold", className)}>
          Aa
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-xl p-1.5">
        <DropdownMenuLabel className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">Text size</DropdownMenuLabel>
        <div className="flex items-center gap-2 px-2 pb-2">
          <button
            type="button"
            aria-label="Smaller text"
            disabled={i === 0}
            onClick={() => set("size", SIZES[i - 1])}
            className="grid size-8 place-items-center rounded-lg border border-border transition-colors hover:bg-accent disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          {/* Four steps, drawn as growing letters. */}
          <div className="flex flex-1 items-end justify-center gap-2.5" role="radiogroup" aria-label="Text size">
            {SIZES.map((s, n) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={s === size}
                aria-label={SIZE_LABEL[s]}
                onClick={() => set("size", s)}
                className={cn("leading-none transition-colors", s === size ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground")}
                style={{ fontSize: 11 + n * 3 }}
              >
                A
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Larger text"
            disabled={i === SIZES.length - 1}
            onClick={() => set("size", SIZES[i + 1])}
            className="grid size-8 place-items-center rounded-lg border border-border transition-colors hover:bg-accent disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">Font</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={font} onValueChange={(v) => set("font", v)}>
          {FONTS.map((f) => (
            <DropdownMenuRadioItem key={f.value} value={f.value} onSelect={(e) => e.preventDefault()} className="cursor-pointer rounded-lg py-2">
              <span className={cn("text-[15px]", f.sample)}>{f.label}</span>
              <span className={cn("ml-auto pr-5 text-xs text-muted-foreground", f.sample)}>Ag 123</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
