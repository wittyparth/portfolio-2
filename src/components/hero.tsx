"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TopographyBackground } from "@/components/animate-ui/backgrounds/topography";
import { Spring, SpringElement, SpringProvider } from "@animate-ui/react/primitives/spring";
import { SplittingText } from "@animate-ui/react/primitives/texts/splitting";
import { CountingNumber } from "@animate-ui/react/primitives/texts/counting-number";
import { AnimateIcon } from "@animate-ui/react/icons";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { Rocket, Timer } from "lucide-react";
import { TechLogo } from "./tech-logo";
import type { Weather } from "@/lib/live";
import { profile, socials } from "@/lib/content";
import { BrandIcon, brandIcons } from "./brand-icon";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
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
      // Visible from the first paint (the intro paragraph is the LCP); only a short rise plays.
      initial={reduce ? false : { y: 10 }}
      animate={{ y: 0 }}
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
      {label && <p className="relative mb-2 text-xs text-muted-foreground">{label}</p>}
      {children}
    </motion.div>
  );
}

/** The role line: always a real role on screen, trading places every few seconds. */
function RoleLine({ roles }: { roles: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % roles.length), 2800);
    return () => window.clearInterval(id);
  }, [reduce, roles.length]);
  return (
    <div className="relative mt-1.5 h-7 overflow-hidden py-0.5 text-base leading-6 text-muted-foreground">
      <span className="sr-only">{roles.join(", ")}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          aria-hidden
          className="block"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** A phrase with a hand-drawn underline that draws itself in. */
function Scribble({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2.5 w-full text-foreground/45">
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

const LeetCode = ({ className }: { className?: string }) => <TechLogo name="LeetCode" className={cn(className, "!text-foreground")} />;

function Fact({ icon: Icon, children, tip }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; tip: string }) {
  return (
    <Tip label={tip}>
      <span className="group/fact inline-flex cursor-default items-center gap-1.5 text-[13px] whitespace-nowrap text-muted-foreground">
        <Icon className="size-3.5 text-foreground/70 max-sm:hidden transition-transform duration-300 group-hover/fact:-rotate-12" />
        {children}
      </span>
    </Tip>
  );
}

export function Hero({ weather, streak, shipped }: { weather: Weather | null; streak: number | null; shipped: number }) {
  const presence = usePresence(weather);
  const mobile = useIsMobile();
  // The animated contour background is decoration: start it once the page is idle, and skip it on phones.
  const [backdrop, setBackdrop] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setBackdrop(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section className="relative -mt-16 overflow-hidden pt-24 pb-4 sm:pt-28">
      {backdrop && !mobile && <TopographyBackground
        aria-hidden
        levels={14}
        speed={0.5}
        peak={0.8}
        className="absolute inset-0 text-neutral-300 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] dark:text-neutral-800"
      />}

      <div className="relative mx-auto grid w-full max-w-[44rem] grid-cols-2 gap-3 px-6 sm:grid-cols-6">
        {/* Who, and what to do next */}
        <Tile className="col-span-2 flex flex-col sm:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <SpringProvider>
              <Spring className="pointer-events-none absolute top-0 left-0 z-10 overflow-visible text-muted-foreground" />
              <Tip label="Drag me">
                <SpringElement className="relative inline-block cursor-grab touch-none active:cursor-grabbing">
                  <span className="relative block">
                    {/* TODO: swap for a real portrait at /photos/me.jpg when you have one. */}
                    <span
                      aria-label={profile.name}
                      role="img"
                      className="grid size-14 place-items-center rounded-full bg-foreground text-[1.15rem] font-semibold tracking-[-0.04em] text-background shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--background)_18%,transparent),0_6px_16px_-8px_rgb(0_0_0/0.5)]"
                    >
                      PS
                    </span>
                    <PresenceDot presence={presence} />
                  </span>
                </SpringElement>
              </Tip>
            </SpringProvider>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Open to AI/ML roles
            </span>
          </div>

          <h1 className="mt-3 flex items-center gap-1 text-[2.1rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[2.5rem]">
            <SplittingText text={profile.name} type="chars" stagger={0.03} />
            <NameAudio />
          </h1>
          <RoleLine roles={profile.roles} />

          <p className="mt-3 max-w-[30rem] text-[15px] leading-relaxed text-pretty text-foreground/85">
            I build AI agents, and I can&apos;t sit on an idea for long. Most of mine get <Scribble>built, shipped and shown</Scribble> within the week.
          </p>

          <div className="mt-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5">
            <Fact icon={Rocket} tip="Every one has a write-up below">
              <span className="font-mono text-foreground tabular-nums"><CountingNumber number={shipped} inView inViewOnce /></span> shipped
            </Fact>
            <Fact icon={Timer} tip="Customer AI prototypes at Lyzr AI">
              <span className="font-mono text-foreground">2–4</span> day prototypes
            </Fact>
            <Fact icon={LeetCode} tip="LeetCode Knight, contest rating 1887">
              Knight <span className="font-mono text-foreground">1887</span>
            </Fact>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-4">
            <AnimateIcon animateOnHover asChild>
              <button
                type="button"
                onClick={openResume}
                className="relative inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform active:scale-[0.97]"
              >
                <FileText size={15} /> Resume
              </button>
            </AnimateIcon>
<span aria-hidden className="mx-1 h-5 w-px bg-border" />
            {/* Profiles: monochrome at rest, each takes its own brand colour on hover. */}
            <ul className="flex items-center gap-0.5" aria-label="Profiles">
              {socials.map((s) => {
                const hex = brandIcons[s.icon]?.hex;
                const ink = !hex || ["000000", "181717", "191919"].includes(hex);
                return (
                  <li key={s.name}>
                    <Tip label={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer me"
                        aria-label={`${s.name} (opens in a new tab)`}
                        style={{ "--brand": ink ? "var(--foreground)" : `#${hex}` } as React.CSSProperties}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-[color,background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-[var(--brand)] focus-visible:text-[var(--brand)]"
                      >
                        <BrandIcon name={s.icon} className="size-[17px]" />
                      </a>
                    </Tip>
                  </li>
                );
              })}
            </ul>
          </div>
        </Tile>

        {/* Photos: drag them, fan them. */}
        <Tile delay={0.05} className="col-span-2 grid place-items-center overflow-visible p-0 max-sm:h-60 sm:col-span-2">
          {/* Scaled down, inside a box of the scaled size so it centres and doesn't spill. */}
          {mobile ? (
            <div className="h-[184px] w-[236px]">
              <div className="origin-top-left scale-[0.8]">
                <PhotoStack />
              </div>
            </div>
          ) : (
            <div className="h-[250px] w-[200px]">
              <div className="origin-top-left" style={{ transform: "translate(-17px, 39px) scale(0.8)" }}>
                <PhotoStack cascade />
              </div>
            </div>
          )}
        </Tile>

        {/* What I build */}
        <Tile delay={0.1} label="What I build" className="col-span-2 sm:col-span-3">
          <AgentGraph weather={weather} />
        </Tile>

        {/* Where I've been */}
        <Tile delay={0.15} label="Path so far" className="col-span-2 flex flex-col sm:col-span-3">
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
