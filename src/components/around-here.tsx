"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { Keyboard, Laptop, Music2 } from "lucide-react";
import { life } from "@/lib/content";
import { cn } from "@/lib/utils";

type Top = { name: string; wpm: number } | null;
type Note = { name: string; message: string } | null;

function useLive() {
  const [top, setTop] = React.useState<Top | undefined>(undefined);
  const [note, setNote] = React.useState<Note | undefined>(undefined);
  React.useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/typing/leaderboard?mode=30&set=words", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setTop(d?.entries?.[0] ? { name: d.entries[0].name, wpm: Math.round(d.entries[0].wpm) } : null))
      .catch(() => !ctrl.signal.aborted && setTop(null));
    fetch("/api/guestbook", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setNote(d?.entries?.[0] ? { name: d.entries[0].name, message: d.entries[0].message } : null))
      .catch(() => !ctrl.signal.aborted && setNote(null));
    return () => ctrl.abort();
  }, []);
  return { top, note };
}

/** One doorway to another page. Each fills its own shape; the arrow appears on hover. */
function Card({ href, label, className, children, tail }: { href: string; label: string; className?: string; children: React.ReactNode; tail: React.ReactNode }) {
  return (
    <AnimateIcon animateOnHover asChild>
      <Link
        href={href}
        className={cn(
          "group flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-3.5 transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
          className,
        )}
      >
        {children}
        <span className="mt-auto flex items-end justify-between gap-3">
          <span>
            <span className="block text-sm font-medium">{label}</span>
            <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{tail}</span>
          </span>
          <ArrowRight size={14} className="mb-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </span>
      </Link>
    </AnimateIcon>
  );
}

const TILTS = ["-rotate-3", "rotate-2", "-rotate-1"];

/** The rest of the site: a film roll, a record to beat, a note from a visitor, the desk. */
export function AroundHere() {
  const { top, note } = useLive();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      <Card href="/life" label="Off the clock" tail="A roll of film from the weekends." className="col-span-2 sm:col-span-4">
        <span className="flex gap-2 py-1" aria-hidden>
          {life.slice(0, 3).map((s, i) => (
            <span key={s.src} className={cn("relative block aspect-[4/3] flex-1 overflow-hidden rounded-md ring-1 ring-border transition-transform duration-300 group-hover:rotate-0", TILTS[i])}>
              <Image src={s.src} alt="" fill sizes="(min-width: 704px) 150px, 30vw" className="object-cover" />
            </span>
          ))}
        </span>
      </Card>

      <Card
        href="/play"
        label="Typing test"
        tail={top ? `Record held by ${top.name}. Beat it.` : "Thirty seconds. Take the top spot."}
        className="col-span-1 sm:col-span-2"
      >
        <span className="flex h-12 items-center">
          {top ? (
            <span className="inline-flex items-baseline font-mono text-3xl font-medium tabular-nums">
              <SlidingNumber number={top.wpm} inView inViewOnce />
              <span className="ml-1 text-xs text-muted-foreground">wpm</span>
            </span>
          ) : (
            <Keyboard className="size-7 text-foreground/70" strokeWidth={1.5} />
          )}
        </span>
      </Card>

      <Card
        href="/guestbook"
        label="Guestbook"
        tail={note ? `${note.name}, most recently` : "Leave a line. It goes on the wall."}
        className="col-span-2 max-sm:order-4 sm:col-span-4"
      >
        <span className="line-clamp-2 text-[15px] leading-snug text-pretty text-foreground/90">
          {note ? `\u201c${note.message}\u201d` : "Say hello, tell me what you\u2019re building, or just wave."}
        </span>
      </Card>

      <Card href="/uses" label="Uses" tail="The desk, the editor, the soundtrack." className="col-span-1 max-sm:order-3 sm:col-span-2">
        <span className="flex h-12 items-center gap-2.5 text-foreground/70">
          <Laptop className="size-6" strokeWidth={1.5} />
          <Keyboard className="size-6" strokeWidth={1.5} />
          <Music2 className="size-6" strokeWidth={1.5} />
        </span>
      </Card>
    </div>
  );
}
