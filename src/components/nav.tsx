"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Highlight, HighlightItem } from "@animate-ui/react/primitives/effects/highlight";
import { ThemeToggler } from "@animate-ui/react/primitives/effects/theme-toggler";
import { Magnetic } from "@animate-ui/react/primitives/effects/magnetic";
import { SlidingText } from "@animate-ui/react/primitives/texts/sliding";
import {
  BottomNavigation, BottomNavigationHighlight, BottomNavigationHighlightItem, BottomNavigationItem, BottomNavigationLabel,
} from "@animate-ui/react/primitives/bottom-navigation";
import {
  ThemeTogglerButton, ThemeTogglerButtonIcon, type Resolved, type ThemeSelection,
} from "@/components/animate-ui/buttons/theme-toggler";
import { Search } from "@/components/animate-ui/icons/search";
import { Sun } from "@/components/animate-ui/icons/sun";
import { Moon } from "@/components/animate-ui/icons/moon";
import { Volume2 } from "@/components/animate-ui/icons/volume-2";
import { VolumeX } from "@/components/animate-ui/icons/volume-x";
import { House } from "@/components/animate-ui/icons/house";
import { Terminal } from "@/components/animate-ui/icons/terminal";
import { NotebookPen } from "@/components/animate-ui/icons/notebook-pen";
import { Laptop } from "lucide-react";
import { Ellipsis } from "@/components/animate-ui/icons/ellipsis";
import { Camera } from "@/components/animate-ui/icons/camera";
import { ChevronDown } from "@/components/animate-ui/icons/chevron-down";
import { Folder } from "@/components/animate-ui/icons/folder";
import { BookOpen } from "@/components/animate-ui/icons/book-open";
import { MessageCircleMore } from "@/components/animate-ui/icons/message-circle-more";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSound } from "./sound";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { openCommandPalette, openResume } from "@/lib/overlays";
import { TypeSettings } from "./type-settings";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { Tip } from "./tip";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/posts", label: "Posts" },
  { href: "/life", label: "Life" },
];

const more = [
  { href: "/play", label: "Play", hint: "Typing test", icon: <Terminal size={16} /> },
  { href: "/guestbook", label: "Guestbook", hint: "Leave a note", icon: <NotebookPen size={16} /> },
  { href: "/uses", label: "Uses", hint: "My setup", icon: <Laptop size={16} /> },
];

// The top-level section a path belongs to: /blog/some-post → /blog.
const section = (path: string) => "/" + (path.split("/")[1] ?? "");

