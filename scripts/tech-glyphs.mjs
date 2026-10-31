// Writes single-colour brand glyphs (simple-icons) to public/tech/mono/ and a small manifest,
// so the browser never downloads simple-icons paths in the JS bundle.
// The alias → icon table lives in src/lib/tech.ts (server and scripts only). Runs as part of `npm run logos`.
import fs from "node:fs";
import path from "node:path";
import * as si from "simple-icons";

const src = fs.readFileSync("src/lib/tech.ts", "utf8");
const rows = [...src.matchAll(/\[\[([^\]]+)\],\s*(si[A-Za-z0-9]+)\]/g)];
const outDir = "public/tech/mono";
fs.mkdirSync(outDir, { recursive: true });

const manifest = {};
for (const [, names, exp] of rows) {
  const icon = si[exp];
  if (!icon) throw new Error(`simple-icons has no ${exp}`);
  fs.writeFileSync(
    path.join(outDir, `${icon.slug}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${icon.path}"/></svg>`,
  );
  for (const n of names.split(",").map((s) => s.trim().replace(/^"|"$/g, ""))) {
    manifest[n] = { title: icon.title, hex: icon.hex, mono: `/tech/mono/${icon.slug}.svg` };
  }
}
fs.writeFileSync("src/lib/tech-glyphs.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${Object.keys(manifest).length} aliases, ${rows.length} glyphs`);
