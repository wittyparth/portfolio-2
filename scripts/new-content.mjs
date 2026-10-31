// Scaffolds new content with every field filled in, so adding things takes minutes.
//   npm run new:project "Project Name"
//   npm run new:post "Post title"
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const [kind, ...words] = process.argv.slice(2);
const title = words.join(" ").trim();
if (!["project", "post"].includes(kind) || !title) {
  console.error('Usage: npm run new:project "Project Name"  |  npm run new:post "Post title"');
  process.exit(1);
}

const slug = title.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
const today = new Date().toISOString().slice(0, 10);
const q = (s) => JSON.stringify(s); // YAML-safe quoting, so colons in titles can't break the frontmatter

if (kind === "project") {
  const file = `content/projects/${slug}.mdx`;
  if (existsSync(file)) throw new Error(`${file} already exists`);
  mkdirSync(`public/projects/${slug}`, { recursive: true });
  writeFileSync(
    file,
    `---
name: ${q(title)}
tagline: "One sentence: what it does and for whom."
year: ${today.slice(0, 4)}
status: building # building | shipped | archived
stack: [Python, FastAPI] # names map to logos automatically; unknown ones show as text
repo: https://github.com/wittyparth/${slug}
# live: https://example.com
featured: false # true puts it on the home page and at the top of /projects
# order: 1     # sorts featured projects; lower comes first
# role: Solo
# duration: Since ${today.slice(0, 7)}
---

{/*
  Media goes in public/projects/${slug}/ and is picked up automatically:
    1-what-this-shows.png, 2-another-screen.png  → the gallery (the filename becomes the caption)
    cover.png                                     → the thumbnail on /projects (defaults to the first image)
    demo.mp4 + demo-poster.jpg                    → the video tab
*/}

## The problem

## The approach

## Architecture

## Results

## What I learned
`,
  );
  console.log(`Created ${file}\nDrop screenshots in public/projects/${slug}/`);
} else {
  const file = `content/blog/${slug}.mdx`;
  if (existsSync(file)) throw new Error(`${file} already exists`);
  writeFileSync(
    file,
    `---
title: ${q(title)}
summary: "One or two sentences. Shown on the index, in RSS and on the share card."
date: ${today}
type: essay # essay, tutorial, build-log or note
tags: []
draft: true # drafts only show in development; remove this line to publish
---

Start writing. Use ## for sections; they appear in the table of contents.

\`\`\`ts title="example.ts"
// Code blocks get highlighting, a filename and a copy button.
\`\`\`

<Callout type="tip">Callouts come in note, tip and warn.</Callout>
`,
  );
  console.log(`Created ${file} (as a draft)`);
}
