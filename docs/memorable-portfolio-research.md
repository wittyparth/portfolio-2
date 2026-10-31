# What makes a personal portfolio memorable and good

Research for Partha Saradhi Munakala's portfolio (AI Engineer at Lyzr, Bengaluru). Compiled 2026-10-30.

**Sources.** Each site's raw HTML was fetched and grepped for feature markers, and its rendered text was read. Some behavior can't be seen in static HTML: hover states, motion, sound playback, and anything rendered only on the client. Those claims are tagged **(unverified)**.

**Animate UI column.** Component names come from `docs/animate-ui-catalog.md`. "custom" means Animate UI has nothing suitable and it must be built.

---

## 1. What the four reference sites actually ship

### abhi.at (Abhinav, Next.js)
- The top bar shows a live clock that links to a Google "time" search, plus a "Developer's corner" label and a link to `/os`.
- **`/os` is a full macOS-desktop easter egg.** It has a boot color and a choice of wallpapers (Tahoe, Sequoia, Sonoma, Big Sur…) with light and dark variants. Verified: the wallpaper list is in the page script. This is the site's signature move.
- The intro is a round photo, the name, a lowercase personal bio ("an engineer who designs with taste"), and two CTAs (Twitter DM, email). An `AudioLink` client component exists, purpose **(unverified)**; likely a name-pronunciation or audio clip.
- A **server-rendered GitHub contribution graph** (an SVG titled "GitHub Contributions") is captioned "2,329 activities in 2026" and has a Less/More legend.
- Projects: 4 cards, each with a thumbnail, a one-liner, a status tag ("Live"), tech icons, and live and GitHub links. A "View All" link goes to `/projects`.
- Blogs: 2 cards (banner, excerpt, tags, date), then "View All".
- Tech stack: 21 logos under the one-liner "the tech arsenal behind my builds".
- The close, "Start here", offers three paths (a call, a bigger build, coffee in Nagpur) and a Cal.com button. The footer has a quote, a sitemap and RSS.
- Blog posts use **Shiki** highlighting with a `data-language` label and copy buttons, plus share and previous/next links.
- The theme script reads the system preference, applies it before paint (no flash), and sets the background color inline.

### kartiklabhshetwar.com (Kartik, Astro)
- **Astro view transitions are on every element** (31 matches). A persistent **dock** (home, experience, projects, writing, subscribe) has a named transition per icon, so navigating morphs rather than reloads.
- **A command menu** (`CommandMenu` island) indexes every post and project with label, href, group and keywords.
- The theme toggle uses `aria-pressed` and a short `theme-transition` class to cross-fade colors.
- The bio is one sentence ("builds open-source tools for screenshots, voice typing, and everyday workflow friction"), then the role (MTS at Mem0), location, and a "Book a call" link.
- Writing is dated, with one-line summaries. Posts include a breadcrumb (Home / Writing / …), a TOC, share links, a newsletter prompt and a backlink.
- **The projects page uses muted, looping `<video>` previews** (104 matches for `muted`): motion instead of static screenshots.
- `/newsletter` captures email subscribers.

### ramx.in (Ramkrishna)
- **A `Ctrl K` hint with `<kbd>` chips** in the header (shadcn `kbd-group`).
- **A Spotify "now playing" row** with a skeleton loader.
- The intro reads "Engineer · Polymath" with eight social icons.
- Experience: 3 rows with a "Working" badge on the current role, then a "Show all work experiences" link to `/work`.
- Blog: 3 rows, then "Show all blogs".
- **Development and Personal cards** link to Gears, Setup, Terminal (dotfiles), Books and Movies: a personality layer kept one click deep.
- The footer is effectively a sitemap (11 links plus RSS).

### karaan.me (Karan Kendre)
- "India / IST" sits in the header. The tagline is "I build interfaces and put ideas into words."
- **"Along the way"** is an experience timeline whose rows expand on demand (marked ⌄).
- "Things I'm building" (5 tools) and **"Selected work"** open in an overlay with a "Close ×" control, so depth sits above the page instead of below it.
- Projects are split by tone: **"Earlier work"** entries are text-only and quiet (`quiet-project` class), while selected work gets images.
- **`/desk`** ("the keyboard, tools, and little things that live on my desk") and `/gallery` (code recreations of designs).
- The close reads "Let's build together" with the tagline "Thoughtful interfaces. Clear words. A little curiosity."

