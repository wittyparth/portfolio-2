# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router), deployed on Vercel. Blog posts are MDX files in the repo. The visitor counter is stored in Upstash Redis (free tier). Animate UI (https://animate-ui.com/docs) is the only component library; the old portfolio and all other libraries are out of scope.

## Users

- **Primary:** hiring managers and technical recruiters evaluating Partha for AI and software engineering roles. They skim fast, want proof of shipped work, and leave within a minute if they can't find it.
- **Primary:** teams hiring for design-sensitive engineering roles, who judge taste and craft from the site itself as much as from its content.
- **Later, not now:** freelance clients. Don't design for them yet, but don't block adding them later.

## Product Purpose

A personal portfolio for Partha Saradhi Munakala, AI Engineer at Lyzr, based in Bengaluru, India. It gathers everything a technical evaluator needs in one place: intro, tech stack, projects with media, work experience, writing, and live proof of activity. The site itself should show engineering and design craft. Success means a visitor understands who Partha is and what they build within seconds, and can go deeper without the page ever feeling crowded.

## Positioning

The site is the work sample. Every interaction is crafted (click sound and click animation, hover and press micro-interactions, an animated theme switch), and the information density is high but calm. The ambition is to match or exceed developer portfolios like abhi.at, kartiklabhshetwar.com, ramx.in and karaan.me while looking clearly different from them, not like a template.

## Operating Context

- Visitors arrive from LinkedIn, GitHub, resumes and job applications, on both desktop and mobile.
- Live data: GitHub contributions and streak for `wittyparth`, a visitor counter, local time and weather for Bengaluru.
- Site-wide search through a Cmd+K command palette.
- Light and dark mode are both first-class.

## Capabilities and Constraints

Required content and features:
- Intro / about with role, location, and contact or social links
- Code streak and GitHub contribution heatmap (user `wittyparth`)
- Tech stack
- Projects with both images and videos, and a toggle between the two
- Work experience
- Blog (MDX) with high-quality code blocks
- Visitor counter
- Cmd+K search across the whole site
- Light/dark theme with an animated switch
- Click sound (respecting a mute preference) and click animation
- Weather and local time for Bengaluru, plus other creative live touches, which are to be proposed during design

Content is placeholder for now: one data file holds every project, role, post and media entry, clearly marked so Partha can swap in real content later.

## Brand Commitments

- Name: Partha Saradhi Munakala. Role: AI Engineer at Lyzr. Location: Bengaluru, India. GitHub: `wittyparth`.
- Minimal, refined and uncluttered, yet complete. The brief says "unique, not slop."
- Standing preference (user choice, 2026-10-30): the calm single-column layout used by the reference sites (abhi.at, kartiklabhshetwar.com, ramx.in, karaan.me), executed at a higher craft level, with creativity in the details rather than in an exotic visual world.
- Colours: Animate UI's stock neutral theme, with pure black in dark mode and white in light mode. Don't invent a custom palette.
- Use high-quality icons.

## Evidence on Hand

No real project descriptions, screenshots, videos, work history beyond the current role, blog posts, testimonials or metrics have been provided yet. Don't invent download counts, user numbers, stars, employers or achievements. Placeholders must read as placeholders.

## Product Principles

1. Everything a visitor needs is present, but only the current layer is visible; depth is one interaction away.
2. The craft is the proof. Interactions are deliberate and tactile, never gimmicky or noisy.
3. Show live evidence of real activity rather than claims.
4. Light and dark mode are equally polished.
5. Never fabricate. Real facts or labeled placeholders only.

## Accessibility & Inclusion

- Sound is opt-in or easy to mute, and never required to understand anything.
- Respect `prefers-reduced-motion` for click animations and transitions.
- The Cmd+K palette and all interactive elements are fully keyboard accessible.
