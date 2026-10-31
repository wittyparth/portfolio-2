import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { UsesList } from "@/components/uses-list";
import { Soundtrack } from "@/components/soundtrack";

export const metadata: Metadata = {
  title: "Uses · Partha Saradhi",
  description: "The hardware, software and small rituals Partha works with.",
};

export default function UsesPage() {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader title="Uses" intro="The gear, software and small rituals behind the work. Someone always asks, so here it is." />
      <div className="mt-12">
        <UsesList />
      </div>
      <section aria-labelledby="soundtrack" className="mt-16">
        <h2 id="soundtrack" className="mb-1 text-lg font-medium tracking-tight">Soundtrack</h2>
        <p className="mb-5 text-sm text-muted-foreground">What plays while the code compiles. Spin the record, or open a song on Spotify.</p>
        <Soundtrack />
      </section>
    </main>
  );
}
