// Curated posts from X and LinkedIn, shown on /posts. Newest first is handled for you.
// To add one: copy an entry, paste the post's text and URL, and (optionally) drop images in public/posts/.

export type SocialPost = {
  platform: "x" | "linkedin";
  date: string; // YYYY-MM-DD
  text: string; // Blank lines become paragraphs.
  url: string;
  images?: { src: string; alt: string; width?: number; height?: number }[];
  metrics?: { likes?: number; reposts?: number; comments?: number };
  placeholder?: boolean;
};

export const socialPosts: SocialPost[] = [
  {
    platform: "x",
    date: "2026-10-19",
    text: "Initially I was primarily learning how to integrate LLMs into software like RAG, AI Agents, Evals, etc.\n\nNow realized you can do so much better if you have the knowledge of ML, both theoretical and applied.\n\nStarting this course and will share updates here: aiengineeringfromscratch.com",
    url: "https://x.com/itspartha_/status/2112182220140286197",
    images: [{ src: "/posts/x-ml-course.jpg", alt: "The AI Engineering from Scratch course page", width: 1199, height: 679 }],
  },
  {
    platform: "linkedin",
    date: "2026-08-29",
    text: "Most AI tutorials end when the demo works.\nReal AI engineering starts after that.\n\nWhat happens when retrieval fails?\nHow do you evaluate an agent?\nWhat breaks at scale?\nHow do you design systems instead of chaining APIs?\n\nI've been collecting books that help build the mental models for those questions.\n\nHere are 9 worth knowing about.\n\nWhich book would you add?",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7499315366033063936/",
    images: [{ src: "/posts/li-ai-engineering-books.jpg", alt: "Nine books on AI engineering, evaluation and scaling AI systems", width: 736, height: 981 }],
  },
  {
    platform: "x",
    date: "2026-05-24",
    text: "Most prompts don't fail because they're bad. They fail because they get buried.\n\nKeep what matters close to the attention. Visibility = reliability.",
    url: "https://x.com/itspartha_/status/2058638344918360169",
    images: [
      {
        src: "/posts/x-2026-05-24.jpg",
        alt: "Poster: most prompts don't fail because they're bad, they fail because they get buried in context. Every message, tool output and retrieved document competes for the model's attention.",
        width: 800,
        height: 1200,
      },
    ],
  },
  {
    platform: "x",
    date: "2026-04-12",
    text: "90% of AI coding mistakes = bad instructions.\n\nThis repo fixes that.\n\nMost AI repos try to make models smarter. This one does the opposite. It fixes how they behave.\n\nAndrej Karpathy \u201cskills\u201d repo = instruction layer for coding agents:\n\n\u2192 stop guessing\n\u2192 ask before coding",
    url: "https://x.com/itspartha_/status/2043315846949609717",
    images: [{ src: "/posts/x-karpathy-skills.jpg", alt: "Screenshot of the skills repository for coding agents", width: 1200, height: 600 }],
  },
];
