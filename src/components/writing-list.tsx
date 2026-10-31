"use client";

import Link from "next/link";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { AnimateIcon } from "@animate-ui/react/icons";
import type { Post } from "@/lib/blog";
import { shortDate } from "@/lib/format";

export function WritingList({ posts }: { posts: Pick<Post, "slug" | "title" | "date" | "minutes">[] }) {
  return (
    <Highlight className="rounded-lg bg-accent/70" hover transition={{ type: "spring", stiffness: 380, damping: 34 }}>
      {posts.map((p) => (
        <HighlightItem key={p.slug} value={p.slug} className="-mx-3 rounded-lg">
          <AnimateIcon animateOnHover asChild>
            <Link href={`/blog/${p.slug}`} className="relative flex items-baseline gap-4 px-3 py-3">
              <span className="flex-1 text-[15px]">{p.title}</span>
              <span className="hidden text-sm text-muted-foreground tabular-nums sm:block">
                {shortDate(p.date)}
              </span>
              <span className="w-12 text-right text-sm text-muted-foreground tabular-nums">{p.minutes} min</span>
              <ArrowRight size={14} className="self-center text-muted-foreground" />
            </Link>
          </AnimateIcon>
        </HighlightItem>
      ))}
    </Highlight>
  );
}
