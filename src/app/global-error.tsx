"use client";

import { useEffect } from "react";

// Replaces the root layout, so it carries its own document and plain inline styles (no app CSS here).
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          background: "light-dark(#fff, #0a0a0a)",
          color: "light-dark(#0a0a0a, #fafafa)",
          colorScheme: "light dark",
        }}
      >
        <title>Something went wrong</title>
        <main style={{ maxWidth: "44rem", padding: "0 1.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.03em", margin: 0 }}>
            Something broke on my end.
          </h1>
          <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.6, opacity: 0.65 }}>
            The site hit an unexpected problem. Trying again usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 28,
              padding: "0.6rem 1.1rem",
              borderRadius: 8,
              border: "none",
              font: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              background: "light-dark(#0a0a0a, #fafafa)",
              color: "light-dark(#fafafa, #0a0a0a)",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
