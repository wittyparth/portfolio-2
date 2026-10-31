"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { House } from "@/components/animate-ui/icons/house";
import { Laptop } from "lucide-react";
import { Layers } from "@/components/animate-ui/icons/layers";
import { BookOpen } from "@/components/animate-ui/icons/book-open";
import { FileText } from "@/components/animate-ui/icons/file-text";
import { Terminal } from "@/components/animate-ui/icons/terminal";
import { Camera } from "@/components/animate-ui/icons/camera";
import { NotebookPen } from "@/components/animate-ui/icons/notebook-pen";
import { Mail } from "@/components/animate-ui/icons/mail";
import { Sun } from "@/components/animate-ui/icons/sun";
import { Volume2 } from "@/components/animate-ui/icons/volume-2";
import { Folder } from "@/components/animate-ui/icons/folder";
import { MessageCircleMore } from "@/components/animate-ui/icons/message-circle-more";
import { ExternalLink } from "@/components/animate-ui/icons/external-link";
import { profile, socials } from "@/lib/content";
import { useSound } from "./sound";
import { PALETTE_EVENT, openResume, settle, takePending } from "@/lib/overlays";
import { useIsMobile } from "@/hooks/use-is-mobile";

export type SearchIndex = {
  projects: { slug: string; name: string; tagline: string; stack: string[] }[];
  posts: { slug: string; title: string; minutes: number; tags: string[] }[];
};

export { openCommandPalette } from "@/lib/overlays";

function Palette({ close, index }: { close: () => void; index: SearchIndex }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const sound = useSound();

  const go = (href: string) => {
    close();
    if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  const item = "gap-3 py-2.5 [&_svg]:text-muted-foreground";
  // A soft fade at the bottom edge says "there's more below"; it goes away once the list is scrolled to the end.
  const [more, setMore] = React.useState(true);
  const check = (el: HTMLElement) => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);

  return (
    <>
      <CommandInput placeholder="Search projects, posts, pages…" />
      <div className="relative">
      <CommandList
        className="max-h-[min(26rem,60vh)]"
        ref={(el) => { if (el) requestAnimationFrame(() => check(el)); }}
        onScroll={(e) => check(e.currentTarget)}
      >
        <CommandEmpty>Nothing matches. Try a project name or “email”.</CommandEmpty>
        <CommandGroup heading="Go to">
          <CommandItem className={item} onSelect={() => go("/")}><House size={16} />Home</CommandItem>
          <CommandItem className={item} onSelect={() => go("/projects")}><Layers size={16} />Projects</CommandItem>
          <CommandItem className={item} value="writing blog articles" onSelect={() => go("/blog")}><BookOpen size={16} />Writing</CommandItem>
          <CommandItem className={item} value="posts x twitter linkedin social" onSelect={() => go("/posts")}><MessageCircleMore size={16} />Posts from X and LinkedIn</CommandItem>
          <CommandItem className={item} value="off the clock life photos film" onSelect={() => go("/life")}><Camera size={16} />Off the clock</CommandItem>
          <CommandItem className={item} value="typing test play leaderboard wpm" onSelect={() => go("/play")}><Terminal size={16} />Typing test</CommandItem>
          <CommandItem className={item} value="guestbook sign note" onSelect={() => go("/guestbook")}><NotebookPen size={16} />Guestbook</CommandItem>
          <CommandItem className={item} value="uses setup desk gear" onSelect={() => go("/uses")}><Laptop size={16} />Uses</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Projects">
          {index.projects.map((p) => (
            <CommandItem key={p.slug} className={item} value={`${p.name} ${p.stack.join(" ")} ${p.tagline}`} onSelect={() => go(`/projects/${p.slug}`)}>
              <Folder size={16} />
              {p.name}
              <CommandShortcut className="tracking-normal">{p.stack.slice(0, 2).join(" · ")}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Writing">
          {index.posts.map((p) => (
            <CommandItem key={p.slug} className={item} value={`${p.title} ${p.tags.join(" ")}`} onSelect={() => go(`/blog/${p.slug}`)}>
              <FileText size={16} />
              {p.title}
              <CommandShortcut className="tracking-normal">{p.minutes} min</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Elsewhere">
          {socials.map((s) => (
            <CommandItem key={s.name} className={item} onSelect={() => go(s.href)}>
              <ExternalLink size={16} />
              {s.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem className={item} value="resume cv pdf" onSelect={() => { close(); openResume(); }}>
            <FileText size={16} />
            View resume
          </CommandItem>
          <CommandItem className={item} onSelect={() => { navigator.clipboard.writeText(profile.email); close(); }}>
            <Mail size={16} />
            Copy email address
          </CommandItem>
          <CommandItem className={item} onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); close(); }}>
            <Sun size={16} />
            {resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          </CommandItem>
          <CommandItem className={item} onSelect={sound.toggle}>
            <Volume2 size={16} />
            {sound.enabled ? "Mute click sounds" : "Turn on click sounds"}
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-popover to-transparent transition-opacity duration-200 ${more ? "opacity-100" : "opacity-0"}`}
      />
      </div>
    </>
  );
}

export function CommandPalette({ index }: { index: SearchIndex }) {
  // Opens immediately if ⌘K or Search was used before this lazily loaded component mounted.
  const [open, setOpen] = React.useState(() => takePending(PALETTE_EVENT));
  const mobile = useIsMobile();
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      settle(PALETTE_EVENT);
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerTitle className="sr-only">Search the site</DrawerTitle>
          <Command className="bg-transparent px-2 pb-4">
            <Palette close={close} index={index} />
          </Command>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search the site" description="Jump to a project, post or action" className="sm:max-w-xl">
      <Command>
        <Palette close={close} index={index} />
      </Command>
    </CommandDialog>
  );
}
