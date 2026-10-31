import type { Metadata } from "next";
import { profile, socials } from "./content";

export const X_URL = "https://x.com/itspartha_";

/** Every profile that is verifiably Partha's, for Person.sameAs. */
export const sameAs = Array.from(new Set([...socials.map((s) => s.href), X_URL]));

const DEFAULT_IMAGE = "/og/site/home";

/** Per-page metadata with canonical, Open Graph and Twitter. Page-level openGraph replaces the layout's, so each page restates it. */
export function pageMetadata({
  title, description, path, image = DEFAULT_IMAGE, type = "website", publishedTime, modifiedTime, tags, noindex,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noindex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      url: path,
      siteName: profile.name,
      locale: "en_IN",
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      ...(type === "article" ? { authors: [profile.fullName], publishedTime, modifiedTime, tags } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const abs = (path: string) => `${profile.site}${path}`;
export const personId = abs("/#person");
export const websiteId = abs("/#website");

export const personLd = {
  "@type": "Person",
  "@id": personId,
  name: profile.fullName,
  alternateName: profile.name,
  url: profile.site,
  jobTitle: profile.role,
  description: `${profile.fullName} is an AI Engineer at ${profile.company.name} in ${profile.city}, India, building AI agents: voice agents, tool calling, retrieval and evals.`,
  worksFor: { "@type": "Organization", name: profile.company.name, url: profile.company.url },
  alumniOf: { "@type": "CollegeOrUniversity", name: "IIT (ISM) Dhanbad" },
  address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "IN" },
  knowsAbout: ["AI agents", "Voice agents", "Tool calling", "Retrieval-augmented generation", "LLM evaluation", "Model Context Protocol"],
  sameAs,
};

/** Compact author reference for articles and projects; resolves to the Person on the home page by @id. */
export const authorLd = { "@type": "Person", "@id": personId, name: profile.fullName, url: profile.site };

export const websiteLd = {
  "@type": "WebSite",
  "@id": websiteId,
  url: profile.site,
  name: `${profile.name} · AI Engineer`,
  inLanguage: "en",
  publisher: { "@id": personId },
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export const siteUrl = abs;
