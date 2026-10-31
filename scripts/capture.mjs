// Captures review screenshots for every page: node scripts/capture.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3210";
const out = ".impeccable/review/final";
mkdirSync(out, { recursive: true });

const pages = [
  "/", "/projects", "/projects/mcpforge", "/projects/tweetmind", "/blog", "/blog/what-breaks-when-agents-call-real-apis",
  "/posts", "/life", "/play", "/guestbook", "/uses", "/not-a-page",
];
const browser = await chromium.launch();
const errors = [];

for (const scheme of ["dark", "light"]) {
  for (const [device, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    for (const path of pages) {
      const page = await browser.newPage({ viewport, colorScheme: scheme });
      const tag = `${scheme}/${device}${path}`;
      page.on("pageerror", (e) => errors.push(`${tag}: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() === "error" && !m.text().includes("404 (Not Found)")) errors.push(`${tag} console: ${m.text().slice(0, 200)}`);
      });
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(3500);
      // Scroll through once so in-view counters settle, then return to top.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      const name = (path === "/" ? "home" : path.slice(1)).replace(/\//g, "-");
      await page.screenshot({ path: `${out}/${name}-${device}-${scheme}.png`, fullPage: true });
      await page.close();
    }
  }
}

await browser.close();
console.log(errors.length ? errors.join("\n") : "no page errors");
