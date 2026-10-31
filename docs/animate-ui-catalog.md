# Animate UI catalog

Source: `https://animate-ui.com/llms.txt`, `llms-full.txt` and `https://animate-ui.com/r/registry.json`, snapshot from 2026-10-30. This is Animate UI **v2**. Its architecture differs from v1: most things now ship as an npm package rather than copied files. To refresh, re-download `llms-full.txt`. It is the canonical machine-readable source and includes every API table.

## Setup

```bash
npm install @animate-ui/react motion          # required (React 19)
npx shadcn@latest init                        # shadcn/ui project (Tailwind v4)
```

There are three distribution channels:

| Channel | What | How |
|---|---|---|
| npm `@animate-ui/react` | All primitives: animated Radix / Base UI / React Aria, plus Animate UI's own (effects, texts, buttons, tabs, cursor, code-block…) | `import … from '@animate-ui/react/primitives/<path>'` |
| shadcn registry `@animate-ui/*` | Styled files: 9 backgrounds, 4 buttons, page-transition, 773 animated icons | `npx shadcn@latest add @animate-ui/<name>` |
| CLI `@animate-ui/cli` | Rewrites installed shadcn/ui components to use the animated primitives | `npx @animate-ui/cli@latest animate all` (or `animate <name> [--dry-run]`, `--exclude <name>`) |

Add the registry to `components.json`:

```json
{ "registries": { "@animate-ui": "https://animate-ui.com/r/{name}.json" } }
```

Optional peer dependencies (install only what you use): `radix-ui` | `@base-ui/react` | `react-aria-components`, `shiki` (code-block), `@floating-ui/react` (Animate UI tooltip), `embla-carousel-react` (carousel), `input-otp`, `@shadcn/react` (questionnaire).

Optional provider:

```tsx
import { AnimateUIProvider } from '@animate-ui/react/provider';
<AnimateUIProvider tempo={1} checkAnimation="draw|pop">{children}</AnimateUIProvider>
```

`tempo` scales every duration and spring, and icon `speed` follows it.

Other entry points: `@animate-ui/react/icons` (`AnimateIcon`, `IconWrapper`), `@animate-ui/react/utils/motion` (motion tokens, reduced-motion helpers), `@animate-ui/react/utils/<hook>` (`use-is-in-view`, `use-page-visible`, `use-controlled-state`).

AI tooling: install the skill with `npx skills add imskyleen/animate-ui`, and set up the shadcn MCP with `npx shadcn@latest mcp init --client claude`.

Every primitive respects `prefers-reduced-motion` with no setup. Theme Toggler expects class-based dark mode (`next-themes` with `attribute="class"`).

Gaps: Animate UI has **no** command palette (Cmd+K), contribution heatmap, video player, or brand icons (GitHub, LinkedIn, X are not in the icon set). Build these from primitives or source them elsewhere.

---

## Animate UI's own primitives (npm)

Import base: `@animate-ui/react/primitives/`

