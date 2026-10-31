"use client";

import * as React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, useReducedMotion } from "motion/react";

// The worker is copied into public/ on install (see package.json postinstall), so its version always matches.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/** The PDF pages as paper: each one feeds out of the printer slot once it has rendered. */
export function ResumePaper({
  src, zoom, onStatus,
}: {
  src: string;
  zoom: number;
  onStatus: (s: { status: "loading" | "printing" | "ready" | "error"; pages?: number }) => void;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const [pages, setPages] = React.useState(0);
  const [rendered, setRendered] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fed = rendered >= Math.max(1, pages);

  return (
    <div ref={ref} className="w-full">
      <Document
        file={src}
        loading={null}
        error={null}
        onLoadSuccess={({ numPages }) => {
          setPages(numPages);
          onStatus({ status: "printing", pages: numPages });
        }}
        onLoadError={() => onStatus({ status: "error" })}
      >
        {width > 0 &&
          Array.from({ length: pages }, (_, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { y: "-102%" }}
              animate={rendered > i ? { y: 0 } : undefined}
              // A printer feeds in short pushes, not one glide.
              transition={{ duration: 1.9, delay: i * 0.4, ease: [0.45, 0, 0.2, 1] }}
              onAnimationComplete={() => i === pages - 1 && onStatus({ status: "ready", pages })}
              className="mx-auto mb-4 overflow-hidden bg-white shadow-[0_30px_60px_-25px_rgb(0_0_0/0.55),0_2px_6px_rgb(0_0_0/0.12)]"
              style={{ width: Math.round(width * zoom) }}
            >
              <Page
                pageNumber={i + 1}
                width={Math.round(width * zoom)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div className="aspect-[1/1.414] w-full bg-white" />}
                onRenderSuccess={() => {
                  setRendered((r) => r + 1);
                  if (reduce && i === pages - 1) onStatus({ status: "ready", pages });
                }}
              />
            </motion.div>
          ))}
      </Document>
      {!fed && <span className="sr-only">Loading resume</span>}
    </div>
  );
}