### What all four have in common
A narrow single column; a personal, lowercase or first-person voice; every list capped at 2–4 items with a "View all" link to a depth page; dates on everything; a clear contact close; RSS and a sitemap. **None of them is visually bold.** They win on calm density plus one or two signature touches. That gap is the opportunity: the same calm information architecture, in a world of its own.

## 2. Broader admired sites (all verified to resolve with HTTP 200)

| Site | Signature | Lesson |
|---|---|---|
| **rauno.me** | A manifesto set as short imperatives ("Make it fast… Make it soulful… Make it."); separate Craft and Field Notes sections; click-to-copy email showing "Copied"; yearly archived versions (2022.rauno.me) | A point of view stated in a few lines; archiving old versions shows growth over time |
| **paco.me** | Built cmdk and next-themes; a "Now" paragraph; projects and writing as plain lists | Credibility from tools other people use; a "Now" section keeps the site current |
| **emilkowal.ski** | A "Today" status line; projects as name plus one-liner (Sonner, Vaul); writing about taste and animation | Extreme restraint; the craft shows inside the linked work |
| **joshwcomeau.com** | Site-wide **sound effects with a "Disable sounds" toggle**; whimsical dark-mode toggle; a mascot that changes with the theme; interactive guides; a playful bot-check checkbox | Sound done tastefully plus an easy off switch; delight inside function (author of `use-sound`) |
| **brittanychiang.com** | Sticky left column (name, nav, socials) with scrolling content on the right; numbered experience with tag chips; "View Full Résumé" and "Project Archive" links; a TARDIS "click to time travel" easter egg | A two-pane layout keeps identity visible while content scrolls; the archive link absorbs the long tail. Cursor spotlight **(unverified, widely reported)** |
| **leerob.com** | Pure text; evergreen "Notes" separate from dated "Blog"; a Default/Long bio toggle | **A bio-length toggle** layers content: short by default, long on request |
| **manuarora.in** | **Reach stat cards** with real numbers; latest videos; a client logo grid; open-source credit | Concrete numbers beat adjectives, but only real ones |
| **delba.dev** | Blog code blocks with line numbers; inline video; reading progress | The reading experience is part of the portfolio |
| **jhey.dev / joshwcomeau** | Playful interactive demos as the content itself | Interactive pieces in posts are the most-shared thing on these sites |
| **shud.in, rauchg.com, pqina.nl** | Text-first, typographically disciplined | Typography alone can carry identity |

Design writing:
- **Rauno Freiberg, "Invisible Details of Interaction Design"** (Every.to, July 2023). It defines **"fidgetability"**: interactions people play with even when they serve no purpose. Read via secondary sources (designlobster, disenandoapps); full text **(unverified)**.
- **Josh Comeau, "Announcing use-sound"** (2020, updated 2025). Sound on the web should be tasteful, quiet, short and optional. The hook supports volume, pitch, playback rate, interrupt and sprites.
- General portfolio guides (Elementor, BrainStation, techinterview.org) agree on two points: template sites are forgotten, and a consistent font and color identity is what gets remembered.

---

## 3. The checklist

Priority: **M** = must, **S** = should, **D** = delight.

