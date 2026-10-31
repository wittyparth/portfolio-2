"use client";

import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Images in posts and case studies: inline at column width, full size in a lightbox on click.
export function ZoomImage({ src, alt = "", caption }: { src: string; alt?: string; caption?: string }) {
  const text = caption ?? alt;
  return (
    <figure className="my-8 sm:-mx-4">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}
            className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Image src={src} alt={alt} width={1600} height={1000} sizes="(min-width: 768px) 720px, 100vw" className="h-auto w-full" />
          </button>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(94vw,1400px)] gap-0 overflow-hidden border-0 bg-black p-0 sm:max-w-[min(94vw,1400px)]"
        >
          <DialogClose
            aria-label="Close"
            className="absolute top-3 right-3 z-20 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <X className="size-4" />
          </DialogClose>
          <DialogTitle className="sr-only">{alt || "Image"}</DialogTitle>
          <DialogDescription className="sr-only">Press Escape to close.</DialogDescription>
          <Image src={src} alt={alt} width={2400} height={1500} sizes="94vw" className="h-auto max-h-[88vh] w-full object-contain" />
        </DialogContent>
      </Dialog>
      {text && <figcaption className="mt-3 text-center text-sm text-muted-foreground">{text}</figcaption>}
    </figure>
  );
}
