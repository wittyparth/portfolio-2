"use client";

import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import Link from "next/link";
import { AnimateIcon } from "@animate-ui/react/icons";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import type { Project } from "@/lib/projects";
import { TechIcons } from "./tech-icons";
import { BrandIcon } from "./brand-icon";
import { ProjectMedia } from "./project-media";
import { Tip } from "./tip";

const STATUS = {
  building: { label: "Building", dot: "bg-amber-500" },
  shipped: { label: "Shipped", dot: "bg-emerald-500" },
  archived: { label: "Archived", dot: "bg-neutral-400" },
};

const linkBtn =
  "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export function ProjectEntry({ project }: { project: Project }) {
  const status = STATUS[project.status];

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]">
      <div className="border-b border-border">
        <ProjectMedia project={project} />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2.5 font-medium tracking-tight">
              <Link href={`/projects/${project.slug}`} style={{ viewTransitionName: `project-title-${project.slug}` }} className="underline-offset-4 hover:underline">
                {project.name}
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <span className={`size-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">{project.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {project.repo && (
            <Tip label="Source on GitHub">
              <a href={project.repo} target="_blank" rel="noreferrer" aria-label={`${project.name} source on GitHub`} className={linkBtn}>
                <BrandIcon name="github" className="size-4" />
              </a>
            </Tip>
            )}
            {project.live && (
              <Tip label="Open live site">
                <a href={project.live} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`} className={linkBtn}>
                  <ExternalLink size={16} animateOnHover />
                </a>
              </Tip>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <TechIcons stack={project.stack} className="-ml-1.5" />
          <AnimateIcon animateOnHover asChild>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Case study <ArrowRight size={14} />
            </Link>
          </AnimateIcon>
        </div>
      </div>
    </article>
  );
}
