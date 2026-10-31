// Every value marked `placeholder: true` (or commented TODO) is stand-in content to replace.

export const profile = {
  name: "Partha Saradhi",
  fullName: "Partha Saradhi Munakala",
  role: "AI Engineer",
  company: { name: "Lyzr AI", url: "https://www.lyzr.ai" },
  city: "Bengaluru",
  timezone: "Asia/Kolkata",
  coords: { lat: 12.9716, lon: 77.5946 },
  github: "wittyparth",
  // TODO: set NEXT_PUBLIC_SITE_URL in Vercel to the real domain; used for RSS, share links and share images.
  site: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://partha.example.com").replace(/\/$/, ""),
  email: "parthasaradhimunakala@gmail.com",
  bio: {
    lead: "I build AI agents and the backends that make them",
    highlight: "dependable",
    tail: ": voice agents, tool calling, retrieval and evals. At Lyzr AI I turn customer problems into working AI prototypes in days, mostly in Python and TypeScript.",
  },
  roles: ["AI Engineer at Lyzr AI", "building voice agents", "shipping agentic backends"],
  pronunciation: "PAR-thuh suh-RAA-dhee",
  // TODO: drop a 2–3s recording at public/audio/name.mp3 and set this to "/audio/name.mp3".
  nameAudio: undefined as string | undefined,
  now: "Building voice agents and outbound-calling workflows at Lyzr AI",
  // TODO: placeholders, keep these honest and current.
  currently: {
    learning: "How to evaluate agents properly, not just vibe-check them",
    reading: "Designing Data-Intensive Applications (again)",
  },
};

