// Captures /play states: node scripts/capture-play.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3210";
const out = ".impeccable/review/play";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const errors = [];

for (const scheme of ["dark", "light"]) {
  for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, colorScheme: scheme, hasTouch: name === "mobile" });
    page.on("pageerror", (e) => errors.push(`${scheme}/${name}: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && errors.push(`${scheme}/${name} console: ${m.text()}`));
    await page.goto(`${base}/play`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${name}-${scheme}-idle.png` });

    await page.getByRole("tab", { name: "15s" }).click();
    await page.waitForTimeout(900);
    await page.getByLabel("Type the words shown").focus();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${name}-${scheme}-focused.png` });

    const words = (await page.locator("[data-words]").first().textContent()) ?? "";
    const t0 = Date.now();
    let i = 0;
    // ~70 wpm with an occasional typo, until the clock runs out.
    while (Date.now() - t0 < 15800 && i < words.length) {
      const chunk = words.slice(i, i + 6);
      const typo = i % 97 === 30 ? "x" : "";
      if (typo) {
        await page.keyboard.type(typo, { delay: 22 });
        await page.keyboard.press("Backspace");
      }
      await page.keyboard.type(chunk, { delay: 22 });
      i += 6;
      if (Date.now() - t0 > 4000 && Date.now() - t0 < 4600) await page.screenshot({ path: `${out}/${name}-${scheme}-typing.png` });
      await page.waitForTimeout(160);
    }
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${out}/${name}-${scheme}-results.png`, fullPage: true });

    const nameInput = page.getByLabel("Name for the leaderboard");
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill(`Shot ${scheme} ${name}`);
      await page.getByRole("button", { name: "Submit score" }).click();
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `${out}/${name}-${scheme}-submitted.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "no page errors");
