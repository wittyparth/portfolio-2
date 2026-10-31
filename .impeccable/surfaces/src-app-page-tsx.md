---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

## Scope

Home page (`/`) of Partha's portfolio. Experience mode: the site itself is the work sample. Depth pages: /projects, /work, /blog, /blog/[slug].

## Audience and job

Recruiters and engineers coming from LinkedIn or GitHub. They need to know who Partha is, what they build and how to reach them within seconds, then go deeper without the page feeling crowded.

## Direction contract

THESIS: The calm column, executed at reference-beating craft. One narrow, perfectly typeset column where every item is tactile and alive. It refuses both the effect-soup portfolio and the gray-card template; the creativity lives in details a visitor can touch.

OWN-WORLD: Animate UI's stock neutral theme: pure black (dark) and white (light), neutral grays, no accent colour. Colour comes only from real content (photos, project media, the green heatmap cells). Geist Sans for text, Geist Mono only for data (time, counts, code). Hairline borders and soft offset shadows; Lucide and Animate UI animated icons in one stroke.

STORY: The visitor meets Partha (photo, name, role, one sentence), sees live proof that they are active right now (time, weather, streak, current build), scans selected projects with media, then experience and writing, and leaves through a contact close that copies the email in one click.

FIRST VIEWPORT: 680px column. Floating pill nav at top with a gliding Highlight (Home, Projects, Work, Blog) plus ⌘K, sound and theme toggles. Intro: avatar with status dot, name at about 40px, "AI Engineer at Lyzr" with inline tech chips, and a one-line bio. To the right of the intro, a fanned stack of three polaroid photos breaking out of the column; they're draggable and spring back. Below that, a live status row: Bengaluru time · weather · GitHub streak (sliding number) · now building. The heatmap starts at the fold.

FORM: Standing exit (category canon, chosen by the user over two rolled hands), executed at full fidelity alongside abhi.at, kartiklabhshetwar.com, ramx.in and karaan.me. seed: 7f3f6da001e83854. Signature interaction: a site-wide click ring (Animate UI Click) paired with an optional soft click sound, plus the theme toggler's circular wipe. Motion grammar: springs on press and drag, a blur-in once on load, nothing hidden behind scroll triggers.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Constraints

All content is clearly marked placeholder in one data file except the confirmed facts: name, role, company, city and GitHub handle `wittyparth`.
