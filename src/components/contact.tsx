"use client";

import * as React from "react";
import { FlipButton, FlipButtonBack, FlipButtonFront } from "@/components/animate-ui/buttons/flip";
import { Magnetic } from "@animate-ui/react/primitives/effects/magnetic";
import {
  ScrollingNumber, ScrollingNumberContainer, ScrollingNumberHighlight, ScrollingNumberItems,
} from "@animate-ui/react/primitives/texts/scrolling-number";
import { Mail } from "@/components/animate-ui/icons/mail";
import { Copy } from "@/components/animate-ui/icons/copy";
import { Check } from "@/components/animate-ui/icons/check";
import { Eye } from "@/components/animate-ui/icons/eye";
import { profile, socials } from "@/lib/content";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { AnimateIcon } from "@animate-ui/react/icons";
import { BrandIcon } from "./brand-icon";
import { openResume } from "./resume";
import { Tip } from "./tip";

export function Contact() {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div>
      <p className="max-w-[34rem] text-pretty text-muted-foreground">
        I&apos;m open to conversations about AI engineering roles, agent infrastructure and interesting
        problems. Email is fastest.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FlipButton
          from="top"
          onClick={copy}
          aria-label={`Copy email address ${profile.email}`}
          className="h-10 rounded-full text-sm font-medium"
        >
          <FlipButtonFront className="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-full bg-foreground text-background">
            <Mail size={15} />
            Email me
          </FlipButtonFront>
          <FlipButtonBack className="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-full bg-foreground text-background">
            {copied ? <Check size={15} animate /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy address"}
          </FlipButtonBack>
        </FlipButton>

        <AnimateIcon animateOnHover asChild>
          <button
            type="button"
            onClick={openResume}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-accent"
          >
            <FileText size={15} />
            Resume
          </button>
        </AnimateIcon>

        <div className="flex items-center gap-1.5">
          {socials.map((s) => (
            <Tip key={s.name} label={s.name}>
              <Magnetic strength={0.4} range={80}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <BrandIcon name={s.icon} className="size-4" />
                </a>
              </Magnetic>
            </Tip>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VisitorCount() {
  const [views, setViews] = React.useState<number | null>(null);
  React.useEffect(() => {
    fetch("/api/views", { method: "POST" })
      .then((r) => r.json())
      .then((d: { views: number | null }) => setViews(d.views))
      .catch(() => {});
  }, []);
  if (views === null) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Eye size={14} animateOnHover />
      <ScrollingNumberContainer number={views} step={1} itemsSize={20} className="relative font-mono tabular-nums text-foreground">
        <ScrollingNumber>
          <ScrollingNumberItems />
        </ScrollingNumber>
        <ScrollingNumberHighlight />
      </ScrollingNumberContainer>
      visitors
    </span>
  );
}
