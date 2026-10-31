import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/page-header";
import { FilmRoll } from "@/components/film-roll";

export const metadata: Metadata = pageMetadata({
  title: "Off the clock · Partha Saradhi",
  description: "What Partha Saradhi gets up to when the laptop is closed.",
  path: "/life",
});

export default function LifePage() {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader
        title="Off the clock"
        intro="What I get up to when the laptop is closed: a roll of film I keep adding to. Travel, food, and the small things that made a day."
      />
      <div className="mt-10">
        <FilmRoll />
      </div>
    </main>
  );
}
