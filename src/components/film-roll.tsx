"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { FilterTabs } from "./filter-tabs";
import { ScrollFade } from "@animate-ui/react/primitives/effects/scroll-fade";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { life, type LifeShot } from "@/lib/content";

const FILTERS = ["All", "Travel", "Food", "Little things"] as const;
type Filter = (typeof FILTERS)[number];

// Film base and edge printing are physical, so they stay the same in both themes.
function Sprockets() {
  return (
    <div className="flex h-5 items-center gap-[14px] overflow-hidden px-2" aria-hidden>
      {Array.from({ length: 140 }, (_, i) => (
        <span key={i} className="h-[9px] w-[13px] shrink-0 rounded-[2.5px] bg-background/90" />
      ))}
    </div>
  );
}

function Frame({ shot, index, first, onOpen, onFocus }: { shot: LifeShot; index: number; first: boolean; onOpen: () => void; onFocus: () => void }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="flex shrink-0 flex-col items-center"
    >
      <span className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-[#d98a3a]/80" aria-hidden>
        {String(index + 1).padStart(2, "0")}A ▸
      </span>
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        aria-label={`${shot.alt}. ${shot.caption}`}
        className="group relative block h-[min(56vw,300px)] w-[min(45vw,240px)] overflow-hidden rounded-[3px] bg-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-[#d98a3a]"
      >
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="240px"
          priority={first}
          loading={first ? "eager" : "lazy"}
          draggable={false}
          className="object-cover saturate-[0.92] transition duration-500 ease-out group-hover:scale-[1.04] group-hover:saturate-100"
        />
        <span
          className="pointer-events-none absolute right-2 bottom-1.5 font-mono text-[12px] font-semibold tracking-wider text-[#ff9a3c] [text-shadow:0_0_6px_rgb(255_120_40/0.85)]"
          aria-hidden
        >
          {shot.date}
        </span>
      </button>
    </motion.li>
  );
}

export function FilmRoll() {
  const [filter, setFilter] = React.useState<Filter>("All");
  const [hovered, setHovered] = React.useState<LifeShot | null>(null);
  const [open, setOpen] = React.useState<LifeShot | null>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const shots = filter === "All" ? life : life.filter((s) => s.tag === filter);

  React.useEffect(() => {
    scroller.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [filter]);

  React.useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + e.deltaY;
      if ((next <= 0 && el.scrollLeft <= 0) || (next >= max && el.scrollLeft >= max)) return;
      e.preventDefault();
      el.scrollLeft = next;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !scroller.current) return;
    drag.current = { x: e.clientX, left: scroller.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !scroller.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    scroller.current.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    setTimeout(() => (drag.current = null), 0);
  };
  const openShot = (s: LifeShot) => {
    if (drag.current?.moved) return;
    setOpen(s);
  };

  const shown = hovered && shots.includes(hovered) ? hovered : shots[0];

  return (
    <div>
      <FilterTabs label="Filter photos" value={filter} onChange={setFilter} options={FILTERS.map((f) => ({ value: f, label: f }))} />

      <div className="relative left-1/2 mt-8 w-screen -translate-x-1/2">
        <div className="bg-[#1c1a17] shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]">
          <Sprockets />
          <ScrollFade
            ref={scroller}
            orientation="horizontal"
            size={64}
            className="cursor-grab overflow-x-auto py-3 select-none active:cursor-grabbing [scrollbar-width:none]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            <motion.ul layout className="flex w-max items-stretch gap-5 pr-[max(1.5rem,calc(50vw-22rem))] pl-6">
              <li
                aria-hidden
                className="flex w-[max(5.5rem,calc(50vw-22rem-2.75rem))] shrink-0 flex-col justify-center gap-2 pr-4 font-mono text-[#d98a3a]/80"
              >
                <span className="text-right text-[11px] tracking-[0.35em]">ROLL 01 · BLR</span>
                <span className="text-right text-[11px] tracking-[0.35em] text-[#d98a3a]/50">◂ LOAD END</span>
              </li>
              <AnimatePresence mode="popLayout" initial={false}>
                {shots.map((s, i) => (
                  <Frame key={s.src} shot={s} first={i === 0} index={life.indexOf(s)} onOpen={() => openShot(s)} onFocus={() => setHovered(s)} />
                ))}
              </AnimatePresence>
            </motion.ul>
          </ScrollFade>
          <Sprockets />
          <div className="flex justify-between px-6 pb-2 font-mono text-[10px] tracking-[0.3em] text-[#d98a3a]/70" aria-hidden>
            <span>PORTRA 400</span>
            <span>BLR ▸ {String(shots.length).padStart(2, "0")} EXP</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex min-h-12 items-baseline justify-between gap-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {shown && (
            <motion.p
              key={shown.src}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[15px] text-foreground/85"
            >
              “{shown.caption}”
              <span className="ml-2 text-sm text-muted-foreground">{shown.tag}</span>
            </motion.p>
          )}
        </AnimatePresence>
        <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">Drag or scroll the roll · click to develop</span>
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent showCloseButton={false} className="max-w-[min(92vw,640px)] gap-0 overflow-hidden border-0 bg-[#f4f2ee] p-3 pb-0 text-neutral-900 sm:max-w-[min(92vw,640px)]">
          <DialogClose aria-label="Close" className="absolute top-5 right-5 z-10 grid size-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </DialogClose>
          {open && (
            <>
              <div className="relative aspect-[9/11] w-full overflow-hidden rounded-[2px] bg-neutral-200">
                <Image src={open.src} alt={open.alt} fill sizes="640px" className="object-cover" priority />
                <span className="absolute right-3 bottom-2 font-mono text-sm font-semibold tracking-wider text-[#ff9a3c] [text-shadow:0_0_6px_rgb(255_120_40/0.85)]">
                  {open.date}
                </span>
              </div>
              <DialogTitle className="px-1 pt-4 text-[15px] font-normal">“{open.caption}”</DialogTitle>
              <DialogDescription className="px-1 pt-1 pb-5 text-sm text-neutral-500">{open.alt}</DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
