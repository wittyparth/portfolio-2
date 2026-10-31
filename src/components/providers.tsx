"use client";

import { ThemeProvider } from "next-themes";
import { AnimateUIProvider } from "@animate-ui/react/provider";
import { TooltipProvider } from "@animate-ui/react/primitives/tooltip";
import { Click } from "@animate-ui/react/primitives/effects/click";
import { SoundProvider } from "./sound";
import type { SearchIndex } from "./command-palette";
import { LazyOverlays } from "./lazy-overlays";
import { SiteContextMenu } from "./site-context-menu";

export function Providers({ children, index }: { children: React.ReactNode; index: SearchIndex }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AnimateUIProvider tempo={1}>
        <TooltipProvider openDelay={250}>
          <SoundProvider>
            <SiteContextMenu>{children}</SiteContextMenu>
            <Click variant="ring" color="var(--foreground)" size={28} duration={420} />
            <LazyOverlays index={index} />
          </SoundProvider>
        </TooltipProvider>
      </AnimateUIProvider>
    </ThemeProvider>
  );
}
