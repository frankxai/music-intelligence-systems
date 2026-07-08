#!/usr/bin/env node
/**
 * validate-registry.mjs — zero-dependency consistency checks for registry/*.json.
 *
 * Not a full JSON Schema validator; enforces the contracts that matter:
 * required fields, enums, unique ids, cross-references (agent.repo and
 * skill.repo must exist in repos.json), and canonical_source shape.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(HUB, p), "utf8"));

const errors = [];
const err = (msg) => errors.push(msg);

const repos = read("registry/repos.json");
const agents = read("registry/agents.json");
const skills = read("registry/skills.json");
const tools = read("registry/tools.json");

// --- repos ---
const repoIds = new Set();
const ROLE = new Set(["hub", "engine", "production", "substrate", "education", "discovery", "distribution", "workflows", "index", "surface", "adjacent"]);
for (const r of repos.repos) {
  if (!r.id) err("repo missing id");
  if (repoIds.has(r.id)) err(`duplicate repo id: ${r.id}`);
  repoIds.add(r.id);
  if (!ROLE.has(r.role)) err(`repo ${r.id}: invalid role '${r.role}'`);
  if (!r.url?.startsWith("https://github.com/")) err(`repo ${r.id}: bad url`);
}

// --- agents ---
const agentIds = new Set();
const MODEL = new Set(["haiku", "sonnet", "opus"]);
for (const a of agents.agents) {
  const where = `agent ${a.id ?? "(no id)"}`;
  for (const f of ["id", "name", "repo", "canonical_source", "summary"])
    if (!a[f]) err(`${where}: missing ${f}`);
  if (typeof a.portable !== "boolean") err(`${where}: portable must be boolean`);
  if (agentIds.has(a.id)) err(`duplicate agent id: ${a.id}`);
  agentIds.add(a.id);
  if (!repoIds.has(a.repo)) err(`${where}: repo '${a.repo}' not in repos.json`);
  if (a.model_hint && !MODEL.has(a.model_hint)) err(`${where}: bad model_hint`);
  if (!a.canonical_source?.startsWith(a.repo + "/"))
    err(`${where}: canonical_source must start with '${a.repo}/'`);
  if (a.summary && a.summary.length > 300) err(`${where}: summary > 300 chars`);
}

// --- skills ---
const skillIds = new Set();
const FORMAT = new Set(["skill-md-dir", "skill-md-flat"]);
for (const s of skills.skills) {
  const where = `skill ${s.id ?? "(no id)"}`;
  for (const f of ["id", "repo", "path", "format", "summary"])
    if (!s[f]) err(`${where}: missing ${f}`);
  if (skillIds.has(s.id)) err(`duplicate skill id: ${s.id}`);
  skillIds.add(s.id);
  if (!repoIds.has(s.repo)) err(`${where}: repo '${s.repo}' not in repos.json`);
  if (!FORMAT.has(s.format)) err(`${where}: bad format '${s.format}'`);
}

// --- tools ---
const toolIds = new Set();
const KIND = new Set(["mcp-server", "cli", "command", "web"]);
for (const t of tools.tools) {
  const where = `tool ${t.id ?? "(no id)"}`;
  for (const f of ["id", "kind", "repo", "path", "status"])
    if (!t[f]) err(`${where}: missing ${f}`);
  if (toolIds.has(t.id)) err(`duplicate tool id: ${t.id}`);
  toolIds.add(t.id);
  if (!repoIds.has(t.repo)) err(`${where}: repo '${t.repo}' not in repos.json`);
  if (!KIND.has(t.kind)) err(`${where}: bad kind '${t.kind}'`);
  if (!["shipped", "specified", "planned"].includes(t.status)) err(`${where}: bad status`);
}

// --- registry<->disk drift scan (P1, WARNING layer — never fails the checks above) ---
// For each repo present as a sibling checkout, scan its .claude/agents/*.md (skipping a
// deprecated/ subdir) and flag: (a) any agent file not present in registry/agents.json —
// this is what would have caught the two colliding "Music Producer" agents automatically —
// and (b) the inverse, any registry agent whose canonical_source is missing on disk.
// Degrades to "skipped" when a sibling isn't checked out (the normal CI case) or has no
// .claude/agents/ directory; either way it never adds to `errors` / never affects exit code.
function extractFrontmatterName(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const line = m[1].split(/\r?\n/).find((l) => /^name:\s*/.test(l));
  if (!line) return null;
  return line.replace(/^name:\s*/, "").trim().replace(/^["']|["']$/g, "");
}

const bySource = new Map(agents.agents.map((a) => [a.canonical_source, a]));
const byNameLower = new Map();
for (const a of agents.agents) {
  const key = (a.name || "").toLowerCase();
  if (!key) continue;
  if (!byNameLower.has(key)) byNameLower.set(key, []);
  byNameLower.get(key).push(a);
}

const driftLines = [];
let diskNotInRegistry = 0;
let registryMissingOnDisk = 0;
let nameCollisions = 0;
let reposScanned = 0;
let reposSkipped = 0;

for (const r of repos.repos) {
  const root = [resolve(HUB, "..", r.id), join("/home/user", r.id)].find(
    (p) => existsSync(p) && statSync(p).isDirectory()
  );
  if (!root) {
    driftLines.push(`  - ${r.id}: skipped (sibling not checked out)`);
    reposSkipped++;
    continue;
  }
  reposScanned++;

  // (a) disk agent files -> registry. Repos like FrankX carry 100+ agents for every pillar,
  // not just music, so scope to filenames containing "music" (this hub's registry only ever
  // tracks music agents, and every music agent in the ecosystem is music-prefixed by
  // convention) rather than flooding the report with unrelated agents.
  const agentsDir = join(root, ".claude", "agents");
  if (existsSync(agentsDir) && statSync(agentsDir).isDirectory()) {
    const files = readdirSync(agentsDir).filter(
      (f) => f.endsWith(".md") && f.toLowerCase().includes("music") && statSync(join(agentsDir, f)).isFile()
    );
    for (const f of files) {
      const relPath = `${r.id}/.claude/agents/${f}`;
      const registered = bySource.has(relPath);
      if (!registered) diskNotInRegistry++;
      const name = extractFrontmatterName(readFileSync(join(agentsDir, f), "utf8"));
      const collisions = name
        ? (byNameLower.get(name.toLowerCase()) || []).filter((a) => a.canonical_source !== relPath)
        : [];
      if (!registered && collisions.length) {
        driftLines.push(
          `  - DRIFT: ${relPath} (name: '${name}') NOT in registry — collides with registered agent '${collisions[0].id}' (${collisions[0].canonical_source})`
        );
      } else if (!registered) {
        driftLines.push(
          `  - DRIFT: ${relPath}${name ? ` (name: '${name}')` : ""} on disk, not in registry/agents.json`
        );
      } else if (collisions.length) {
        nameCollisions++;
        driftLines.push(
          `  - DRIFT: ${relPath} is registered but frontmatter name '${name}' collides with a different registered agent '${collisions[0].id}' (${collisions[0].canonical_source})`
        );
      }
    }
  } else {
    driftLines.push(`  - ${r.id}: no .claude/agents/ directory (skipped disk->registry scan)`);
  }

  // (b) registry agents for this repo -> disk (independent of layout check above)
  for (const a of agents.agents) {
    if (a.repo !== r.id) continue;
    const rel = a.canonical_source.slice(r.id.length + 1);
    if (!existsSync(join(root, rel))) {
      registryMissingOnDisk++;
      driftLines.push(`  - DRIFT: registry agent '${a.id}' canonical_source missing on disk: ${a.canonical_source}`);
    }
  }
}

console.log(`\nregistry<->disk drift scan (P1, warning-only):`);
for (const l of driftLines) console.log(l);
console.log(
  `drift: ${diskNotInRegistry} agent(s) on disk not in registry, ${registryMissingOnDisk} registry canonical_source(s) missing on disk, ${nameCollisions} registered agent(s) with a colliding frontmatter name — ${reposScanned} repo(s) checked out and scanned, ${reposSkipped} skipped (not checked out).\n`
);

if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`OK — ${repos.repos.length} repos, ${agents.agents.length} agents, ${skills.skills.length} skills, ${tools.tools.length} tools. All checks pass.`);