function MoreMenu({ active }: { active: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`group relative flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors outline-none hover:text-foreground data-[state=open]:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`}
        >
          More
          <ChevronDown size={14} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={10} className="w-56 rounded-xl p-1.5">
        {more.map((m) => (
          <DropdownMenuItem key={m.href} asChild className="cursor-pointer gap-3 rounded-lg px-2.5 py-2">
            <Link href={m.href}>
              <span className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground">{m.icon}</span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.hint}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const moreMobile = [
  { href: "/life", label: "Life", hint: "Off the clock", icon: <Camera size={16} /> },
  ...more,
];

/** Phones have no top links, so the pages that aren't in the bar live behind this. */
function MobileMore({ active }: { active: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="More pages"
          className={`flex h-14 w-12 items-center justify-center outline-none data-[state=open]:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`}
        >
          <Ellipsis size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={12} className="w-56 rounded-xl p-1.5">
        {moreMobile.map((m) => (
          <DropdownMenuItem key={m.href} asChild className="cursor-pointer gap-3 rounded-lg px-2.5 py-2">
            <Link href={m.href}>
              <span className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground">{m.icon}</span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.hint}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onSelect={() => setTimeout(openCommandPalette, 0)} className="cursor-pointer gap-3 rounded-lg px-2.5 py-2">
          <span className="grid size-8 place-items-center rounded-md border border-border text-muted-foreground"><Search size={16} /></span>
          <span className="text-sm">Search the site</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const iconBtn =
  "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

function ThemeButton() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <ThemeToggler
      theme={(theme ?? "system") as ThemeSelection}
      resolvedTheme={(resolvedTheme ?? "light") as Resolved}
      setTheme={setTheme}
      direction="ttb"
    >
      {({ toggleTheme }) => (
        <ThemeTogglerButton
          theme={(theme ?? "system") as ThemeSelection}
          resolvedTheme={(resolvedTheme ?? "light") as Resolved}
          setTheme={toggleTheme}
          modes={["light", "dark"]}
          variant="ghost"
          aria-label="Toggle theme"
          className={`${iconBtn} p-0`}
        >
          <ThemeTogglerButtonIcon light={<Sun size={16} />} dark={<Moon size={16} />} />
        </ThemeTogglerButton>
      )}
    </ThemeToggler>
  );
}

function SoundButton() {
  const sound = useSound();
  return (
    <button
      onClick={sound.toggle}
      aria-label={sound.enabled ? "Mute click sounds" : "Turn on click sounds"}
      aria-pressed={sound.enabled}
      className={iconBtn}
    >
      {sound.enabled ? <Volume2 size={16} animateOnHover /> : <VolumeX size={16} animateOnHover />}
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  const mobile = useIsMobile();
  return (
    <>
      <header className="sticky top-3 z-40 mx-auto w-full max-w-[44rem] px-4">
        <nav
          aria-label="Primary"
          className="flex items-center gap-1 rounded-full border border-border/70 bg-background/75 p-1 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur-xl"
        >
          <Link
            href="/"
            aria-label="PS, Partha Saradhi home"
            className="grid size-8 place-items-center rounded-full bg-foreground font-mono text-[11px] font-semibold tracking-tight text-background"
          >
            PS
          </Link>

          <div className="hidden sm:flex">
          <Highlight
            className="rounded-full bg-accent"
            hover
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            {links.map((l) => (
              <HighlightItem key={l.href} value={l.href} className="rounded-full">
                <Link
                  href={l.href}
                  aria-current={section(pathname) === l.href ? "page" : undefined}
                  className="relative block px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
                >
                  <SlidingText text={l.label} trigger="hover" direction="up" />
                </Link>
              </HighlightItem>
            ))}
          </Highlight>
          <MoreMenu active={more.some((m) => section(pathname) === m.href)} />
          </div>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              onClick={openCommandPalette}
              className="group mr-1 hidden h-8 items-center gap-2 rounded-full border border-border/70 pr-1.5 pl-3 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground sm:flex"
            >
              <Search size={14} animateOnHover />
              Search
              <kbd className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground/75">⌘K</kbd>
            </button>
            <Tip label="Resume" side="bottom">
              <button type="button" onClick={openResume} aria-label="View resume" className={iconBtn}>
                <FileText size={16} animateOnHover />
              </button>
            </Tip>
            <Tip label="Font and size" side="bottom">
              <span className="inline-flex"><TypeSettings className={iconBtn} /></span>
            </Tip>
            <Tip label="Click sounds" side="bottom">
              <Magnetic strength={0.35} range={70} asChild>
                <span className="inline-flex"><SoundButton /></span>
              </Magnetic>
            </Tip>
            <Tip label="Theme" side="bottom">
              <Magnetic strength={0.35} range={70} asChild>
                <span className="inline-flex"><ThemeButton /></span>
              </Magnetic>
            </Tip>
          </div>
        </nav>
      </header>

      {mobile && (
      <BottomNavigation
        value={section(pathname)}
        scrollBehavior="minimize"
        aria-label="Sections"
        className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit sm:hidden"
      >
        <BottomNavigationHighlight className="absolute inset-x-0 inset-y-1 rounded-full bg-muted">
          <ul className="flex rounded-full border border-border bg-background/85 px-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl">
            {[
              { value: "/", href: "/", label: "Home", icon: <House size={18} /> },
              { value: "/projects", href: "/projects", label: "Projects", icon: <Folder size={18} /> },
              { value: "/blog", href: "/blog", label: "Blog", icon: <BookOpen size={18} /> },
              { value: "/posts", href: "/posts", label: "Posts", icon: <MessageCircleMore size={18} /> },
            ].map((item) => (
              <li key={item.value}>
                <BottomNavigationHighlightItem value={item.value}>
                  <BottomNavigationItem
                    value={item.value}
                    href={item.href}
                    className="flex h-14 w-[4.25rem] flex-col items-center justify-center gap-1 text-muted-foreground data-[minimized]:size-11 data-[minimized]:gap-0 data-[selected]:text-foreground"
                  >
                    {item.icon}
                    <BottomNavigationLabel className="text-xs">{item.label}</BottomNavigationLabel>
                  </BottomNavigationItem>
                </BottomNavigationHighlightItem>
              </li>
            ))}
            <li>
              <MobileMore active={moreMobile.some((m) => section(pathname) === m.href)} />
            </li>
          </ul>
        </BottomNavigationHighlight>
      </BottomNavigation>
      )}
    </>
  );
}
