import Link from "next/link";
import { profile } from "@/lib/content";
import { featuredProjects, getProjects } from "@/lib/projects";
import { techKey } from "@/lib/tech";
import { getPosts } from "@/lib/blog";
import { getContributions, getWeather } from "@/lib/live";
import { Hero } from "@/components/hero";
import { Heatmap } from "@/components/heatmap";
import { HomeProjects } from "@/components/home-projects";
import { CareerLog } from "@/components/career-log";
import { WritingList } from "@/components/writing-list";
import { Stack } from "@/components/stack";
import { Contact, VisitorCount } from "@/components/contact";
import { AroundHere } from "@/components/around-here";
import { SectionHead } from "@/components/section-head";

function Section({
  id, title, action, children,
}: { id: string; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-16">
      <SectionHead title={title} action={action} />
      {children}
    </section>
  );
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

// Which projects used each technology, for the stack constellation's detail card.
function projectsByTech() {
  const map: Record<string, { slug: string; name: string }[]> = {};
  for (const p of getProjects()) for (const s of p.stack) (map[techKey(s)] ??= []).push({ slug: p.slug, name: p.name });
  return map;
}

export default async function Home() {
  const [contributions, weather] = await Promise.all([getContributions(), getWeather()]);

  return (
    <>
      <Hero weather={weather} streak={contributions && contributions.total > 0 ? contributions.streak : null} shipped={getProjects().length} />

      <main className="mx-auto w-full max-w-[44rem] px-6 pb-28 sm:pb-16">
        <Section id="work" title="Work and education">
          <CareerLog />
        </Section>

        <Section id="stack" title="Tools I reach for">
          <Stack usedIn={projectsByTech()} />
        </Section>

        <Section id="projects" title="Projects" action={<SectionLink href="/projects">All projects</SectionLink>}>
          <HomeProjects
            featured={featuredProjects().map((p) => ({ ...p, headings: [] }))}
            all={getProjects().map((p) => ({ ...p, headings: [], architecture: null }))}
          />
        </Section>

        <Section id="writing" title="Writing" action={<SectionLink href="/blog">All posts</SectionLink>}>
          <WritingList posts={getPosts().slice(0, 3)} />
        </Section>

        <Section id="around" title="Around the site">
          <AroundHere />
        </Section>

        <Section id="contact" title="Get in touch">
          <Contact />
        </Section>

        {contributions && contributions.total > 0 && contributions.days.length > 0 && (
          <Section id="activity" title="Activity">
            <Heatmap data={contributions} />
          </Section>
        )}

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
          <span>© {profile.fullName}</span>
          <span className="flex items-center gap-4">
            <VisitorCount />
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              Press <kbd className="rounded border border-border px-1 font-mono text-[11px]">⌘K</kbd> to search
            </span>
          </span>
        </footer>
      </main>
    </>
  );
}