| Name | Import path | What it does | Key props | Portfolio use |
|---|---|---|---|---|
| Auto Height | `effects/auto-height` (`AutoHeight`) | Animates height to fit content | `deps`, `transition` | Expanding project/experience details |
| Avatar Group | `avatar-group` | Overlapping avatars; hovered one rises, shared gliding tooltip | `invertOverlap`, `translate`, `side` | Tech-stack logo cluster, collaborators |
| Blur | `effects/blur` (`Blur`, `Blurs`) | Blur-in entrance (load or in view) | `initialBlur`, `delay`, `inView`, `holdDelay` | Section reveals |
| Bottom Navigation | `bottom-navigation` | Bottom bar with gliding highlight; shrinks or hides on scroll | `value`, `scrollBehavior`, `tapScale` | Mobile nav |
| Button | `buttons/button` (`Button`) | Presses down on tap | `hoverScale`, `tapScale` | Base for every button |
| Carousel | `carousel` | Embla drop-in; side slides shrink, stretching dots, sliding counter | embla API + `scale`, `visible` | Project screenshot gallery |
| Click | `effects/click` (`Click`) | Effect at the pointer on click: `ring`, `ripple`, `crosshair`, `burst`, `particles` | `variant`, `color`, `size`, `duration`, `scope`, `disabled` | **Site-wide click animation** (no `scope` means the whole page) |
| Code Block | `code-block` (`CodeBlock`, `useCodeWriting`) | Shiki-highlighted; types itself out with a cursor | `code`, `lang`, `themes{light,dark}`, `writing`, `duration`, `cadence:'natural'`, `inView` | **Blog/MDX code blocks**, hero snippet |
| Copy Button | `buttons/copy` (`CopyButton`, `CopyButtonIcon`) | Copies to clipboard; icon blurs into a check | `content`, `delay`, `onCopiedChange` | Copy email, copy code |
| Counting Number | `texts/counting-number` (`CountingNumber`) | Counts up to its value | `number`, `fromNumber`, `thousandSeparator`, `inView` | Stats |
| Cursor | `cursor` (`CursorProvider`, `CursorContainer`, `Cursor`, `CursorFollow`) | Custom cursor plus a trailing label; per area or `global` | `global`, `side`, `align` | Labeled cursor over the project grid ("View →") |
| Effect | `effects/effect` (`Effect`, `Effects`) | Combined fade, blur, slide and zoom entrance | `fade`, `blur`, `slide`, `zoom`, `inView`, `holdDelay` | Staggered section reveals |
| Fade | `effects/fade` (`Fade`, `Fades`) | Fade entrance | `initialOpacity`, `inView` | Reveals |
| Flip Button | registry `@animate-ui/buttons-flip` | Flips on hover to show a back face | `from`, `tapScale` | "Resume" / "Hire me" CTA |
| GitHub Stars | `github-stars` (`GithubStars`, `…Logo`, `…Number`, `…Icon`, `…Particles`) | Fetches star count, counts up, star fills and bursts | `username`, `repo`, `value`, `inView` | Repo stars on project cards |
| GitHub Stars Button | registry `@animate-ui/buttons-github-stars` | Styled button version of the above | `username`, `repo`, `variant`, `size` | Project repo link |
| Gradient Text | `texts/gradient` (`GradientText`) | Gradient sweeps across the text | `text`, `gradient`, `neon` | Accent word (use sparingly) |
| Highlight | `effects/highlight` (`Highlight`) | Background glides between items on hover, click or controlled value | `mode`, `hover`, `click`, `value`, `controlledItems`, `boundsOffset` | **Nav hover pill**, list hover, segmented controls |
| Highlight Text | `texts/highlight` (`HighlightText`) | Highlighter sweep behind text | `text`, `inView`, `delay` | Emphasis in the intro |
| Icon Button | `buttons/icon` | Bursts into particles on click | `count`, `radius`, `spread`, `tapScale` | Like / "+1" / guestbook |
| Image Zoom | `effects/image-zoom` (`Image`, `ImageZoom`) | Zooms where the pointer is | `zoomScale`, `zoomOnHover`, `zoomOnClick` | Project screenshots |
| Input OTP | `input-otp` | OTP input with pop-in characters | input-otp API | — |
| Liquid Button | registry `@animate-ui/buttons-liquid` | Fills with color from the bottom on hover | `fillHeight`, CSS vars `--liquid-button-color` | Primary CTA |
| Magnetic | `effects/magnetic` (`Magnetic`) | Pulled toward a nearby pointer | `strength`, `range`, `onlyOnHover`, `disableOnTouch` | Social icons, theme button |
| Morphing Text | `texts/morphing` (`MorphingText`) | Letters glide from one string to the next | `text` (array), `loop`, `holdDelay` | Rotating role line |
| Motion Grid | `motion-grid` | Dot grid playing frame-by-frame animations | `gridSize`, `frames`, `duration` | Loading/status indicator, "now playing" |
| Page Transition | registry `@animate-ui/components-page-transition` | View-transition page changes (Next.js) | effects: `fade`, `slide`, `push`, `zoom`, `iris`, `wipe`, `bands`, `stack`, `flow`, `chop`; `pageKey` | Route changes (/blog, /projects) |
| Particles | `effects/particles` (`Particles`, `ParticlesEffect`) | Particle burst around an element | `animate`, `count`, `radius`, `spread` | Celebrations (streak milestone) |
| Pinned List | `pinned-list` | Items glide between pinned and unpinned groups | `onPinnedChange` | — |
| Ripple Button | `buttons/ripple` | Ripple from the click point | `color`, `scale` | Buttons |
| Rolling Text | `texts/rolling` (`RollingText`) | Letters roll over like a flip board | `text`, `inView` | Section labels, live time |
| Rotating Text | `texts/rotating` | Words take turns in place | `text[]`, `duration`, `y` | Role or "currently" line |
| Scroll Fade | `effects/scroll-fade` (`ScrollFade`, `useScrollFade`) | Edges fade only where more content exists | `orientation`, `size`, `blur` | Horizontal tech-stack rail, overflow lists |
| Scroll Progress | `scroll-progress` | Bar follows scroll position | `global`, `direction`, `mode` | Blog reading progress |
| Scrolling Number | `texts/scrolling-number` | Number wheel spins and settles under a highlight | `number`, `step`, `itemsSize`, `sideItemsCount` | **Visitor counter** (signature option) |
| Shimmering Text | `texts/shimmering` (`ShimmeringText`) | A glint runs across the letters | `text`, `duration`, `wave` | "Available for work" / loading |
| Shine | `effects/shine` (`Shine`) | A light sweep across an element | `enableOnHover`, `loop`, `deg` | Card hover sheen |
| Slide | `effects/slide` (`Slide`, `Slides`) | Slide-in entrance | `direction`, `offset`, `inView` | Reveals |
| Sliding Number | `texts/sliding-number` (`SlidingNumber`) | Odometer digits | `number`, `padStart`, `thousandSeparator`, `inView` | **Visitor counter, streak days, clock digits, temperature** |
| Sliding Text | `texts/sliding` (`SlidingText`) | Text slides out while a copy slides in on hover or click | `text`, `direction`, `trigger` | **Nav and footer link hovers** |
| Splitting Text | `texts/splitting` (`SplittingText`) | Enters by char, word or line | `text`, `type`, `stagger`, `inView` | Name / headline entrance |
| Spring | `spring` | Draggable element on a spring coil | `coilCount`, `transition` | Playful avatar easter egg |
| Swapping Text | `texts/swapping` (`SwappingText`) | Swaps letter by letter | `text`, `stagger`, `direction` | Status line, weather label |
| Tabs | `tabs` (`Tabs`, `TabsList`, `TabsTrigger`, `TabsHighlight`, `TabsHighlightItem`, `TabsContents`, `TabsContent`) | Own tabs: gliding highlight, sliding panels, height follows | `value`, `defaultValue`, `onValueChange` | **Project image/video toggle**, home section switcher |
| Theme Toggler | `effects/theme-toggler` (`ThemeToggler`, render-prop `{effective, toggleTheme}`) | View-Transition clip-path wipe of the whole page (700ms) | `theme`, `resolvedTheme`, `setTheme`, `direction`, `onImmediateChange` | **Theme switch** (pair with next-themes) |
| Theme Toggler Button | registry `@animate-ui/buttons-theme-toggler` | Styled button; icon morphs to the next theme | `modes`, `variant`, `size`, `direction` | **Theme switch, ready-made** |
| Tilt | `effects/tilt` (`Tilt`, `TiltContent`) | 3D tilt toward the pointer | `maxTilt`, `perspective` | Project cards (sparingly) |
| Tooltip | `tooltip` | One shared popup glides between triggers | `openDelay`, `side`, `sideOffset` | **Tech-stack and social icon labels** |
| Typing Text | `texts/typing` | Types character by character with a cursor | `text`, `duration`, `loop` | Terminal-ish intro line |
| Zoom | `effects/zoom` (`Zoom`, `Zooms`) | Scale-up entrance | `initialScale`, `inView` | Reveals |

