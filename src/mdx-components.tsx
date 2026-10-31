import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { Callout } from "@/components/mdx/callout";
import { Pre } from "@/components/mdx/code";
import { ZoomImage } from "@/components/mdx/zoom-image";

function heading(Tag: "h2" | "h3", className: string) {
  return function Heading({ id, children }: { id?: string; children?: ReactNode }) {
    return (
      <Tag id={id} className={`group relative scroll-mt-24 ${className}`}>
        {children}
        {id && (
          <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-normal text-muted-foreground/0 no-underline transition-colors group-hover:text-muted-foreground/70 hover:!text-foreground focus-visible:text-muted-foreground"
          >
            #
          </a>
        )}
      </Tag>
    );
  };
}

function Img({ src, alt }: ComponentProps<"img">) {
  return typeof src === "string" ? <ZoomImage src={src} alt={alt ?? ""} /> : null;
}

function A({ href = "", children }: ComponentProps<"a">) {
  const cls = "font-medium underline decoration-muted-foreground/40 underline-offset-[3px] transition-colors hover:decoration-foreground";
  if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
      <span aria-hidden className="ml-0.5 text-[0.8em] text-muted-foreground">↗</span>
    </a>
  );
}

// Exported so pages that import MDX dynamically can pass it in; that keeps these client components
// in the page's own module graph, where prerendering expects to find them.
export const mdxComponents: MDXComponents = {
  h2: heading("h2", "mt-14 mb-4 text-xl font-semibold tracking-tight"),
  h3: heading("h3", "mt-10 mb-3 text-base font-semibold tracking-tight"),
  // A lone image in a paragraph renders a <figure>, which can't live inside <p>.
  p: ({ children }) =>
    isValidElement(children) && children.type === Img ? children : <p className="my-5">{children}</p>,
  a: A,
  img: Img,
  pre: Pre,
  code: (props) => (
    <code className="rounded-md border border-border bg-muted/60 px-1.5 py-px font-mono text-[0.85em]" {...props} />
  ),
  ul: (props) => <ul className="my-5 list-disc space-y-2 pl-5 marker:text-muted-foreground/60" {...props} />,
  ol: (props) => <ol className="my-5 list-decimal space-y-2 pl-5 marker:text-muted-foreground marker:tabular-nums" {...props} />,
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-7 border-l-2 border-foreground/20 pl-5 text-muted-foreground italic" {...props} />
  ),
  hr: () => <hr className="my-12 border-border" />,
  table: (props) => (
    <div className="my-7 overflow-x-auto rounded-xl border border-border sm:-mx-4">
      <table className="w-full text-left text-sm" {...props} />
    </div>
  ),
  th: (props) => <th className="border-b border-border bg-muted/40 px-4 py-2.5 font-medium" {...props} />,
  td: (props) => <td className="border-b border-border px-4 py-2.5 align-top text-muted-foreground [tr:last-child_&]:border-0" {...props} />,
  Callout,
  Figure: ZoomImage,
  // Project pages replace this with the project's diagram; elsewhere it renders nothing.
  Architecture: () => null,
};

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
