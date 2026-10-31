// Curated posts from X and LinkedIn, shown on /posts. Newest first is handled for you.
// To add one: copy an entry, paste the post's text and URL, and (optionally) drop images in public/posts/.
// TODO: every entry below is a placeholder. Replace with real posts and real URLs.

export type SocialPost = {
  platform: "x" | "linkedin";
  date: string; // YYYY-MM-DD
  text: string; // Blank lines become paragraphs.
  url: string;
  images?: { src: string; alt: string }[];
  metrics?: { likes?: number; reposts?: number; comments?: number };
  placeholder?: boolean;
};

export const socialPosts: SocialPost[] = [
  {
    platform: "x",
    date: "2026-10-24",
    text: "Hot take: most agent failures aren't model failures. They're API failures the model was never told about.\n\nA 400 with \"Something went wrong\" is a dead end for a person. For an agent it's an infinite retry loop.",
    url: "https://x.com/",
    metrics: { likes: 48, reposts: 6, comments: 9 },
    placeholder: true,
  },
  {
    platform: "linkedin",
    date: "2026-10-15",
    text: "I've been building MCPForge for a few months now: upload an OpenAPI spec, get an MCP server your agents can use.\n\nThe surprising part? Generating the server took a weekend. Deciding which of 300 endpoints an agent should actually see took the rest of the time.\n\nCurating tools is the real product. A few things I learned along the way:\n\n→ Fewer tools beat more tools, every time.\n→ Descriptions should say when to use a tool, not just what it does.\n→ Show people exactly what the agent will get before you deploy anything.\n\nIf you're wiring agents to internal APIs, I'd love to hear what's breaking for you.",
    url: "https://www.linkedin.com/",
    images: [{ src: "/projects/mcpforge/2-reviewing-generated-mcp-tools.png", alt: "MCPForge's tool review screen" }],
    metrics: { likes: 212, comments: 31, reposts: 14 },
    placeholder: true,
  },
  {
    platform: "x",
    date: "2026-10-03",
    text: "Shipped: nl2sql now shows you the SQL before it runs anything.\n\nAccuracy didn't change. Trust went way up.",
    url: "https://x.com/",
    images: [{ src: "/projects/nl2sql/2-reading-the-generated-sql.png", alt: "nl2sql showing generated SQL" }],
    metrics: { likes: 91, reposts: 12, comments: 7 },
    placeholder: true,
  },
  {
    platform: "x",
    date: "2026-09-21",
    text: "Four eval cases per tool catch most of what used to reach prod:\n\n1. a request the schema allows but the API rejects\n2. an error, checked for a sensible next step\n3. a list longer than one page\n4. a timeout on a write",
    url: "https://x.com/",
    metrics: { likes: 134, reposts: 22, comments: 11 },
    placeholder: true,
  },
  {
    platform: "linkedin",
    date: "2026-09-02",
    text: "New post on the blog: the AI engineer's starter kit.\n\nTerminal, Linux, git, Python environments, Docker and VS Code, everything to set up before ML and AI work.",
    url: "https://www.linkedin.com/",
    metrics: { likes: 87, comments: 12 },
    placeholder: true,
  },
  {
    platform: "x",
    date: "2026-08-30",
    text: "Bengaluru traffic has taught me more about queueing theory than any textbook.",
    url: "https://x.com/",
    metrics: { likes: 63, reposts: 4, comments: 5 },
    placeholder: true,
  },
];