## Library primitives (npm, same API as the source library)

Import with `@animate-ui/react/primitives/{radix-ui|base-ui|react-aria}` (umbrella) or `…/<library>/<primitive>`. For shadcn components, use `npx @animate-ui/cli@latest animate <name>`.

| Primitive | Radix | Base UI | React Aria | Portfolio use |
|---|---|---|---|---|
| Accordion | ✓ | ✓ | ✓ | Experience details, FAQ |
| Alert Dialog | ✓ | ✓ | ✓ | — |
| Checkbox | ✓ | ✓ | ✓ | — |
| Collapsible | ✓ | ✓ | ✓ | "Show more" experience bullets |
| Combobox | — | ✓ | ✓ | Blog tag filter |
| Context Menu | ✓ | ✓ | ✓ | Custom right-click menu (easter egg) |
| Dialog | ✓ | ✓ | ✓ | **Cmd+K palette shell**, project detail modal |
| Drawer | ✓ (Vaul drop-in) | ✓ | — | Mobile menu / mobile Cmd+K |
| Dropdown Menu | ✓ | ✓ | ✓ | Theme or sound menu |
| Hover Card | ✓ | ✓ | ✓ | Company/link previews |
| Menubar | ✓ | ✓ | — | — |
| Navigation Menu | ✓ | ✓ | — | Top nav |
| Pagination | ✓ | ✓ | ✓ | Blog index |
| Popover | ✓ | ✓ | ✓ | Weather/now details |
| Preview Link Card | ✓ | ✓ | ✓ | **Link hover screenshots** for projects and blogs (own path only: `…/<lib>/preview-link-card`) |
| Progress | ✓ | ✓ | ✓ | Reading/skill progress |
| Questionnaire | ✓ | ✓ | ✓ | Contact form as steps |
| Radio Group | ✓ | ✓ | ✓ | — |
| Select | ✓ | ✓ | ✓ | — |
| Sheet | ✓ | ✓ | ✓ | Mobile nav |
| Sidebar | ✓ | ✓ | ✓ | Blog TOC / docs-style layout |
| Slider | ✓ | ✓ | ✓ | Volume for click sound |
| Switch | ✓ | ✓ | ✓ | **Sound on/off** |
| Tabs | ✓ | ✓ | ✓ | (prefer own Tabs) |
| Toast | — | ✓ | — | "Email copied" |
| Toggle / Toggle Group | ✓ | ✓ | ✓ | Image/video or grid/list toggle |
| Tooltip | ✓ | ✓ | ✓ | (prefer own Tooltip) |

