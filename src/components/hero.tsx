"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TopographyBackground } from "@/components/animate-ui/backgrounds/topography";
import { Spring, SpringElement, SpringProvider } from "@animate-ui/react/primitives/spring";
import { SplittingText } from "@animate-ui/react/primitives/texts/splitting";
import { RotatingText, RotatingTextContainer } from "@animate-ui/react/primitives/texts/rotating";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { AnimateIcon } from "@animate-ui/react/icons";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { Mail } from "@/components/animate-ui/icons/mail";
import { Rocket, Timer, Trophy } from "lucide-react";
import type { Weather } from "@/lib/live";
import { profile } from "@/lib/content";
import { cn } from "@/lib/utils";
import { PhotoStack } from "./photo-stack";
import { Tip } from "./tip";
import { NameAudio } from "./name-audio";
import { PresenceDot, usePresence } from "./presence";
import { openResume } from "./resume";
import { AgentGraph, Journey, LocalStrip } from "./hero-pieces";

/** A bento tile: a soft spotlight follows the pointer across it. */
function Tile({ className, children, delay = 0, label }: { className?: string; children: React.ReactNode; delay?: number; label?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group/tile relative overflow-hidden rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/20",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 before:[background:radial-gradient(260px_circle_at_var(--x)_var(--y),color-mix(in_oklab,var(--foreground)_7%,transparent),transparent_70%)] hover:before:opacity-100",
        className,
      )}
    >
      {label && <p className="relative mb-2 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">{label}</p>}
      {children}
    </motion.div>
  );
}

/** A phrase with a hand-drawn underline that draws itself in. */
function Scribble({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-emerald-500">
        <motion.path
          d="M2 8 C 40 3, 70 11, 104 6 S 170 2, 198 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 1.1, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}

function Fact({ icon: Icon, children, tip }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; tip: string }) {
  return (
    <Tip label={tip}>
      <span className="group/fact inline-flex cursor-default items-center gap-1.5 text-[13px] text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-md border border-border bg-background transition-transform duration-300 group-hover/fact:-rotate-12">
          <Icon className="size-3.5 text-foreground/80" />
        </span>
        {children}
      </span>
    </Tip>
  );
}

export function Hero({ weather, streak, shipped }: { weather: Weather | null; streak: number | null; shipped: number }) {
  const presence = usePresence(weather);
  const [copied, setCopied] = React.useState(false);

  return (
    <section className="relative -mt-16 overflow-hidden pt-24 pb-4 sm:pt-28">
      <TopographyBackground
        aria-hidden
        levels={14}
        speed={0.5}
        peak={0.8}
        className="absolute inset-0 text-neutral-300 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] dark:text-neutral-800"
      />

      <div className="relative mx-auto grid w-full max-w-[44rem] grid-cols-2 gap-3 px-6 sm:grid-cols-6">
        {/* Who, and what to do next */}
        <Tile className="col-span-2 flex flex-col sm:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <SpringProvider>
              <Spring className="pointer-events-none absolute top-0 left-0 z-10 overflow-visible text-muted-foreground" />
              <Tip label="Drag me">
                <SpringElement className="relative inline-block cursor-grab touch-none active:cursor-grabbing">
                  <span className="relative block">
                    <Image
                      src={`https://github.com/${profile.github}.png`}
                      alt={profile.name}
                      width={56}
                      height={56}
                      priority
                      draggable={false}
                      className="size-14 rounded-full border border-border bg-muted"
                    />
                    <PresenceDot presence={presence} />
                  </span>
                </SpringElement>
              </Tip>
            </SpringProvider>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Open to AI/ML roles
            </span>
          </div>

          <h1 className="mt-4 flex items-center gap-1 text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[2.5rem]">
            <SplittingText text={profile.name} type="chars" stagger={0.03} />
            <NameAudio />
          </h1>
          <RotatingTextContainer text={profile.roles} duration={2600} className="mt-1.5 h-7 py-0.5 text-base leading-6 text-muted-foreground">
            <RotatingText />
          </RotatingTextContainer>

          <p className="mt-4 max-w-[30rem] text-[15.5px] leading-relaxed text-pretty text-foreground/85">
            I build AI agents, and I can&apos;t sit on an idea for long. Most of mine get <Scribble>built, shipped and shown</Scribble> within the week.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <Fact icon={Rocket} tip="Every one has a write-up below">
              <span className="font-mono text-foreground tabular-nums"><CountingNumber number={shipped} inView inViewOnce /></span> shipped
            </Fact>
            <Fact icon={Timer} tip="Customer AI prototypes at Lyzr AI">
              prototypes in <span className="font-mono text-foreground">2–4</span> days
            </Fact>
            <Fact icon={Trophy} tip="LeetCode Knight, top 4.7% globally">
              Knight <span className="font-mono text-foreground">1887</span>
            </Fact>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-5">
            <AnimateIcon animateOnHover asChild>
              <button
                type="button"
                onClick={openResume}
                className="relative inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform active:scale-[0.97]"
              >
                <FileText size={15} /> Resume
              </button>
            </AnimateIcon>
            <AnimateIcon animateOnHover asChild>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(profile.email);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                }}
                className="relative inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors hover:bg-accent"
              >
                <Mail size={15} /> {copied ? "Copied!" : "Copy email"}
              </button>
            </AnimateIcon>
          </div>
        </Tile>

        {/* Photos: drag them, fan them. */}
        <Tile delay={0.05} className="col-span-2 grid place-items-center overflow-visible p-0 max-sm:h-60 sm:col-span-2">
          {/* Scaled down, inside a box of the scaled size so it centres and doesn't spill. */}
          <div className="h-[166px] w-[216px] sm:h-[152px] sm:w-[198px]">
            <div className="origin-top-left scale-[0.72] sm:scale-[0.66]">
              <PhotoStack />
            </div>
          </div>
        </Tile>

        {/* What I build */}
        <Tile delay={0.1} label="What I build · drag the nodes" className="col-span-2 sm:col-span-3">
          <AgentGraph />
        </Tile>

        {/* Where I've been */}
        <Tile delay={0.15} label="Path so far" className="col-span-2 sm:col-span-3">
          <Journey />
        </Tile>

        {/* Right now in Bengaluru */}
        <Tile delay={0.2} className={cn("col-span-2 py-3 sm:col-span-6")}>
          <LocalStrip weather={weather} streak={streak} />
        </Tile>
      </div>
    </section>
  );
}
