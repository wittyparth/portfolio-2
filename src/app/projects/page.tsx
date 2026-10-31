import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProjectsIndex } from "@/components/projects-index";
import { getProjects } from "@/lib/projects";
import { profile } from "@/lib/content";

export const metadata: Metadata = {
  title: `Projects · ${profile.name}`,
  description: "Things Partha has built: AI agents, developer tools and the odd weekend experiment.",
};

export default function ProjectsPage() {
  // Headings are only needed on the case study page; keep the client payload small.
  const projects = getProjects().map((p) => ({ ...p, headings: [] }));
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader
        title="Projects"
        intro="Things I've built, from agents and developer tools to weekend experiments. Each one has a write-up of what I tried and what I learned."
      />
      <ProjectsIndex projects={projects} />
    </main>
  );
}
