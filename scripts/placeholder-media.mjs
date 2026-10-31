// Generates labelled placeholder gallery frames + demo videos for each project.
// Replace public/projects/<slug>/* with real screenshots / recordings later.
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

const projects = [
  {
    slug: "mcpforge",
    name: "MCPForge",
    frames: [
      { title: "Upload a spec", body: "openapi.yaml · 42 endpoints detected" },
      { title: "Review generated tools", body: "get_order · create_refund · list_orders" },
      { title: "Deploy the MCP server", body: "https://mcp.example.dev/orders  ● live" },
    ],
    code: `paths:\n  /orders/{id}:\n    get:\n      operationId: getOrder\n# → tool: get_order(id: string)`,
  },
  {
    slug: "nl2sql",
    name: "nl2sql",
    frames: [
      { title: "Ask in plain English", body: "top 5 customers by revenue this quarter?" },
      { title: "Read the SQL first", body: "SELECT c.name, SUM(o.total) … LIMIT 5;" },
      { title: "Run it", body: "5 rows · 38 ms" },
    ],
    code: `-- top 5 customers by revenue\nSELECT c.name, SUM(o.total) AS revenue\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.name ORDER BY revenue DESC LIMIT 5;`,
  },
  {
    slug: "synapse",
    name: "Synapse",
    frames: [
      { title: "Ingest documents", body: "1,204 chunks → Qdrant" },
      { title: "Agent graph", body: "query → retrieve → rerank → answer" },
      { title: "Grounded answers", body: "3 sources cited" },
    ],
    code: `graph = StateGraph(AgentState)\ngraph.add_node("retrieve", retrieve)\ngraph.add_node("answer", answer)\ngraph.add_edge("retrieve", "answer")\napp = graph.compile()`,
  },
];

const shell = (inner, dark) => `<!doctype html><html><head><style>
*{box-sizing:border-box;margin:0}
body{width:1600px;height:1000px;display:grid;place-items:center;font-family:-apple-system,"Helvetica Neue",sans-serif;
background:${dark ? "#0a0a0a" : "#f5f5f5"};background-image:radial-gradient(${dark ? "#262626" : "#e5e5e5"} 1.5px,transparent 1.5px);background-size:28px 28px;color:${dark ? "#fafafa" : "#0a0a0a"}}
.win{width:1280px;height:780px;border-radius:18px;background:${dark ? "#171717" : "#fff"};border:1px solid ${dark ? "#262626" : "#e5e5e5"};box-shadow:0 40px 80px -30px rgba(0,0,0,.45);overflow:hidden;display:flex;flex-direction:column}
.bar{height:52px;display:flex;align-items:center;gap:10px;padding:0 22px;border-bottom:1px solid ${dark ? "#262626" : "#eee"}}
.bar i{width:13px;height:13px;border-radius:50%;background:${dark ? "#404040" : "#d4d4d4"}}
.bar span{margin-left:16px;font:500 15px ui-monospace,Menlo,monospace;color:#8a8a8a}
.main{flex:1;display:grid;place-items:center;padding:60px;text-align:center}
h1{font-size:64px;letter-spacing:-.03em;font-weight:650}
p{margin-top:22px;font:500 26px ui-monospace,Menlo,monospace;color:#8a8a8a}
.tag{position:absolute;bottom:34px;font:600 16px ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;color:#8a8a8a}
pre{font:500 30px/1.7 ui-monospace,Menlo,monospace;text-align:left;white-space:pre}
.cur{display:inline-block;width:14px;height:34px;background:currentColor;vertical-align:-6px;animation:b 1s steps(1) infinite}
@keyframes b{50%{opacity:0}}
</style></head><body>${inner}<div class="tag">placeholder · replace with a real screenshot</div></body></html>`;

const browser = await chromium.launch();
for (const p of projects) {
  const dir = `public/projects/${p.slug}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  for (const [i, f] of p.frames.entries()) {
    await page.setContent(shell(`<div class="win"><div class="bar"><i></i><i></i><i></i><span>${p.slug}.app</span></div><div class="main"><div><h1>${f.title}</h1><p>${f.body}</p></div></div></div>`, i % 2 === 1));
    await page.screenshot({ path: `${dir}/${i + 1}.png` });
  }
  await page.close();

  const tmp = `/tmp/pf-video-${p.slug}`;
  rmSync(tmp, { recursive: true, force: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: tmp, size: { width: 1280, height: 800 } } });
  const vp = await ctx.newPage();
  const code = JSON.stringify(p.code);
  await vp.setContent(
    shell(`<div class="win" style="width:1100px;height:640px"><div class="bar"><i></i><i></i><i></i><span>${p.name} — demo</span></div><div class="main" style="place-items:start"><pre id="c"></pre></div></div>
    <script>const s=${code};let i=0;const el=document.getElementById('c');const t=setInterval(()=>{i++;el.innerHTML=s.slice(0,i).replace(/</g,'&lt;')+'<span class="cur"></span>';if(i>=s.length)clearInterval(t)},45)</script>`, true)
      .replace("width:1600px;height:1000px", "width:1280px;height:800px"),
  );
  await vp.waitForTimeout(Math.max(5000, p.code.length * 45 + 1500));
  await ctx.close();
  const webm = readdirSync(tmp).find((f) => f.endsWith(".webm"));
  renameSync(`${tmp}/${webm}`, `${tmp}/raw.webm`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `${tmp}/raw.webm`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-movflags", "+faststart", "-an", `${dir}/demo.mp4`]);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", `${dir}/demo.mp4`, "-ss", "00:00:04", "-frames:v", "1", `${dir}/demo-poster.jpg`]);
  console.log("done", p.slug);
}
await browser.close();
