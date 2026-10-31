/** The shell shown for a beat while a post or case study streams in: back link, title and a few lines. */
export function ArticleSkeleton({ back }: { back: string }) {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pt-16 pb-32 sm:pt-20" aria-busy="true" aria-label="Loading">
      <span className="text-sm text-muted-foreground">← {back}</span>
      <div className="mt-6 h-10 w-3/4 animate-pulse rounded-md bg-muted" />
      <div className="mt-5 h-4 w-full animate-pulse rounded bg-muted/70" />
      <div className="mt-2.5 h-4 w-2/3 animate-pulse rounded bg-muted/70" />
      <div className="mt-12 space-y-3 border-t border-border pt-8">
        {[92, 100, 84, 96, 60].map((w, i) => (
          <div key={i} className="h-3.5 animate-pulse rounded bg-muted/60" style={{ width: `${w}%` }} />
        ))}
      </div>
    </main>
  );
}
