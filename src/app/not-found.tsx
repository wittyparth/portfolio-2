import type { Metadata } from "next";
import Link from "next/link";
import { BugHunt } from "@/components/bug-hunt";

export const metadata: Metadata = {
  title: "Page not found · Partha Saradhi",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80dvh] w-full max-w-[44rem] flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="page-rise text-[2rem] leading-tight font-semibold tracking-[-0.03em] text-balance">This page wandered off.</h1>
      <p className="page-rise mt-3 max-w-[28rem] text-pretty text-muted-foreground [animation-delay:80ms]">
        The link might be old, or I renamed something. Home is a good place to start again.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Take me home
      </Link>
      <div className="mt-14 flex w-full flex-col items-center">
        <p className="mb-5 text-sm text-muted-foreground">Or squash a few bugs. I have plenty.</p>
        <BugHunt />
      </div>
    </main>
  );
}
