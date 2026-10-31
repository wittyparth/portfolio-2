import "server-only";
import { z } from "zod";
import { POST_TYPE_KEYS } from "./post-types";
import { headingsOf, loadCollection, minutesOf, schemas, type Heading } from "./mdx-content";

const PostSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1, "write a one or two sentence summary; it's used on the index, RSS and share cards"),
  date: schemas.isoDate,
  updated: schemas.isoDate.optional(),
  // What kind of post it is; the blog index filters by this first, then by tag.
  type: z.enum(POST_TYPE_KEYS).default("essay"),
  tags: z.array(z.string()).default([]),
  pinned: z.boolean().default(false),
  // Drafts render in development only.
  draft: z.boolean().default(false),
  placeholder: z.boolean().default(false),
});

export type Post = z.infer<typeof PostSchema> & { slug: string; minutes: number; headings: Heading[] };

export function getPosts(): Post[] {
  const showDrafts = process.env.NODE_ENV !== "production";
  return loadCollection("blog", PostSchema)
    .filter(({ data }) => showDrafts || !data.draft)
    .map(({ slug, data, body }) => ({ ...data, slug, minutes: minutesOf(body), headings: headingsOf(body) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);

/** Older and newer neighbours, for the links at the end of a post. */
export function neighbours(slug: string) {
  const posts = getPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  return { newer: i > 0 ? posts[i - 1] : undefined, older: i >= 0 ? posts[i + 1] : undefined };
}
