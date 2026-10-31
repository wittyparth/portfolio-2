// Blog post types, shared by the server schema and the client index.
export const POST_TYPES = {
  essay: { label: "Essay", dot: "bg-sky-500" },
  tutorial: { label: "Tutorial", dot: "bg-emerald-500" },
  "build-log": { label: "Build log", dot: "bg-amber-500" },
  note: { label: "Note", dot: "bg-violet-500" },
} as const;

export type PostType = keyof typeof POST_TYPES;
export const POST_TYPE_KEYS = Object.keys(POST_TYPES) as [PostType, ...PostType[]];
