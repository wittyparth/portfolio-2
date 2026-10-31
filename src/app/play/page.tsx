import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TypingGame } from "./typing-game";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Typing test · Partha Saradhi",
  description: "A small typing speed test with a public leaderboard. 15, 30 or 60 seconds, plain words or code.",
  path: "/play",
});

export default function PlayPage() {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <div className="mb-10">
        <PageHeader
          title="How fast do you type?"
          intro="Pick a length, start typing, and see where you land on the board. Mistakes count, backspace is allowed, pasting isn't."
        />
      </div>
      <TypingGame />
    </main>
  );
}