### A. First impression & identity
| # | Item | Why it works | Seen on | P | Animate UI |
|---|---|---|---|---|---|
| A1 | Name, role, company, city in the first line | A recruiter answers "who is this" in about 2 seconds | all four | M | — |
| A2 | One-sentence bio about what you build, not your titles | Specific beats generic ("tools for screenshots, voice typing…") | kartik, karaan | M | Typing Text / Splitting Text for the reveal |
| A3 | A real photo or portrait with character (not a stock avatar) | Faces are remembered; "scattered photos" is in the brief | abhi, karaan | M | Image Zoom, Tilt |
| A4 | A "Now / Today" status line ("building X at Lyzr") | Shows the site is current and alive | emil, paco, abhi | M | Rotating Text / Shimmering Text |
| A5 | A personal voice: a casual tone, one quirky fact | Sets you apart from a resume | abhi, brittany (Korok seeds) | S | — |
| A6 | A stated point of view or manifesto in a few lines | People remember a philosophy longer than a skill list | rauno | S | Splitting Text |
| A7 | Name pronunciation or a voice clip | Personal, rare, memorable (abhi's `AudioLink` **unverified**) | abhi? | D | custom (audio) + Button |
| A8 | One signature world and visual identity no one else has | The four references are interchangeable; this is the gap to win | (gap) | M | — |

### B. Proof & credibility (live signals)
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| B1 | GitHub contribution heatmap, server-rendered with a total ("N contributions in 2026") | Hard proof of consistency; a recruiter favorite | abhi | M | custom (SVG/grid) + Tooltip per cell |
| B2 | Code streak (current and longest) | One number that sticks | brief | M | Sliding Number / Counting Number |
| B3 | Visitor counter | Social proof and a sense the site is alive | brief; kartik has view counts | S | Sliding Number (Upstash) |
| B4 | Local time + weather (Bengaluru, IST) | Humanizes the person and helps with scheduling | abhi (clock), karaan (IST) | S | Sliding Number for the clock digits |
| B5 | Now playing / currently reading / currently training | A live personality signal | ramx (Spotify) | D | custom + Shimmering Text |
| B6 | Real metrics on projects (users, stars, downloads), **only if true** | Concrete beats adjectives | manu, brittany (100k installs) | S | GitHub Stars, Counting Number |
| B7 | Status tags on projects (Live / Building / Archived) | Calm, scannable state | abhi | S | Highlight / badge |
| B8 | Company logos for current and past roles | Instant recognition | manu, ramx | S | Avatar Group, Tooltip |
| B9 | A resume one click away (view plus download) | The #1 recruiter action | ramx, brittany | M | Button, Dialog |

### C. Information architecture & content layering (dense but calm)
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| C1 | Home is an index: 2–4 items per section, then "View all" | All four do this; it is how density stays calm | all | M | — |
| C2 | Depth pages: /projects, /work, /blog, /blog/[slug] | Detail without crowding home | all | M | Page Transition |
| C3 | Expandable rows in the experience timeline | Detail on demand | karaan | M | Accordion / Collapsible, Auto Height |
| C4 | Overlay or drawer project detail instead of navigating away | Keeps context | karaan | S | Dialog (desktop), Drawer (mobile) |
| C5 | Short/long toggle on the bio | The visitor chooses the depth | leerob | S | Tabs / Toggle Group + Auto Height |
| C6 | Quiet tier vs featured tier for projects | Hierarchy without deleting work | karaan ("earlier work") | S | — |
| C7 | A personality layer one click deep (uses/gear, desk, setup, books, AI reading list) | Memorable without cluttering home | ramx, karaan | D | Preview Link Card |
| C8 | Dates on everything | Shows recency; builds trust | all | M | — |
| C9 | Evergreen notes separate from dated posts | Shows expertise beyond chronology | leerob | D | — |

### D. Navigation & wayfinding
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| D1 | A Cmd/Ctrl+K command palette indexing pages, posts, projects and actions (copy email, toggle theme, toggle sound) | A power-user signal; the brief requires it | kartik, ramx, paco (cmdk author) | M | Dialog + custom list (catalog: no ready-made palette); Drawer on mobile |
| D2 | Visible `⌘K` kbd hint in the nav | Teaches the feature | ramx | M | Tooltip |
| D3 | Persistent dock or nav that morphs across pages (view transitions) | Navigation feels continuous, app-like | kartik | S | Page Transition, Highlight (glides between items), Magnetic |
| D4 | Keyboard shortcuts (G H home, G P projects, T theme, M mute) | Delight for engineers; fidgetable | (pattern from cmdk sites) | D | custom + Tooltip with kbd |
| D5 | Breadcrumbs and back links on depth pages | Orientation | kartik | S | Sliding Text on hover |
| D6 | Footer as a sitemap plus RSS | The long tail lives here | ramx, abhi | S | — |
| D7 | Skip-to-content link | Accessibility and craft signal | karaan, brittany | M | — |

### E. Project presentation
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| E1 | **Image ↔ video toggle per project** (brief requirement) | Motion shows the product working | kartik (muted loop video) | M | Tabs (gliding highlight) / Toggle Group |
| E2 | Muted, looping, autoplay-on-view video with a poster frame; pauses offscreen and under reduced motion | Motion is the fastest proof | kartik | M | custom video wrapper + Progress |
| E3 | Thumbnail, one-liner, tech icons, live and repo links, status | A scannable card | abhi, brittany | M | Preview Link Card on links, Tooltip on tech icons |
| E4 | Case-study depth: problem → approach → result → what I'd change | Engineers hire thinking, not screenshots | (gap in refs) | S | Scroll Progress, Code Block |
| E5 | For AI work: a live demo, eval numbers, an architecture diagram, model/stack chips | Specific to the AI-engineer positioning | (gap) | S | Code Block, custom diagram |
| E6 | Hover preview or tilt on cards | Tactility | (common) | D | Tilt, Shine, Magnetic |
| E7 | Image zoom on screenshots | Detail without leaving the page | delba (unverified) | S | Image Zoom |

### F. Writing / blog reading experience
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| F1 | Shiki code blocks with a language label, filename, copy button, line highlights, light and dark themes | Developers judge you by your code blocks | abhi (Shiki, copy), delba (line numbers) | M | Code Block + Copy Button |
| F2 | A sticky TOC on desktop with the active section highlighted | Long-form navigation | kartik | M | Highlight, Scroll Progress |
| F3 | Reading progress bar | Orientation | delba | S | Scroll Progress |
| F4 | Reading time, date, tags, view count | Metadata trust | kartik (views) | S | Sliding Number |
| F5 | Previous/next post and related posts | Retention | abhi | S | Sliding Text |
| F6 | Share links, copy-link with a "Copied" state | Distribution | abhi, kartik, rauno | S | Copy Button |
| F7 | RSS (+ optional newsletter) | Engineers still use RSS | abhi, ramx, kartik | S | — |
| F8 | Interactive embeds in posts (live demos, toggles) | The most-shared content on the best sites | joshwcomeau, jhey | D | any primitive |
| F9 | Typographic measure of 60–75ch, generous line height, readable inline code | Reading comfort | all good ones | M | — |
| F10 | Callouts, footnotes, image captions | Editorial quality | joshwcomeau | S | custom |

### G. Micro-interactions & motion
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| G1 | Click feedback animation (ring or ripple at the cursor) | Brief requirement; tactile | brief | M | Click (effects/click) |
| G2 | Hover: a highlight pill that glides between nav and list items | Fidgetability (Rauno) | (common on cmdk/Vercel-lineage sites) | M | Highlight |
| G3 | Link hover: text slides or rolls | Small, crafted, cheap | — | S | Sliding Text / Rolling Text |
| G4 | Press states: scale 0.97 on press, spring back | The single biggest "feels good" detail | rauno/emil writing | M | Button (press), Spring |
| G5 | Magnetic small controls (theme, sound, social icons) | Delight on the few controls that earn it | — | D | Magnetic |
| G6 | Staggered entrance on first load only; content visible by default | Choreographed once, not on every scroll | emil ("you don't need animations") | S | Fade / Blur / Slide |
| G7 | Number changes that slide, not jump | Live signals feel alive | — | M | Sliding Number |
| G8 | Copy-to-clipboard with a morphing check icon | Tiny reward | rauno | M | Copy Button |
| G9 | Page transitions that share elements | Continuity | kartik | S | Page Transition |
| G10 | Respect `prefers-reduced-motion` everywhere | Accessibility and craft | — | M | (MotionConfig) |
| G11 | No scattered, unmotivated scroll animations | Emil Kowalski's "you don't need animations" | emil | M | — |

### H. Sound & tactility
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| H1 | Soft click sounds: short (<80ms), quiet (~0.2–0.35 volume), slightly varied pitch to avoid repetition | Tasteful sound is rare and remembered | joshwcomeau (use-sound) | M (brief) | custom (Web Audio, preloaded sprite) |
| H2 | **Sound off by default**, a nav toggle, the choice persisted | Confirmed with the user; Josh offers "Disable sounds" | joshwcomeau | M | Switch / Toggle + animated volume icon |
| H3 | Distinct sounds per action (tap, toggle, open palette, copy) from one sprite | Gives the site a sonic identity | joshwcomeau | S | custom |
| H4 | Haptics on mobile (`navigator.vibrate`, a few ms) where supported | Tactility on phones | (pattern) | D | custom |

### I. Delight / easter eggs / personality
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| I1 | One deep easter egg reachable from the UI (abhi's `/os` macOS desktop) | The thing people tweet about | abhi | D | custom |
| I2 | Konami code or a hidden palette command (e.g. `>sudo hire partha`) | An engineer joke that rewards exploration | (pattern) | D | Dialog + Toast |
| I3 | A console.log greeting for devs who open DevTools | Very cheap, always noticed by engineers | (common) | D | — |
| I4 | A themed playful element (Josh's mascot changes with theme; Brittany's TARDIS) | Personality | joshwcomeau, brittany | D | — |
| I5 | Scattered personal artifacts (photos, stickers, notes) that react on hover or drag | Matches the brief: "scatter things around, not simple rectangles" | brief, karaan /desk | S | Tilt, Spring, Motion Grid |
| I6 | AI-specific delight: "ask my site" (an LLM answers questions about Partha from site content) | On-brand for an AI engineer; a real demo of skill | (gap: no reference does it) | D | Dialog + Typing Text |
| I7 | Guestbook | Community; repeat visits | (common on dev sites) | D | custom + Toast |

### J. Typography & layout craft
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| J1 | A distinctive type pairing (not Inter everywhere) | The biggest identity lever after color | (gap in refs) | M | — |
| J2 | Tabular numerals for clocks and counters | Prevents digits from jittering | — | M | — |
| J3 | One spacing rhythm; more space above headings than below | Calm | — | M | — |
| J4 | A layout beyond a column of equal cards: an asymmetric, scattered or two-pane composition | The brief explicitly rejects the "simple rectangle layout" | brittany (two-pane), brief | M | Motion Grid |
| J5 | `text-wrap: balance` on headings, `pretty` on paragraphs | Invisible polish | — | S | — |
| J6 | A consistent icon set at one stroke width (Animate UI ships 773 animated Lucide/Hugeicons) | High-quality icons, as the brief asks | — | M | Animate UI icons; brand icons custom (none in the set) |

### K. Light / dark theming
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| K1 | No flash on load (inline script before paint), system preference by default | Basic correctness | abhi, kartik | M | — |
| K2 | Animated switch (a circular wipe from the toggle via the View Transitions API) | The brief calls this "most important" | brief; kartik cross-fades | M | Theme Toggler / Theme Toggler Button |
| K3 | Both themes designed, not inverted: separate image and video variants and code themes | Equal polish | abhi (wallpaper dark variants), joshwcomeau (mascot variants) | M | Code Block themes |
| K4 | `color-scheme` meta and scrollbar and selection colors per theme | Invisible polish | kartik | S | — |

### L. Performance
| # | Item | Why | P |
|---|---|---|---|
| L1 | Static/ISR pages; heatmap and stats fetched server-side and cached (revalidate hourly) | No layout shift, fast first paint | M |
| L2 | Videos lazy-loaded with a poster, `preload="none"`, paused offscreen | Media-heavy portfolios get slow fast | M |
| L3 | `next/image` with AVIF/WebP and blur placeholders | Image quality without the weight | M |
| L4 | Sound sprite lazy-loaded on first opt-in only | Zero cost when off | M |
| L5 | Lighthouse 95+ and good CWV; Vercel Analytics/Speed Insights | Engineers check | S |

### M. Accessibility
| # | Item | P |
|---|---|---|
| M1 | Full keyboard reach, a visible focus ring styled to the world, focus trap in the palette and dialogs | M |
| M2 | `aria-pressed` on toggles (theme, sound, image/video) | M |
| M3 | Reduced motion respected; sound never carries meaning | M |
| M4 | AA contrast in both themes, including ghosted or decorative states | M |
| M5 | Alt text and captions for video; `prefers-reduced-data` honored for autoplay | S |

### N. Mobile
| # | Item | P | Animate UI |
|---|---|---|---|
| N1 | The palette becomes a bottom sheet; a search button replaces the ⌘K hint | M | Drawer |
| N2 | Scattered compositions become an ordered stack, still with personality (slight rotations) | M | — |
| N3 | Thumb-reachable nav (bottom dock) | S | Bottom Navigation |
| N4 | Heatmap scrolls horizontally, starting at the most recent week | M | — |

### O. SEO / share cards / metadata
| # | Item | Why | Seen | P |
|---|---|---|---|---|
| O1 | Dynamic OG images per page and post (`next/og`) in the site's own visual language | Links shared on LinkedIn and X are the first impression | all four ship og:image | M |
| O2 | Title templates, description, canonical, twitter:card | Basic | all | M |
| O3 | sitemap.xml, RSS, robots | Basic | abhi, ramx | M |
| O4 | JSON-LD Person schema (name, jobTitle, worksFor Lyzr, sameAs links) | Search knowledge panel | — | S |
| O5 | Favicon and app icon in the site's mark, themed | Small identity | — | S |
| O6 | `llms.txt` describing Partha for AI crawlers and agents | On-brand for an AI engineer; rare | — | D |

### P. The close / footer
| # | Item | Why | Seen | P | Animate UI |
|---|---|---|---|---|---|
| P1 | A real close: "Start here" with 2–3 clear paths (email, book a call, LinkedIn) | Every reference ends with one action | abhi, karaan | M | Button, Magnetic, Copy Button (email) |
| P2 | Click-to-copy email with a "Copied" state | Faster than mailto on desktop | rauno | M | Copy Button |
| P3 | A personal sign-off (quote or line) and last-updated / built-with notes | Personality; shows care | abhi, manu | S | — |
| P4 | Footer sitemap + RSS + socials + local time | Long tail | ramx | S | — |

---

## 4. Anti-patterns: what makes portfolios forgettable or "slop"

1. **Interchangeable template.** A centered dark column, gray cards, Inter, an emerald status dot, shadcn defaults. Recognizable, and therefore invisible. All four references sit close to this.
2. **Effect soup.** Meteors, globes, beams, sparkles, flip-words and shiny text stacked together. The old portfolio's component list was exactly this. Every effect needs a job.
3. **Fabricated or vague proof.** Made-up user counts, "passionate full-stack developer," skill bars with percentages. Recruiters discount all of it.
4. **Everything on home.** Ten projects, a full work history and every post on the index page. Cap each list and link to depth pages.
5. **Animation on every scroll.** Content hidden until it animates in, long staggers, scroll-jacking. It slows the scanner and breaks screenshots.
6. **Sound that surprises.** Autoplay audio, loud or long clicks, no visible mute.
7. **Dark mode as an afterthought.** Inverted colors, white-flash screenshots, unreadable code themes in one mode.
8. **Broken or empty live widgets.** A heatmap that fails to load, a counter stuck at 0, a "now playing" that is always empty. A dead live signal is worse than none.
9. **Project cards with no motion, no outcome, no link.** A screenshot plus a tech list says nothing about the thinking.
10. **Generic share cards.** A default Vercel OG image or none at all, so the first impression on LinkedIn is blank.
11. **Inconsistent icons.** Mixed icon sets and stroke weights, or emoji used as icons.
12. **Mobile as a squeezed desktop.** A Cmd+K hint on a phone, hover-only reveals, a horizontally overflowing grid.

---

## 5. Signature moves: what a visitor remembers an hour later

1. **abhi.at `/os`: a whole macOS desktop inside the portfolio.** "The site with a fake Mac you could boot." It's one deep easter egg, kept off the main path.
2. **Kartik's morphing dock plus video previews.** "Clicking around felt like an app, and the projects were moving." Continuity and motion, used as proof.
3. **Josh Comeau's sound plus whimsical theme toggle.** "That site made little sounds, and you could turn them off." Tactility nobody else has.
4. **Rauno's imperative manifesto ("Make it fast… Make it.").** "That site has a philosophy." A few lines, quoted for years.
5. **Leerob's Default/Long bio toggle.** "You choose how much to read." Layering as a visible control.
6. **Karaan's quiet tier ("earlier work" as text-only) plus the expandable timeline.** "Lots there, but it never felt crowded." This is the dense-but-calm brief, solved.
7. **Manu's real reach numbers.** "33K subscribers, 3M views." Concrete proof as an identity. (For Partha: only real numbers, such as the GitHub totals.)

### Open signature slots for Partha (nobody in the reference set does these)
- **"Ask my site":** an AI-engineer-native palette mode that answers questions about Partha from the site's own content, with sources. Turns the AI-engineer claim into a demo.
- **A living status board**: Bengaluru time, weather, streak, visitors and "currently training/building" combined into one composed object rather than scattered chips.
- **A scattered artifact layer** (photos, stickers, notes) that is fidgetable (drag, tilt, sound) and becomes an ordered stack on mobile.
- **`llms.txt` + JSON-LD**, a quiet credibility signal for an AI engineer.

---

## Sources
- Reference sites: https://abhi.at/ (+ /os, /blogs/crabgit-rust), https://kartiklabhshetwar.com/ (+ /projects, /blog/organic-growth-playbook), https://ramx.in/, https://www.karaan.me/
- Broader sites: https://rauno.me/, https://paco.me/, https://emilkowal.ski/, https://joshwcomeau.com/, https://brittanychiang.com/, https://leerob.com/, https://manuarora.in/, https://delba.dev/, https://jhey.dev/, https://shud.in/, https://rauchg.com/, https://pqina.nl/
- Josh Comeau, "Announcing use-sound": https://joshwcomeau.com/react/announcing-use-sound-react-hook/
- On Rauno's "Invisible Details" / fidgetability: https://designlobster.substack.com/p/150-fidgetability, https://disenandoapps.substack.com/p/27-detalles-invisibles
- General guides: https://elementor.com/blog/best-web-developer-portfolio-examples/, https://brainstation.io/career-guides/how-to-build-a-software-engineer-portfolio