export const socials = [
  { name: "GitHub", href: "https://github.com/wittyparth", icon: "github" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/partha-saradhi-munakala/", icon: "linkedin" },
  { name: "LeetCode", href: "https://leetcode.com/u/Partha_saradhi99/", icon: "leetcode" },
  // TODO: add your X profile URL, or delete this line if you don't want X linked.
  { name: "X", href: "https://x.com/", icon: "x", placeholder: true },
] as const;

export const photos = [
  { src: "/photos/desk.jpg", alt: "Laptop and notebook on a wooden desk", caption: "the desk", placeholder: true },
  { src: "/photos/laptop.jpg", alt: "Hands holding a phone over a laptop", caption: "shipping", placeholder: true },
  { src: "/photos/cafe.jpg", alt: "Two coffee cups on a café table", caption: "fuel", placeholder: true },
];

// Projects live in content/projects/*.mdx and posts in content/blog/*.mdx (see src/lib/projects.ts and src/lib/blog.ts).

// Career as a git log: newest first. Each role is a commit; `diff` lines show in the expanded view.
// A `{n}` in a diff line is replaced by an animated count of `n`, e.g. "Cut requests by {98.7}%".
export type Commit = {
  role: string;
  company: string;
  url?: string;
  logo?: string; // square image in public/logos/, shown as the commit node
  branch: string; // shown like a git ref, e.g. "lyzr"
  start: string; // YYYY-MM
  end?: string; // omit for the current role
  location: string;
  message: string; // the one-line commit message
  tag?: string; // e.g. "promoted"
  diff: { kind: "+" | "-" | "~"; text: string; n?: number }[];
  stack: string[];
  projects?: string[]; // project slugs
};

export const career: Commit[] = [
  {
    role: "Full Stack Engineer",
    company: "Lyzr AI",
    url: "https://www.lyzr.ai",
    logo: "/logos/lyzr-mark.png",
    branch: "lyzr",
    start: "2026-07",
    location: "Bengaluru",
    message: "Build customer AI prototypes and voice agents end to end, from requirements to deployment",
    diff: [
      { kind: "+", text: "Delivered {7}+ customer AI prototypes across HR, healthcare, sales outreach, marketing and procurement, each in 2–4 days" },
      { kind: "+", text: "Built an agentic outbound-calling system for real phone calls: {80}% of connected calls reached the target outcome across 200+ contacts" },
      { kind: "+", text: "Developed a reusable Voice Agent block adopted across {6}+ customer projects, with knowledge bases, tool integrations and structured outcome extraction" },
      { kind: "+", text: "Evaluated and tuned voice agents against {50}+ test cases for instruction following, tool use and knowledge grounding" },
      { kind: "-", text: "Removed 5-second polling in favour of Server-Sent Events, cutting request volume by {98.7}%" },
      { kind: "~", text: "Async backend workflows across 4 areas: APIs and data models, queue/retry scheduling, webhooks and SSE event delivery" },
    ],
    stack: ["Python", "FastAPI", "Next.js", "TypeScript", "AWS"],
  },
  {
    role: "Software Engineer (Backend)",
    company: "Pursuit Software",
    logo: "/logos/pursuit.png",
    branch: "pursuit",
    start: "2025-06",
    end: "2026-06",
    location: "Kolkata",
    message: "Serverless backends on AWS for production apps, including a real estate CRM",
    diff: [
      { kind: "+", text: "Architected serverless backends on AWS powering {4} production applications at 10,000+ API requests a day and 99.9% uptime" },
      { kind: "+", text: "Built an end-to-end real estate CRM for PS Group: schema, {20}+ REST endpoints and an analytics dashboard for leads, bookings, site visits and revenue" },
      { kind: "+", text: "Designed event-driven Lambda functions with RabbitMQ, Cognito and S3, cutting manual processing time by {70}%" },
      { kind: "~", text: "Wrote CloudFormation templates for API Gateway, Lambda layers and IAM, with CloudWatch alarms and structured logging" },
    ],
    stack: ["AWS", "RabbitMQ", "CloudFormation", "React", "Node.js"],
  },
  {
    role: "B.Tech, Electrical Engineering",
    company: "IIT (ISM) Dhanbad",
    url: "https://www.iitism.ac.in",
    logo: "/logos/iit-ism.svg",
    branch: "iit-ism",
    start: "2021-12",
    end: "2025-05",
    location: "Dhanbad",
    message: "Studied electrical engineering; spent the evenings on competitive programming and side projects",
    tag: "graduated",
    diff: [
      { kind: "+", text: "LeetCode Knight: {1887} rating, top 4.7% globally, with global ranks of 743 and 822 in contests of 35,000+" },
      { kind: "+", text: "Solved {800}+ problems across LeetCode, Codeforces and CodeChef" },
      { kind: "+", text: "Finalist at HackFest 2024 (IIT Dhanbad), shipping a working product against {100}+ teams" },
    ],
    stack: ["C++", "Python", "JavaScript"],
  },
];

// The root commit at the bottom of the log.
export const careerRoot = { year: "2021", message: "init: wrote my first line of C++" };

// TODO: placeholder photos (picsum.photos), captions and dates. Replace with your own shots.
export type LifeShot = { src: string; alt: string; caption: string; date: string; tag: "Travel" | "Food" | "Little things" };
export const life: LifeShot[] = [
  { src: "/life/1015.jpg", alt: "A fjord between steep cliffs", caption: "worth every step of the climb", date: "'25 12 28", tag: "Travel" },
  { src: "/life/1060.jpg", alt: "Pour-over coffee being brewed", caption: "the 7am ritual", date: "'26 03 14", tag: "Food" },
  { src: "/life/1025.jpg", alt: "A pug wrapped in a blanket", caption: "a friend's dog, a better mood than mine", date: "'26 01 09", tag: "Little things" },
  { src: "/life/1018.jpg", alt: "A road winding through green highlands", caption: "no signal, no complaints", date: "'25 08 17", tag: "Travel" },
  { src: "/life/1080.jpg", alt: "A crate of strawberries", caption: "the farmers' market haul", date: "'26 02 22", tag: "Food" },
  { src: "/life/1069.jpg", alt: "An orange jellyfish against blue water", caption: "the aquarium, and twenty minutes of staring", date: "'25 11 02", tag: "Little things" },
  { src: "/life/1035.jpg", alt: "A person under a waterfall with a rainbow", caption: "soaked and happy about it", date: "'25 06 30", tag: "Travel" },
  { src: "/life/1043.jpg", alt: "Granite cliffs above a river and pines", caption: "a quiet morning by the river", date: "'25 05 11", tag: "Travel" },
  { src: "/life/1016.jpg", alt: "Red rock canyon at sunset", caption: "golden hour, earned", date: "'25 04 03", tag: "Travel" },
  { src: "/life/1039.jpg", alt: "Waterfall in a green forest", caption: "the long way round", date: "'25 09 21", tag: "Travel" },
];

// TODO: placeholder setup, replace with what you actually use.
// `logo` is a tool name for TechLogo; `glyph` is a lucide icon for things without a brand.
export type UsesGlyph = "laptop" | "monitor" | "keyboard" | "type" | "coffee";
export const uses: { group: string; items: { name: string; note: string; logo?: string; glyph?: UsesGlyph; wide?: boolean }[] }[] = [
  {
    group: "Desk",
    items: [
      { name: "MacBook Pro (M1 Pro)", logo: "apple", wide: true, note: "The one machine everything runs on: editor, Docker, local models and a browser full of docs." },
      { name: "External monitor", glyph: "monitor", note: "Code on one side, docs on the other." },
      { name: "Mechanical keyboard", glyph: "keyboard", note: "Mostly so typing tests feel fair." },
    ],
  },
  {
    group: "Editor & terminal",
    items: [
      { name: "VS Code", logo: "vscode", note: "With far too many extensions." },
      { name: "Terminal + zsh", logo: "zsh", note: "Short aliases for everything." },
      { name: "Geist Mono", glyph: "type", note: "The same font as this site's numbers." },
    ],
  },
  {
    group: "AI & tooling",
    items: [
      { name: "Claude", logo: "claude", note: "My pair programmer and rubber duck." },
      { name: "Jupyter", logo: "jupyter", note: "Where experiments start." },
      { name: "Postman", logo: "postman", note: "For poking APIs before writing clients." },
    ],
  },
  {
    group: "Daily",
    items: [
      { name: "Notion", logo: "notion", note: "Notes, plans, half-finished ideas." },
      { name: "Chai", glyph: "coffee", wide: true, note: "Non-negotiable after 4pm." },
    ],
  },
];

// The soundtrack on the uses page. Each song links to Spotify search, so no IDs are needed.
// TODO: placeholders (popular picks); swap in what you actually have on repeat. Set `spotifyPlaylist`
// to a playlist id (the part after /playlist/ in its URL) to also show Spotify's own player.
export const soundtrack = {
  spotifyPlaylist: undefined as string | undefined,
  tracks: [
    { title: "Samajavaragamana", artist: "Sid Sriram", length: "3:49", hue: 18 },
    { title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", length: "3:35", hue: 42 },
    { title: "Kesariya", artist: "Arijit Singh", length: "4:28", hue: 330 },
    { title: "Blinding Lights", artist: "The Weeknd", length: "3:20", hue: 355 },
    { title: "Believer", artist: "Imagine Dragons", length: "3:24", hue: 200 },
    { title: "Butta Bomma", artist: "Armaan Malik", length: "3:17", hue: 160 },
  ],
  placeholder: true,
};

// Everything I use, drawn as a constellation on the home page. `level` sets how bright a star is.
// Levels follow the resume. TODO: the one-line takes are placeholders; rewrite them in your own words.
export type StackLevel = "daily" | "often" | "dabbled";
export type StackCategory = "AI / ML" | "Backend" | "Frontend" | "Data" | "Infra" | "Tools";
export const stack: { name: string; category: StackCategory; level: StackLevel; take: string }[] = [
  { name: "Python", category: "AI / ML", level: "daily", take: "Where every idea starts, and where most of my backends end up." },
  { name: "LangGraph", category: "AI / ML", level: "daily", take: "State machines for agents. It matches how I think about multi-step workflows." },
  { name: "LangChain", category: "AI / ML", level: "often", take: "Great for prototypes. I reach for LangGraph once state gets real." },
  { name: "OpenAI API", category: "AI / ML", level: "daily", take: "The default I benchmark everything else against." },
  { name: "Gemini", category: "AI / ML", level: "often", take: "Long context for cheap. It powers GhostWriterAI's agents." },
  { name: "Claude", category: "AI / ML", level: "often", take: "Strong at tool calling and following long instructions." },
  { name: "ChromaDB", category: "AI / ML", level: "often", take: "The quickest way to put RAG behind a prototype." },
  { name: "Qdrant", category: "AI / ML", level: "dabbled", take: "Filters that actually work when retrieval gets serious." },
  { name: "scikit-learn", category: "AI / ML", level: "often", take: "The models InferX serves. Still the right answer more often than people admit." },
  { name: "MCP", category: "AI / ML", level: "often", take: "The standard way to hand tools to an agent." },
  { name: "FastAPI", category: "Backend", level: "daily", take: "Types in, OpenAPI out, and I sleep at night." },
  { name: "Pydantic", category: "Backend", level: "daily", take: "Validation that doubles as documentation." },
  { name: "Node.js", category: "Backend", level: "often", take: "For when the backend and frontend should share types." },
  { name: "Express", category: "Backend", level: "often", take: "Minimal, until it isn't." },
  { name: "Django", category: "Backend", level: "dabbled", take: "Batteries included. I rarely need all of them." },
  { name: "Celery", category: "Backend", level: "often", take: "Background jobs the boring, reliable way." },
  { name: "RabbitMQ", category: "Backend", level: "often", take: "The queue behind event-driven Lambdas at Pursuit." },
  { name: "GraphQL", category: "Backend", level: "dabbled", take: "Great for clients, more work for the server." },
  { name: "SQLAlchemy", category: "Backend", level: "daily", take: "The ORM I fight with least." },
  { name: "Alembic", category: "Backend", level: "often", take: "Migrations I can read in a code review." },
  { name: "PostgreSQL", category: "Data", level: "daily", take: "Boring, correct, and older than most of my bugs." },
  { name: "Redis", category: "Data", level: "daily", take: "Cache, queue, rate limiter. It's the duct tape of my stack." },
  { name: "MongoDB", category: "Data", level: "often", take: "Fine, until you need a join." },
  { name: "Elasticsearch", category: "Data", level: "often", take: "Search that scales past LIKE '%query%'." },
  { name: "SQLite", category: "Data", level: "dabbled", take: "Offline-first queues on mobile." },
  { name: "Prisma", category: "Data", level: "dabbled", take: "Schema-first, and the types come for free." },
  { name: "Supabase", category: "Data", level: "dabbled", take: "Postgres with auth attached. Fast to start." },
  { name: "TypeScript", category: "Frontend", level: "daily", take: "I don't trust code I can't hover over." },
  { name: "React", category: "Frontend", level: "daily", take: "Still my default for anything interactive." },
  { name: "Next.js", category: "Frontend", level: "daily", take: "This site runs on it, and so do most of my prototypes." },
  { name: "Tailwind CSS", category: "Frontend", level: "daily", take: "Fast to write. I still name my colors, though." },
  { name: "JavaScript", category: "Frontend", level: "often", take: "Where I started, before types." },
  { name: "React Native", category: "Frontend", level: "dabbled", take: "One codebase, two stores, many surprises." },
  { name: "shadcn/ui", category: "Frontend", level: "often", take: "Components I own, not a dependency I fight." },
  { name: "AWS", category: "Infra", level: "daily", take: "Lambda, ECS, ECR, API Gateway, Cognito, S3, CloudWatch: where my production code runs." },
  { name: "Docker", category: "Infra", level: "daily", take: "If it runs in a container, it runs everywhere." },
  { name: "GitHub Actions", category: "Infra", level: "often", take: "CI that lives next to the code." },
  { name: "CloudFormation", category: "Infra", level: "often", take: "Infrastructure I can diff." },
  { name: "Nginx", category: "Infra", level: "often", take: "Two lines of config, three hours of debugging." },
  { name: "Vercel", category: "Infra", level: "often", take: "Push to deploy. No YAML required." },
  { name: "Render", category: "Infra", level: "dabbled", take: "Where GhostWriterAI's backend lives." },
  { name: "Git", category: "Tools", level: "daily", take: "Small commits, honest messages." },
  { name: "pytest", category: "Tools", level: "daily", take: "Fixtures are the best part of Python testing." },
  { name: "C++", category: "Tools", level: "often", take: "The language of 800+ competitive programming problems." },
  { name: "Bash", category: "Tools", level: "often", take: "Short scripts for everything I do twice." },
  { name: "Postman", category: "Tools", level: "often", take: "For poking APIs before writing clients." },
  { name: "Cursor", category: "Tools", level: "daily", take: "Where most of my code gets written now." },
  { name: "Linux", category: "Tools", level: "often", take: "Every server I touch, eventually." },
];
