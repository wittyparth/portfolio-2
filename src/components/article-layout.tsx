import type { Heading } from "@/lib/mdx-content";
import { Reading, Toc } from "./reading";

/**
 * The reading column, plus a sticky table of contents in the right gutter on wide screens that starts level with the body.
 * The column stays the site's 44rem; the gutters only exist from xl up, so nothing shifts below that.
 */
export function ArticleLayout({
  header, headings, children,
}: {
  header: React.ReactNode;
  headings: Heading[];
  children: React.ReactNode;
}) {
  return (
    <Reading>
      <main className="mx-auto w-full max-w-[44rem] px-6 pb-32 xl:grid xl:max-w-[80rem] xl:grid-cols-[minmax(0,1fr)_44rem_minmax(0,1fr)] xl:gap-x-12">
        <div className="min-w-0 xl:col-start-2">{header}</div>
        <div className="min-w-0 xl:col-start-2 xl:row-start-2">{children}</div>
        <aside className="hidden xl:col-start-3 xl:row-start-2 xl:block">
          <div className="sticky top-28 mt-12 max-w-56">
            <Toc headings={headings} />
          </div>
        </aside>
      </main>
    </Reading>
  );
}
