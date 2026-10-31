import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { CONTENT_DIR } from "./mdx-content";

// content/projects/<slug>.architecture.json: a layered diagram drawn by <ArchitectureDiagram>.
// Lanes are columns, left to right; each node sits in a lane at a row (0 = top).

export const NODE_KINDS = [
  "client", "gateway", "service", "worker", "queue", "database", "cache", "vector-db", "llm", "external", "storage", "scheduler",
] as const;

const Node = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ids are lowercase-with-dashes"),
  label: z.string().max(26, "keep labels under 26 characters"),
  lane: z.string(),
  row: z.number().int().min(0).max(9),
  kind: z.enum(NODE_KINDS),
  tech: z.string().optional(), // a stack name; shows its logo when known
  note: z.string().max(200).optional(), // what it does, shown on hover
});

const Edge = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().max(28).optional(),
  style: z.enum(["sync", "async", "stream"]).default("sync"),
});

const ArchitectureSchema = z
  .object({
    title: z.string().optional(),
    lanes: z.array(z.object({ id: z.string(), label: z.string() })).min(2).max(6),
    nodes: z.array(Node).min(2).max(20),
    edges: z.array(Edge).min(1),
    flow: z.array(z.string()).max(10).optional(), // numbered walkthrough under the diagram
  })
  .superRefine((a, ctx) => {
    const lanes = new Set(a.lanes.map((l) => l.id));
    const ids = new Set(a.nodes.map((n) => n.id));
    a.nodes.forEach((n, i) => {
      if (!lanes.has(n.lane)) ctx.addIssue({ code: "custom", path: ["nodes", i, "lane"], message: `unknown lane "${n.lane}"` });
    });
    const cells = new Set<string>();
    a.nodes.forEach((n, i) => {
      const cell = `${n.lane}:${n.row}`;
      if (cells.has(cell)) ctx.addIssue({ code: "custom", path: ["nodes", i, "row"], message: `two nodes share ${cell}` });
      cells.add(cell);
    });
    a.edges.forEach((e, i) => {
      if (!ids.has(e.from)) ctx.addIssue({ code: "custom", path: ["edges", i, "from"], message: `unknown node "${e.from}"` });
      if (!ids.has(e.to)) ctx.addIssue({ code: "custom", path: ["edges", i, "to"], message: `unknown node "${e.to}"` });
    });
  });

export type Architecture = z.infer<typeof ArchitectureSchema>;

/** Validates raw diagram data, failing with the file name and every problem. */
export function parseArchitecture(slug: string, raw: unknown): Architecture {
  const parsed = ArchitectureSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  • ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`content/projects/${slug}.architecture.json is invalid:\n${issues}`);
  }
  return parsed.data;
}

export function getArchitecture(slug: string): Architecture | null {
  const file = path.join(CONTENT_DIR, "projects", `${slug}.architecture.json`);
  if (!existsSync(file)) return null;
  return parseArchitecture(slug, JSON.parse(readFileSync(file, "utf8")));
}
