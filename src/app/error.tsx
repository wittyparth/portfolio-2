"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-[44rem] flex-col justify-center px-6 py-24">
      <p className="font-mono text-sm text-muted-foreground tabular-nums">Error</p>
      <h1 className="mt-3 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
        Something broke on my end.
      </h1>
      <p className="mt-3 max-w-[34rem] text-[17px] leading-relaxed text-pretty text-muted-foreground">
        The page hit an unexpected problem. Trying again usually fixes it, and if it doesn&apos;t, the rest of the site is fine.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Back home
        </Link>
      </div>
      {error.digest && <p className="mt-10 font-mono text-xs text-muted-foreground/70">ref {error.digest}</p>}
    </main>
  );
}
