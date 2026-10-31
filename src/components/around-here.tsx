"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { Keyboard, Music2 } from "lucide-react";
import { life } from "@/lib/content";

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

function Card({ href, label, art, children }: { href: string; label: string; art: React.ReactNode; children: React.ReactNode }) {
  return (
    <AnimateIcon animateOnHover asChild>
      <Link
        href={href}
        className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-3.5 transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-foreground/20"
      >
        <span className="flex items-center justify-between">
          {art}
          <ArrowRight size={14} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-auto">
          <span className="block text-sm font-medium">{label}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">{children}</span>
        </span>
      </Link>
    </AnimateIcon>
  );
}

/** The rest of the site, one small card each. */
export function AroundHere() {
  const { top, note } = useLive();
  const art = "grid h-8 min-w-8 place-items-center rounded-lg border border-border bg-background px-1.5";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card
        href="/play"
        label="Typing test"
        art={
          <span className={art}>
            {top ? (
              <span className="inline-flex items-baseline font-mono text-xs tabular-nums"><SlidingNumber number={top.wpm} inView inViewOnce /><span className="ml-0.5 text-[10px] text-muted-foreground">wpm</span></span>
            ) : (
              <Keyboard className="size-4" />
            )}
          </span>
        }
      >
        {top ? `Record held by ${top.name}. Beat it.` : top === null ? "No scores yet. Set the first one." : "Checking the leaderboard…"}
      </Card>
      <Card href="/guestbook" label="Guestbook" art={<span className={`${art} font-serif text-base`}>“</span>}>
        {note ? `“${note.message}” – ${note.name}` : note === null ? "Empty so far. Be the first to sign." : "Fetching the latest note…"}
      </Card>
      <Card
        href="/life"
        label="Off the clock"
        art={
          <span className="flex gap-0.5 rounded-[3px] bg-[#1c1a17] p-0.5" aria-hidden>
            {life.slice(0, 3).map((s) => (
              <span key={s.src} className="relative block h-7 w-5 overflow-hidden rounded-[1px]">
                <Image src={s.src} alt="" fill sizes="20px" className="object-cover" />
              </span>
            ))}
          </span>
        }
      >
        A roll of film from the weekends.
      </Card>
      <Card href="/uses" label="Uses" art={<span className={art}><Music2 className="size-4" /></span>}>
        The desk, the editor, and the soundtrack.
      </Card>
    </div>
  );
}
