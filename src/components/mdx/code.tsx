import { isValidElement, type ReactElement, type ReactNode } from "react";
import { codeToHtml, type ShikiTransformer } from "shiki";
import { CopyCode } from "./copy-code";

const LABELS: Record<string, string> = {
  ts: "TypeScript", tsx: "TSX", js: "JavaScript", jsx: "JSX", py: "Python", python: "Python",
  sql: "SQL", json: "JSON", yaml: "YAML", yml: "YAML", bash: "Shell", sh: "Shell", zsh: "Shell",
  css: "CSS", html: "HTML", md: "Markdown", mdx: "MDX", go: "Go", rust: "Rust", diff: "Diff", text: "Text",
};

// Diff lines get a class so the gutter marks and hunk headers can use darker shades on the light theme (the stock ones miss AA).
const diffLines: ShikiTransformer = {
  line(node) {
    const first = node.children[0];
    const text = first && first.type === "element" ? first.children.map((c) => (c.type === "text" ? c.value : "")).join("") : "";
    if (text.startsWith("@@")) this.addClassToHast(node, "diff-hunk");
    else if (text.startsWith("+")) this.addClassToHast(node, "diff-add");
    else if (text.startsWith("-")) this.addClassToHast(node, "diff-del");
    else if (text.startsWith("~")) this.addClassToHast(node, "diff-mod");
  },
};

// Cached: shiki reads the clock while loading grammars, which prerendering won't allow uncached.
async function highlight(code: string, lang: string) {
  "use cache";
  const themes = { light: "github-light", dark: "github-dark" };
  try {
    return await codeToHtml(code, { lang, themes, defaultColor: false, transformers: [diffLines] });
  } catch {
    return await codeToHtml(code, { lang: "text", themes, defaultColor: false });
  }
}

type CodeChild = ReactElement<{ className?: string; children?: ReactNode }>;

// Fenced code arrives as <pre title="…"><code class="language-x">…</code></pre>; `title` comes from ```lang title="…".
export async function Pre({ children, title }: { children?: ReactNode; title?: string }) {
  const code = isValidElement(children) ? (children as CodeChild) : null;
  const raw = typeof code?.props.children === "string" ? code.props.children.replace(/\n$/, "") : "";
  const lang = /language-([\w-]+)/.exec(code?.props.className ?? "")?.[1] ?? "text";

  const html = await highlight(raw, lang);

  return (
    <figure className="group/code not-prose my-7 overflow-hidden rounded-xl border border-border bg-muted/40 sm:-mx-4">
      <figcaption className="flex h-10 items-center gap-3 border-b border-border pr-1.5 pl-4 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1 truncate font-mono">{title ?? LABELS[lang] ?? lang}</span>
        {title && <span className="hidden font-mono opacity-70 sm:inline">{LABELS[lang] ?? lang}</span>}
        <CopyCode code={raw} />
      </figcaption>
      <div
        className="overflow-x-auto py-4 font-mono text-[13px] leading-6 [&_pre]:w-max [&_pre]:min-w-full [&_pre]:!bg-transparent [&_pre]:px-4 [&_.diff-add_span]:!text-emerald-700 dark:[&_.diff-add_span]:!text-emerald-400 [&_.diff-del_span]:!text-red-700 dark:[&_.diff-del_span]:!text-red-400 [&_.diff-hunk_span]:!text-sky-700 dark:[&_.diff-hunk_span]:!text-sky-400 [&_.diff-mod_span]:!text-amber-700 dark:[&_.diff-mod_span]:!text-amber-400"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
