import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { store } from "@/lib/store";
import { listEntries, issueToken } from "../api/guestbook/guestbook-server";
import { Guestbook } from "./guestbook";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Guestbook · Partha Saradhi",
  description: "Leave a note for Partha: say hi, share a thought, or share what you're building.",
};

async function GuestbookData() {
  await connection();
  let first: Awaited<ReturnType<typeof listEntries>>;
  let token: string;
  try {
    first = await listEntries(null);
    token = issueToken();
  } catch {
    // Storage or the signing secret is unavailable: say so calmly instead of failing the page.
    return <p className="mt-10 text-sm text-muted-foreground">The guestbook is taking a short break. Try again in a little while.</p>;
  }
  return (
    <Guestbook
      initialEntries={first.entries}
      initialCursor={first.nextCursor}
      initialTotal={first.total}
      token={token}
      ephemeral={!store.persistent && process.env.NODE_ENV === "development"}
    />
  );
}

function Skeleton() {
  return (
    <div aria-hidden className="mt-10 space-y-4">
      <div className="h-52 animate-pulse rounded-xl bg-muted/40" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

export default function GuestbookPage() {
  return (
    <main className="mx-auto w-full max-w-[44rem] px-6 pb-32">
      <PageHeader
        title="Guestbook"
        intro="Leave a note: say hi, share a thought, or tell me what you're building. Be kind; everything here is public."
      />
      <Suspense fallback={<Skeleton />}>
        <GuestbookData />
      </Suspense>
    </main>
  );
}
