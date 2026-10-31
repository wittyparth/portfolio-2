"use client";

import { useTheme } from "next-themes";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { profile } from "@/lib/content";
import { openCommandPalette } from "@/lib/overlays";
import { useSound } from "./sound";

export function SiteContextMenu({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const sound = useSound();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className="select-auto">
        <div className="min-h-dvh">{children}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onSelect={openCommandPalette}>
          Search the site
          <ContextMenuShortcut>⌘K</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => navigator.clipboard.writeText(profile.email)}>Copy email</ContextMenuItem>
        <ContextMenuItem onSelect={() => navigator.clipboard.writeText(window.location.href)}>Copy page link</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
        </ContextMenuItem>
        <ContextMenuItem onSelect={sound.toggle}>{sound.enabled ? "Mute sounds" : "Turn on sounds"}</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem asChild>
          <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer">View my GitHub</a>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