## Backgrounds (registry `npx shadcn@latest add @animate-ui/backgrounds-<name>`)

| Name | What | Portfolio note |
|---|---|---|
| `bubble` | Interactive gradient bubbles | Loud |
| `fireworks` | Fireworks animation | Celebration only |
| `glyph` | Field of characters lit by drifting glows; the cursor wakes them, a click ripples shapes | Strong for a dev/AI identity hero |
| `gradient` | Subtle animated gradient | Safe, generic |
| `gravity-stars` | Stars pulled or pushed by the pointer | Space trope |
| `hexagon` | Hover-lit hexagon grid | — |
| `hole` | Tunnel of rings with rising particles | Dramatic |
| `stars` | Parallax starfield | Space trope |
| `topography` | Breathing contour lines; a hill rises under the cursor, a click sends a wave | Distinctive and calm; good for a "Bengaluru map" feel |

All of them pause off-screen and in hidden tabs, and hold still under reduced motion.

## Buttons and components (registry)

`buttons-flip`, `buttons-liquid`, `buttons-github-stars`, `buttons-theme-toggler`, `components-page-transition` (Next.js), `components-page-transition-react-router`, `components-page-transition-tanstack-router`.

## Animated icons (registry)

There are 392 Lucide and 381 Hugeicons icons, 773 in total. Install one with `npx shadcn@latest add @animate-ui/icons-lucide-<name>` (or `icons-hugeicons-<name>`). The file lands in `@/components/animate-ui/icons/<name>`, and the first install pulls in the `@animate-ui/react/icons` core.

```tsx
<Bell animateOnHover />
<AnimateIcon animateOnHover asChild><button><Bell/> Alerts</button></AnimateIcon>
```

Props: `size` (default 28), `animation` (`default` | `path` | `path-loop` | named), `animate`, `animateOnHover`, `animateOnTap`, `animateOnView`, `loop`, `loopDelay`, `speed`, `delay`, `persistOnAnimateEnd`, `completeOnStop`, `initial`.

Lucide icons relevant to this portfolio (verified in the registry): `sun`, `moon`, `moon-star`, `sun-moon`, `search`, `mail`, `mail-check`, `copy`, `check`, `external-link`, `arrow-right`, `arrow-up`, `link`, `send`, `map-pin`, `clock`, `cloud-sun`, `cloud-rain`, `cloud-moon`, `thermometer`, `sunrise`, `sunset`, `volume-2`, `volume-x`, `volume-off`, `play`, `pause`, `image`, `layers`, `terminal`, `message-square-code`, `book-open`, `book-text`, `notebook-pen`, `file-text`, `download`, `calendar-days`, `flame`, `zap`, `rocket`, `bot`, `sparkles`, `star`, `heart`, `eye`, `users`, `user`, `music`, `menu`, `x`, `chevron-*`, `settings`, `house`.

The set has **no** `github`, `linkedin`, `twitter`/`x` or `command` icons. Use static brand SVGs (for example simple-icons) for those.

## Unverified

- Whether shadcn's `code-block` component is installable as `npx shadcn@latest add code-block` in the current shadcn version. The Animate UI docs link to `ui.shadcn.com/docs/components/base/code-block`, so it appears to exist. Fallback: use the `CodeBlock` primitive directly.
- Exact `ThemeToggler` `direction` values. The docs say the default is "left to right"; check the API table in `llms-full.txt`.
