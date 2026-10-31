// Makes public/projects/<slug>/cover.png for projects that don't have one yet.
// Live sites are screenshotted; the rest get a labelled placeholder to replace later.
// node scripts/project-covers.mjs [--force] [slug ...]
import { chromium } from "playwright";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import matter from "gray-matter";

const force = process.argv.includes("--force");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--")); // optional slugs
const browser = await chromium.launch();

for (const file of readdirSync("content/projects").filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))) {
  const slug = file.replace(/\.mdx$/, "");
  if (only.length && !only.includes(slug)) continue;
  const { data } = matter(readFileSync(`content/projects/${file}`, "utf8"));
  const dir = `public/projects/${slug}`;
  const out = `${dir}/cover.png`;
  const hasImages = existsSync(dir) && readdirSync(dir).some((f) => /^(\d|cover\.)/.test(f));
  if (hasImages && !force) continue;
  mkdirSync(dir, { recursive: true });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.25, colorScheme: "dark" });
  let shot = false;
  if (data.live) {
    try {
      await page.goto(data.live, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: out });
      shot = true;
      console.log(`${slug}: screenshot of ${data.live}`);
    } catch (e) {
      console.log(`${slug}: live site failed (${e.message.split("\n")[0]}), using a placeholder`);
    }
  }
  if (!shot) {
    await page.setContent(`<!doctype html><html><body style="margin:0;width:1280px;height:800px;display:grid;place-items:center;
      background:#0a0a0a;background-image:radial-gradient(#262626 1.5px,transparent 1.5px);background-size:28px 28px;
      font-family:-apple-system,'Helvetica Neue',sans-serif;color:#fafafa">
      <div style="text-align:center;max-width:900px;padding:0 60px">
        <div style="font:500 18px ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#737373">${data.year} · ${data.stack.slice(0, 3).join(" · ")}</div>
        <div style="margin-top:22px;font-size:84px;font-weight:650;letter-spacing:-.035em">${data.name}</div>
        <div style="margin-top:22px;font-size:26px;line-height:1.45;color:#a3a3a3">${data.tagline}</div>
      </div>
      <div style="position:absolute;bottom:30px;font:600 14px ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#525252">placeholder · replace with a real screenshot</div>
      </body></html>`);
    await page.screenshot({ path: out });
    console.log(`${slug}: placeholder`);
  }
  await page.close();
}
await browser.close();
