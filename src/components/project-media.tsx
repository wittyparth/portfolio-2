"use client";

import * as React from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import {
  Tabs, TabsContent, TabsContents, TabsHighlight, TabsHighlightItem, TabsList, TabsTrigger,
} from "@animate-ui/react/primitives/tabs";
import { CarouselCounter, CarouselDots } from "@animate-ui/react/primitives/carousel";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Project } from "@/lib/projects";
import { ArchitectureDiagram } from "./architecture-diagram";
import { cn } from "@/lib/utils";

type Mode = "images" | "video" | "architecture";

function Gallery({
  project, sizes, onOpen, startIndex = 0, onIndex, large = false,
}: {
  project: Project;
  sizes: string;
  onOpen?: (index: number) => void;
  startIndex?: number;
  onIndex?: (index: number) => void;
  large?: boolean;
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const many = project.gallery.length > 1;

  React.useEffect(() => {
    if (!api || !onIndex) return;
    const update = () => onIndex(api.selectedScrollSnap());
    api.on("select", update);
    return () => void api.off("select", update);
  }, [api, onIndex]);

  return (
    <Carousel opts={{ loop: many, watchDrag: many, align: "center", startIndex }} setApi={setApi} className="group/gallery">
      <CarouselContent className="ml-0">
        {project.gallery.map((img, i) => (
          <CarouselItem key={img.src} className="pl-0">
            <button
              type="button"
              onClick={() => onOpen?.(i)}
              disabled={!onOpen}
              aria-label={onOpen ? `Open ${img.alt} full screen` : img.alt}
              className={cn("relative block aspect-[16/10] w-full", onOpen ? "cursor-zoom-in" : "cursor-default")}
            >
              {project.placeholder && !large ? (
                // The stand-in art carries its own "replace me" line along the bottom edge; crop it and say so calmly instead.
                <span className="absolute inset-x-0 top-0 block h-[112%]">
                  <Image src={img.src} alt={img.alt} fill sizes={sizes} className="object-cover" />
                </span>
              ) : (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={sizes}
                  className={cn("object-cover", large && "object-contain")}
                  priority={large}
                />
              )}
            </button>
            {large && <p className="px-6 pt-3 pb-10 text-center text-sm text-white/80">{img.alt}</p>}
          </CarouselItem>
        ))}
      </CarouselContent>

      {project.placeholder && !large && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white/90 backdrop-blur">
          Placeholder screen
        </span>
      )}

      {many && (
        <>
          <CarouselPrevious
            variant="secondary"
            className="left-3 opacity-0 shadow-sm transition-opacity group-hover/gallery:opacity-100 focus-visible:opacity-100 max-sm:hidden"
          />
          <CarouselNext
            variant="secondary"
            className="right-3 opacity-0 shadow-sm transition-opacity group-hover/gallery:opacity-100 focus-visible:opacity-100 max-sm:hidden"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-end gap-2 px-3">
            <CarouselCounter
              format={(current, count) => (
                <>
                  {current}
                  <span className="text-white/80">/ {count}</span>
                </>
              )}
              className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white tabular-nums backdrop-blur"
            />
            {/* Dots stay 6px to look; 18px gaps keep them 24px apart (WCAG target spacing) and ::after widens each hit area. */}
            <CarouselDots className="pointer-events-auto flex items-center !gap-[18px] rounded-full bg-black/55 px-3 py-2 text-white backdrop-blur [&_button]:relative [&_button]:!size-1.5 [&_button]:after:absolute [&_button]:after:-inset-[9px] [&_button]:after:content-['']" />
          </div>
        </>
      )}
    </Carousel>
  );
}

function DemoVideo({ src, poster, active, title }: { src: string; poster: string; active: boolean; title: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [inView, setInView] = React.useState(false);
  const [paused, setPaused] = React.useState(true);
  const [userPaused, setUserPaused] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && inView && !userPaused && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [active, inView, userPaused, reduce]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      setUserPaused(false);
      v.play().catch(() => {});
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  return (
    <div className="relative size-full bg-black">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${title} demo video`}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
        onClick={toggle}
        className="size-full cursor-pointer object-cover"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? "Play demo" : "Pause demo"}
        className="absolute bottom-3 left-3 grid size-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
      >
        {paused ? (
          <svg viewBox="0 0 16 16" className="size-3.5 translate-x-px" fill="currentColor" aria-hidden><path d="M4 2.5v11l9-5.5z" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" /></svg>
        )}
      </button>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15" aria-hidden>
        <div className="h-full bg-white/80 transition-[width] duration-200 ease-linear" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export function ProjectMedia({ project }: { project: Project }) {
  const modes: Mode[] = [];
  if (project.gallery.length > 0) modes.push("images");
  if (project.video) modes.push("video");
  if (project.architecture) modes.push("architecture");
  const [mode, setMode] = React.useState<Mode>(modes[0] ?? "images");
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  if (modes.length === 0) return null;

  return (
    <>
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <div className="relative">
          <TabsContents>
            {modes.includes("images") && (
              <TabsContent value="images">
                <Gallery
                  project={project}
                  sizes="(max-width: 768px) 100vw, 704px"
                  onOpen={(i) => setLightbox(i)}
                />
              </TabsContent>
            )}
            {project.video && (
              <TabsContent value="video" className="aspect-[16/10]">
                <DemoVideo src={project.video.src} poster={project.video.poster} active={mode === "video"} title={project.name} />
              </TabsContent>
            )}
            {project.architecture && (
              <TabsContent value="architecture">
                <ArchitectureDiagram data={project.architecture} compact />
              </TabsContent>
            )}
          </TabsContents>

          {modes.length > 1 && (
            <TabsList className="absolute top-3 right-3 z-10 flex rounded-full bg-black/55 p-0.5 text-xs text-white backdrop-blur">
              <TabsHighlight className="rounded-full bg-white/20">
                {modes.map((m) => (
                  <TabsHighlightItem key={m} value={m}>
                    <TabsTrigger value={m} className="px-3 py-1 capitalize text-white/80 transition-colors data-[state=active]:text-white">
                      {m}
                    </TabsTrigger>
                  </TabsHighlightItem>
                ))}
              </TabsHighlight>
            </TabsList>
          )}
        </div>
      </Tabs>

      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(92vw,1200px)] gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-[min(92vw,1200px)]"
        >
          <DialogClose
            aria-label="Close"
            className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </DialogClose>
          <DialogTitle className="sr-only">{project.name} screenshots</DialogTitle>
          <DialogDescription className="sr-only">Use the arrow keys or swipe to browse.</DialogDescription>
          {lightbox !== null && (
            <div className="w-full">
              <Gallery project={project} sizes="92vw" startIndex={lightbox} large />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A project's cover. Stand-in art carries its own "replace me" line along the bottom edge,
 * so placeholder covers are cropped just above it; real covers render untouched.
 */
export function Cover({
  src, placeholder, width, height, sizes, imgClassName,
}: {
  src: string;
  placeholder?: boolean;
  width: number;
  height: number;
  sizes: string;
  imgClassName?: string;
}) {
  if (!placeholder) {
    return <Image src={src} alt="" width={width} height={height} sizes={sizes} className={cn("aspect-[16/10] w-full object-cover", imgClassName)} />;
  }
  return (
    <span className="relative block aspect-[16/10] w-full overflow-hidden">
      <Image src={src} alt="" width={width} height={height} sizes={sizes} className={cn("absolute inset-x-0 top-0 h-[112%] w-full object-cover", imgClassName)} />
    </span>
  );
}
