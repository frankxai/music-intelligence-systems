#!/usr/bin/env node
/**
 * validate-registry.mjs — zero-dependency consistency checks for registry/*.json.
 *
 * Not a full JSON Schema validator; enforces the contracts that matter:
 * required fields, enums, unique ids, cross-references (agent.repo and
 * skill.repo must exist in repos.json), and canonical_source shape.
 */

import { readFileSync } from "node:fs";
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

if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`OK — ${repos.repos.length} repos, ${agents.agents.length} agents, ${skills.skills.length} skills, ${tools.tools.length} tools. All checks pass.`);
