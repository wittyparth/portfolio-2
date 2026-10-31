import "server-only";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { headingsOf, loadCollection, schemas, type Heading } from "./mdx-content";
import { getArchitecture, type Architecture } from "./architecture";

const media = z.object({ src: z.string(), alt: z.string() });

const ProjectSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  year: z.coerce.string().regex(/^\d{4}$/, "use a four-digit year"),
  status: z.enum(["building", "shipped", "archived"]),
  stack: z.array(z.string()).min(1, "list at least one technology"),
  repo: z.url().optional(),
  live: z.url().optional(),
  // Extra links, e.g. a separate landing-page repo: [{ label: "Landing page repo", href: "https://…" }]
  links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
  featured: z.boolean().default(false),
  // Lower comes first. Featured projects are ordered among themselves, everything else by year.
  order: z.number().default(99),
  role: z.string().optional(),
  duration: z.string().optional(),
  started: schemas.isoDate.optional(),
  // Optional overrides; by default media is discovered in public/projects/<slug>/.
  cover: z.string().optional(),
  gallery: z.array(media).optional(),
  video: z.object({ src: z.string(), poster: z.string() }).optional(),
  placeholder: z.boolean().default(false),
});

export type Project = Omit<z.infer<typeof ProjectSchema>, "gallery" | "cover"> & {
  slug: string;
  gallery: { src: string; alt: string }[];
  cover?: string;
  headings: Heading[];
  architecture: Architecture | null;
};

const IMAGE = /\.(png|jpe?g|webp|avif)$/i;

// public/projects/<slug>/2-reviewing-generated-tools.png → "Reviewing generated tools", second in the gallery.
function discoverMedia(slug: string, name: string) {
  const dir = path.join(process.cwd(), "public", "projects", slug);
  if (!existsSync(dir)) return { gallery: [], cover: undefined, video: undefined };
  const files = readdirSync(dir);
  const gallery = files
    .filter((f) => IMAGE.test(f) && /^\d/.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((f) => {
      const words = f.replace(IMAGE, "").replace(/^\d+-?/, "").replace(/[-_]+/g, " ").trim();
      return { src: `/projects/${slug}/${f}`, alt: words ? words[0].toUpperCase() + words.slice(1) : `${name} screenshot` };
    });
  const coverFile = files.find((f) => /^cover\./.test(f) && IMAGE.test(f));
  const posterFile = files.find((f) => /^demo-poster\./.test(f));
  const video = files.includes("demo.mp4") && posterFile
    ? { src: `/projects/${slug}/demo.mp4`, poster: `/projects/${slug}/${posterFile}` }
    : undefined;
  return { gallery, cover: coverFile ? `/projects/${slug}/${coverFile}` : undefined, video };
}

let cache: Project[] | undefined;

export function getProjects(): Project[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = loadCollection("projects", ProjectSchema)
    .map(({ slug, data, body }) => {
      const found = discoverMedia(slug, data.name);
      // No numbered screenshots yet? The cover stands in as a one-image gallery.
      const discovered = data.gallery ?? found.gallery;
      const coverSrc = data.cover ?? found.cover;
      const gallery = discovered.length ? discovered : coverSrc ? [{ src: coverSrc, alt: `${data.name} home page` }] : [];
      return {
        ...data,
        slug,
        gallery,
        video: data.video ?? found.video,
        cover: data.cover ?? found.cover ?? gallery[0]?.src,
        headings: headingsOf(body),
        architecture: getArchitecture(slug),
      };
    })
    .sort((a, b) =>
      Number(b.featured) - Number(a.featured) ||
      (a.featured ? a.order - b.order : 0) ||
      Number(b.year) - Number(a.year) ||
      a.order - b.order ||
      a.name.localeCompare(b.name),
    );
  return cache;
}

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);
export const featuredProjects = () => getProjects().filter((p) => p.featured);
