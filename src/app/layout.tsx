import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { Nav } from "@/components/nav";
import { profile } from "@/lib/content";
import { PageTransition } from "@/components/animate-ui/components/page-transition";
import { getProjects } from "@/lib/projects";
import { getPosts } from "@/lib/blog";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Alternatives for the reading-settings menu; only downloaded when chosen.
const serif = Source_Serif_4({ variable: "--font-serif", subsets: ["latin"], preload: false });
const readable = Atkinson_Hyperlegible({ variable: "--font-readable", subsets: ["latin"], weight: ["400", "700"], preload: false });

// Applies saved reading settings before first paint.
const typeScript = `try{var d=document.documentElement,f=localStorage.getItem("type-font"),s=localStorage.getItem("type-size");if(f)d.dataset.font=f;if(s)d.dataset.size=s}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title: "Partha Saradhi — AI Engineer",
  description: "Partha Saradhi Munakala, AI Engineer at Lyzr in Bengaluru. Projects, writing and work.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // A small, serializable index for ⌘K: every project and post, nothing heavy.
  const index = {
    projects: getProjects().map(({ slug, name, tagline, stack }) => ({ slug, name, tagline, stack })),
    posts: getPosts().map(({ slug, title, minutes, tags }) => ({ slug, title, minutes, tags })),
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${serif.variable} ${readable.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: typeScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip bg-background font-sans text-foreground">
        <Providers index={index}>
          <Nav />
          <PageTransition effect="fade">{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
