// node scripts/shot.mjs <url-path> <out.png> [--scheme dark|light] [--width 1440] [--selector css] [--full] [--wait ms] [--click css]... [--hover css] [--keys "Meta+k"]
import { chromium } from "playwright";

const args = process.argv.slice(2);
const [path, out] = args;
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const all = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));

const width = Number(opt("width", 1440));
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height: width < 600 ? 844 : 900 },
  colorScheme: opt("scheme", "dark"),
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(`http://localhost:3210${path}`, { waitUntil: "networkidle" });
await page.waitForTimeout(Number(opt("wait", 2500)));
for (const sel of all("click")) {
  await page.locator(sel).first().click();
  await page.waitForTimeout(900);
}
const hover = opt("hover");
if (hover) {
  await page.locator(hover).first().hover();
  await page.waitForTimeout(700);
}
const keys = opt("keys");
if (keys) {
  await page.keyboard.press(keys);
  await page.waitForTimeout(800);
}
const selector = opt("selector");
if (selector) {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await el.screenshot({ path: out });
} else {
  await page.screenshot({ path: out, fullPage: args.includes("--full") });
}
await browser.close();
console.log(errors.length ? `errors:\n${errors.join("\n")}` : "ok");
