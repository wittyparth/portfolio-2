import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { z } from "zod";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export type Heading = { depth: 2 | 3; text: string; id: string };

/** Reads every .mdx file in content/<dir>, validating frontmatter. A bad file fails the build with its name and field. */
export function loadCollection<S extends z.ZodType>(dir: string, schema: S) {
  const folder = path.join(CONTENT_DIR, dir);
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((file) => {
      const raw = readFileSync(path.join(folder, file), "utf8");
      let parsedFile: matter.GrayMatterFile<string>;
      try {
        parsedFile = matter(raw);
      } catch (e) {
        const reason = (e as { reason?: string }).reason ?? String(e);
        throw new Error(`content/${dir}/${file}: frontmatter isn't valid YAML (${reason}). Wrap values containing ": " in quotes.`);
      }
      const { data, content } = parsedFile;
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((i) => `  • ${i.path.join(".") || "frontmatter"}: ${i.message}`)
          .join("\n");
        throw new Error(`content/${dir}/${file} has invalid frontmatter:\n${issues}`);
      }
      return { slug: file.replace(/\.mdx$/, ""), data: parsed.data as z.infer<S>, body: content };
    });
}

/** h2/h3 headings for the table of contents, with the same ids rehype-slug gives them. */
export function headingsOf(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = /^(##|###)\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_]/g, "");
    out.push({ depth: m[1].length as 2 | 3, text, id: slugger.slug(text) });
  }
  return out;
}

/** Reading time at ~230 words a minute, ignoring code fences' markup but not their words. */
export function minutesOf(body: string) {
  const words = body.replace(/```[^\n]*\n/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"));

export const schemas = { isoDate };
