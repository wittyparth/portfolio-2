import type { Metadata } from "next";
import { BugHunt } from "@/components/bug-hunt";

export const metadata: Metadata = {
  title: "404 · Partha Saradhi",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80dvh] w-full max-w-[44rem] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground tabular-nums">404</p>
      <h1 className="mt-3 text-[2rem] leading-tight font-semibold tracking-[-0.03em] text-balance">
        This page wandered off.
      </h1>
      <p className="mt-3 max-w-[28rem] text-pretty text-muted-foreground">
        The link might be old, or I renamed something. While you&apos;re here, squash a few bugs. I have plenty.
      </p>
      <div className="mt-10 flex w-full justify-center">
        <BugHunt />
      </div>
    </main>
  );
}
