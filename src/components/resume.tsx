"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Download, Minus, Plus, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { profile } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Tip } from "./tip";

// pdf.js is heavy; it only loads the first time someone opens the resume.
const ResumePaper = dynamic(() => import("./resume-paper").then((m) => m.ResumePaper), { ssr: false });

export const RESUME = "/documents/Resume.pdf";
const OPEN_EVENT = "open-resume";
export const openResume = () => window.dispatchEvent(new Event(OPEN_EVENT));

type Status = "loading" | "printing" | "ready" | "error";
const LABEL: Record<Status, string> = { loading: "warming up", printing: "printing", ready: "ready", error: "paper jam" };

const tool =
  "grid size-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";

export function ResumeViewer() {
  const [open, setOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [state, setState] = React.useState<{ status: Status; pages?: number }>({ status: "loading" });

  React.useEffect(() => {
    const onOpen = () => {
      setState({ status: "loading" });
      setZoom(1);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  const file = `${profile.fullName.replace(/\s+/g, "-")}-Resume.pdf`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(94dvh,1080px)] w-[min(96vw,780px)] max-w-none flex-col items-center gap-0 border-0 bg-transparent p-0 shadow-none ring-0 outline-none sm:max-w-none"
      >
        <DialogTitle className="sr-only">{profile.fullName}&apos;s resume</DialogTitle>
        <DialogDescription className="sr-only">A preview of the resume PDF, with zoom and download.</DialogDescription>

        {/* The printer: always dark, it's an object on the desk, not part of the page theme. */}
        <div className="relative z-10 w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-3 pt-3 pb-4 text-neutral-200 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-white/5">
          <div className="flex items-center gap-3 pl-2">
            <span className="relative flex size-2">
              {state.status !== "ready" && state.status !== "error" && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-70 motion-reduce:animate-none" />
              )}
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  state.status === "ready" ? "bg-emerald-400" : state.status === "error" ? "bg-rose-500" : "bg-amber-400",
                )}
              />
            </span>
            <p className="min-w-0 flex-1 truncate font-mono text-xs">
              Resume.pdf <span className="text-neutral-500">· {LABEL[state.status]}</span>
              {state.pages ? <span className="text-neutral-500"> · {state.pages} {state.pages === 1 ? "page" : "pages"}</span> : null}
            </p>
            <div className="flex items-center gap-0.5">
              <Tip label="Zoom out" side="bottom">
                <button type="button" className={cn(tool, "hidden sm:grid")} aria-label="Zoom out" disabled={zoom <= 0.6} onClick={() => setZoom((z) => +(z - 0.2).toFixed(1))}>
                  <Minus className="size-4" />
                </button>
              </Tip>
              <span className="hidden w-11 text-center font-mono text-[11px] text-neutral-400 tabular-nums sm:block" aria-live="polite">
                {Math.round(zoom * 100)}%
              </span>
              <Tip label="Zoom in" side="bottom">
                <button type="button" className={cn(tool, "hidden sm:grid")} aria-label="Zoom in" disabled={zoom >= 1.8} onClick={() => setZoom((z) => +(z + 0.2).toFixed(1))}>
                  <Plus className="size-4" />
                </button>
              </Tip>
              <span className="mx-1 hidden h-4 w-px bg-neutral-800 sm:block" />
              <Tip label="Download" side="bottom">
                <a href={RESUME} download={file} className={tool} aria-label="Download the resume">
                  <Download className="size-4" />
                </a>
              </Tip>
              <Tip label="Open in a new tab" side="bottom">
                <a href={RESUME} target="_blank" rel="noreferrer" className={tool} aria-label="Open the resume in a new tab">
                  <ExternalLink size={16} animateOnHover />
                </a>
              </Tip>
              <DialogClose className={tool} aria-label="Close">
                <X className="size-4" />
              </DialogClose>
            </div>
          </div>
          {/* The slot the paper comes out of. */}
          <div aria-hidden className="absolute inset-x-6 -bottom-1 h-2 rounded-full bg-black shadow-[inset_0_2px_3px_rgb(0_0_0/0.9)] ring-1 ring-white/5" />
        </div>

        {/* Paper path: clipped at the slot, scrollable below it. */}
        <div className="relative -mt-1 w-[calc(100%-2.5rem)] flex-1 overflow-auto overscroll-contain [scrollbar-width:thin]">
          <div className="flex min-w-full justify-center pt-1">
            {open && (
              <ResumePaper src={RESUME} zoom={zoom} onStatus={setState} />
            )}
          </div>
          {state.status === "error" && (
            <div className="mx-auto mt-10 max-w-xs rounded-xl bg-background p-5 text-center text-sm">
              <p className="font-medium">Paper jam.</p>
              <p className="mt-1 text-muted-foreground">The preview couldn&apos;t load. The file is still there:</p>
              <a href={RESUME} download={file} className="mt-3 inline-flex items-center gap-1.5 underline underline-offset-4">
                <Download className="size-3.5" /> Download the PDF
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
