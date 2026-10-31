import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/mdx-components";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ArticleLayout } from "@/components/article-layout";
import { BackLink } from "@/components/page-header";
import { BrandIcon } from "@/components/brand-icon";
import { Cover, ProjectMedia } from "@/components/project-media";
import { TechIcon } from "@/components/tech-icons";
import { getProject, getProjects, type Project } from "@/lib/projects";
import { parseArchitecture } from "@/lib/architecture";
import { profile } from "@/lib/content";
import { cn } from "@/lib/utils";

const STATUS = {
  building: { label: "Building", dot: "bg-amber-500" },
  shipped: { label: "Shipped", dot: "bg-emerald-500" },
  archived: { label: "Archived", dot: "bg-neutral-400" },
};

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  "use cache";
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} · ${profile.name}`,
    description: p.tagline,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { title: p.name, description: p.tagline, url: `/projects/${p.slug}`, images: [{ url: `/og/projects/${p.slug}`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: p.name, description: p.tagline, images: [`/og/projects/${p.slug}`] },
  };
}

const pill =
  "inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-accent";

function NextProject({ project, label }: { project: Project; label: string }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex items-center gap-5 rounded-xl border border-border p-3 pr-5 transition-colors hover:bg-accent/50"
    >
      {project.cover && (
        <div className="w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted sm:w-36">
          <Cover
            src={project.cover}
            placeholder={project.placeholder}
            width={288}
            height={180}
            sizes="(min-width: 640px) 144px, 112px"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <p className="mt-0.5 text-lg font-semibold tracking-tight">{project.name}</p>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{project.tagline}</p>
      </div>
      <ArrowRight aria-hidden className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  "use cache";
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const { default: Body } = await import(`@content/projects/${slug}.mdx`);
  // Imported (not read from disk) so editing the JSON invalidates this cached page, like editing the MDX does.
  const architecture = project.architecture
    ? parseArchitecture(slug, (await import(`@content/projects/${slug}.architecture.json`)).default)
    : null;
  const all = getProjects();
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];
  const status = STATUS[project.status];

  const glance = [
    project.role && { label: "Role", value: project.role },
    { label: "Year", value: project.year },
    {
      label: "Status",
      value: (
        <span className="inline-flex items-center gap-2">
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      ),
    },
    project.duration && { label: "Timeline", value: project.duration },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  return (
    <ArticleLayout
      headings={project.headings}
      header={
        <header className="pt-16 sm:pt-20">
          <BackLink href="/projects" label="Projects" />
          <h1 className="mt-6 animate-in fade-in slide-in-from-bottom-2 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance duration-500 fill-mode-both motion-reduce:animate-none sm:text-[2.75rem]">
            {project.name}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-pretty text-muted-foreground">{project.tagline}</p>

          {(project.repo || project.live) && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" className={cn(pill, "border-foreground bg-foreground text-background hover:bg-foreground/85")}>
                  Visit live site <ArrowUpRight className="size-4" aria-hidden />
                </a>
              )}
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer" className={pill}>
                  <BrandIcon name="github" className="size-4" />
                  Source
                </a>
              )}
            </div>
          )}

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 text-sm sm:grid-cols-4">
            {glance.map((g) => (
              <div key={g.label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{g.label}</dt>
                <dd className="mt-1.5 text-pretty">{g.value}</dd>
              </div>
            ))}
            <div className="col-span-full">
              <dt className="text-xs text-muted-foreground">Built with</dt>
              <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {project.stack.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 text-sm">
                    <TechIcon name={s} className="-ml-1.5" />
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </header>
      }
    >
      {(project.gallery.length > 0 || project.video) && (
        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card sm:-mx-4">
          <ProjectMedia project={{ ...project, headings: [] }} />
        </div>
      )}

      <article className="mt-6 text-[16.5px] leading-[1.75] text-foreground/90">
        <Body
          components={{
            ...mdxComponents,
            Architecture: () => (architecture ? <ArchitectureDiagram data={architecture} /> : null),
          }}
        />
      </article>

      {next && next.slug !== slug && (
        <nav aria-label="Next project" className="mt-20">
          <NextProject project={next} label="Next project" />
        </nav>
      )}
    </ArticleLayout>
  );
}
