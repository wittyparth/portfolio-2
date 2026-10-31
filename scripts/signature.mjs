// Turns a name into SVG path data with a script font: node scripts/signature.mjs <font.ttf> "Partha" [out.svg]
// Placeholder until a real signature is traced.
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";

const [fontPath, text = "Partha", out] = process.argv.slice(2);
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const size = 120;
const path = font.getPath(text, 0, size, size);
const box = path.getBoundingBox();
const pad = 6;
const w = Math.ceil(box.x2 - box.x1 + pad * 2);
const h = Math.ceil(box.y2 - box.y1 + pad * 2);
const shifted = font.getPath(text, -box.x1 + pad, size - box.y1 + pad - size + size, size);
const d = shifted.toPathData(2);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="black"/></svg>`;
if (out) writeFileSync(out, svg);
console.log(JSON.stringify({ viewBox: `0 0 ${w} ${h}`, length: d.length }));
if (!out) console.log(d);
