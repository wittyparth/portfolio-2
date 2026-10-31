// Writes full-colour logos for the stack and the uses page to public/tech/, and a manifest the components read.
// Sources: Iconify's "logos" set (svg-logos), then "devicon". Run with `npm run logos` after adding a tool.
import fs from "node:fs";
import path from "node:path";
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from "@iconify/utils";
import { icons as logos } from "@iconify-json/logos";
import { icons as devicon } from "@iconify-json/devicon";

const SETS = { logos, devicon };

// key (same normalisation as src/lib/tech.ts) → candidate icons, first match wins.
// `ink: true` marks logos that are mostly black and need inverting in dark mode.
const WANT = {
  python: ["logos:python"],
  langgraph: ["devicon:langgraph", "logos:langgraph"],
  langchain: ["logos:langchain-icon", "logos:langchain", "devicon:langchain"],
  openaiapi: [["logos:openai-icon", true]],
  gemini: ["logos:google-gemini-icon", "logos:google-gemini", "devicon:googlegemini"],
  claude: ["logos:claude-icon", "logos:anthropic-icon"],
  chromadb: ["logos:chroma", "devicon:chromadb"],
  qdrant: ["logos:qdrant-icon", "logos:qdrant", "devicon:qdrant"],
  scikitlearn: ["devicon:scikitlearn", "logos:scikit-learn"],
  mcp: [["logos:model-context-protocol-icon", true], ["logos:mcp", true]],
  fastapi: ["logos:fastapi-icon", "devicon:fastapi"],
  pydantic: ["logos:pydantic-icon", "logos:pydantic", "devicon:pydantic"],
  nodejs: ["logos:nodejs-icon", "devicon:nodejs"],
  express: [["devicon:express-original", true], ["logos:express", true], ["devicon:express", true]],
  django: ["logos:django-icon", "devicon:django"],
  celery: ["logos:celery", "devicon:celery"],
  rabbitmq: ["logos:rabbitmq-icon", "devicon:rabbitmq"],
  graphql: ["logos:graphql", "devicon:graphql"],
  alembic: ["devicon:alembic"],
  postgresql: ["logos:postgresql", "devicon:postgresql"],
  redis: ["logos:redis", "devicon:redis"],
  mongodb: ["logos:mongodb-icon", "devicon:mongodb"],
  elasticsearch: ["logos:elasticsearch", "devicon:elasticsearch"],
  sqlite: ["logos:sqlite", "devicon:sqlite"],
  prisma: [["logos:prisma", true], ["devicon:prisma", true]],
  supabase: ["logos:supabase-icon", "devicon:supabase"],
  typescript: ["logos:typescript-icon", "devicon:typescript"],
  react: ["logos:react", "devicon:react"],
  nextjs: [["logos:nextjs-icon", true], ["devicon:nextjs", true]],
  tailwindcss: ["logos:tailwindcss-icon", "devicon:tailwindcss"],
  javascript: ["logos:javascript", "devicon:javascript"],
  reactnative: ["logos:react", "devicon:reactnative"],
  shadcnui: [["logos:shadcn-ui", true], ["devicon:shadcnui", true]],
  aws: [["logos:aws", true], ["devicon:amazonwebservices-wordmark", true]],
  docker: ["logos:docker-icon", "devicon:docker"],
  githubactions: ["logos:github-actions", "devicon:githubactions"],
  cloudformation: ["logos:aws-cloudformation", "devicon:cloudformation"],
  nginx: ["logos:nginx", "devicon:nginx"],
  vercel: [["logos:vercel-icon", true], ["devicon:vercel", true]],
  render: [["logos:render", true], ["devicon:render", true]],
  git: ["logos:git-icon", "devicon:git"],
  pytest: ["logos:pytest", "devicon:pytest"],
  "c++": ["logos:c-plusplus", "devicon:cplusplus"],
  bash: [["logos:bash-icon", true], ["devicon:bash", true]],
  postman: ["logos:postman-icon", "devicon:postman"],
  cursor: [["logos:cursor-icon", true], ["logos:cursor", true], ["devicon:cursor", true]],
  linux: ["logos:linux-tux", "devicon:linux"],
  awscdk: [["logos:aws", true]],
  expo: [["logos:expo-icon", true], ["devicon:expo", true]],
  turborepo: ["logos:turborepo-icon", "devicon:turborepo"],
  vite: ["logos:vitejs", "devicon:vitejs"],
  livekit: [["logos:livekit-icon", true], ["logos:livekit", true]],
  // Uses page
  vscode: ["logos:visual-studio-code", "devicon:vscode"],
  jupyter: ["logos:jupyter", "devicon:jupyter"],
  notion: [["logos:notion-icon", true], ["devicon:notion", true]],
  zsh: [["devicon:zsh", true]],
};

const outDir = path.resolve("public/tech");
fs.mkdirSync(outDir, { recursive: true });
const manifest = {};
const missing = [];

for (const [key, candidates] of Object.entries(WANT)) {
  let done = false;
  for (const c of candidates) {
    const [id, ink = false] = Array.isArray(c) ? c : [c];
    const [set, name] = id.split(":");
    const data = getIconData(SETS[set], name);
    if (!data) continue;
    // Wordmarks are unreadable at icon size; skip them and let simple-icons draw the mark instead.
    if (data.width / data.height > 1.7) continue;
    const svg = iconToSVG(data, { height: "auto" });
    const html = iconToHTML(replaceIDs(svg.body, key.replace(/\W/g, "") + "-"), svg.attributes);
    const file = `${key.replace(/\+/g, "p")}.svg`;
    fs.writeFileSync(path.join(outDir, file), html.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/xmlns="[^"]*" xmlns="/, 'xmlns="'));
    manifest[key] = ink ? { src: `/tech/${file}`, ink: true } : { src: `/tech/${file}` };
    done = true;
    break;
  }
  if (!done) missing.push(key);
}

fs.writeFileSync("src/lib/tech-logos.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote ${Object.keys(manifest).length} logos`);
if (missing.length) console.log(`no colour logo for: ${missing.join(", ")} (falls back to simple-icons)`);
