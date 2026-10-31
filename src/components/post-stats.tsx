"use client";

import * as React from "react";
import { IconButton, IconButtonParticles } from "@animate-ui/react/primitives/buttons/icon";
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number";
import { CopyButton, CopyButtonIcon } from "@animate-ui/react/primitives/buttons/copy";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Heart } from "@/components/animate-ui/icons/heart";
import { Link as LinkIcon } from "@/components/animate-ui/icons/link";
import { Check } from "@/components/animate-ui/icons/check";
import { BrandIcon } from "./brand-icon";
import { Tip } from "./tip";

type Stats = { views: number; reactions: number; mine: number; max: number };

const PostStatsContext = React.createContext<{ stats: Stats | null; react: () => void } | null>(null);

function usePostStats() {
  const ctx = React.useContext(PostStatsContext);
  if (!ctx) throw new Error("PostStats components must be inside <PostStatsProvider>");
  return ctx;
}

/** Records one view per visitor per day, then serves views and reactions to the pieces below. */
export function PostStatsProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/${slug}`, { method: "POST", body: JSON.stringify({ action: "view" }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Stats | null) => !cancelled && s && setStats(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const react = React.useCallback(() => {
    // Optimistic: the heart responds at once, the server's numbers replace the guess.
    setStats((s) => (s && s.mine < s.max ? { ...s, mine: s.mine + 1, reactions: s.reactions + 1 } : s));
    fetch(`/api/blog/${slug}`, { method: "POST", body: JSON.stringify({ action: "react" }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Stats | null) => s && setStats(s))
      .catch(() => {});
  }, [slug]);

  return <PostStatsContext.Provider value={{ stats, react }}>{children}</PostStatsContext.Provider>;
}

export function ViewCount() {
  const { stats } = usePostStats();
  return (
    <span className="inline-flex items-center gap-1 tabular-nums" aria-live="polite">
      {stats ? <SlidingNumber number={stats.views} thousandSeparator="," /> : <span className="opacity-50">–</span>}
      <span>{stats?.views === 1 ? "view" : "views"}</span>
    </span>
  );
}

export function Reactions() {
  const { stats, react } = usePostStats();
  const mine = stats?.mine ?? 0;
  const max = stats?.max ?? 3;
  const capped = mine >= max;
  const fill = mine / max;
  const label = !stats ? "Loading reactions" : capped ? "Thanks, that's all three" : mine ? `Appreciate it again (${mine}/${max})` : "Appreciate this post";

  return (
    <div className="flex items-center gap-3">
      <Tip label={label}>
        <IconButton
          type="button"
          disabled={!stats}
          aria-label={label}
          aria-pressed={mine > 0}
          tapScale={0.88}
          onClick={(e: React.MouseEvent) => {
            if (capped) return e.preventDefault();
            react();
          }}
          className="grid size-11 place-items-center rounded-full border border-border text-rose-500 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
        >
          <AnimateIcon animateOnHover={!capped} asChild>
            <span className="relative grid size-5 place-items-center">
              <Heart size={20} className="text-muted-foreground" />
              {/* The filled heart rises from the bottom, a third per reaction. */}
              <span
                aria-hidden
                className="absolute inset-0 grid place-items-center transition-[clip-path] duration-500 ease-out"
                style={{ clipPath: `inset(${(1 - fill) * 100}% 0 0 0)` }}
              >
                <Heart size={20} className="fill-rose-500 text-rose-500" />
              </span>
            </span>
          </AnimateIcon>
          {!capped && <IconButtonParticles size={4} count={8} radius={26} spread={360} className="text-rose-500" />}
        </IconButton>
      </Tip>
      <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
        {stats ? <SlidingNumber number={stats.reactions} /> : "–"}
      </span>
    </div>
  );
}

export function Share({ url, title }: { url: string; title: string }) {
  const btn =
    "grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const x = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  return (
    <div className="flex items-center gap-1">
      <Tip label="Share on X">
        <a href={x} target="_blank" rel="noreferrer" aria-label="Share on X" className={btn}>
          <BrandIcon name="x" className="size-3.5" />
        </a>
      </Tip>
      <Tip label="Share on LinkedIn">
        <a href={linkedin} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className={btn}>
          <BrandIcon name="linkedin" className="size-3.5" />
        </a>
      </Tip>
      <Tip label="Copy link">
        <CopyButton content={url} delay={2000} aria-label="Copy link to this post" className={`${btn} data-copied:text-emerald-600 dark:data-copied:text-emerald-400`}>
          <CopyButtonIcon icon={<LinkIcon size={15} />} copiedIcon={<Check size={15} />} />
        </CopyButton>
      </Tip>
    </div>
  );
}
