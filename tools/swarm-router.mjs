#!/usr/bin/env node
/**
 * swarm-router.mjs — deterministic keyword-overlap router over registry/agents.json
 * and registry/tools.json.
 *
 * No dependencies, no network, no LLM calls. Scores every agent and tool by
 * overlap between the query's tokens and each entry's name/id/tier/kind/summary
 * (plus a tool's `provides` list), then prints the top 3 with repo + canonical
 * source so a human or another agent knows exactly where to go next.
 *
 * Usage:
 *   node tools/swarm-router.mjs "write a suno prompt for a lofi track"
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(HUB, p), "utf8"));

const STOPWORDS = new Set([
  "a", "an", "the", "for", "to", "of", "in", "on", "with", "and", "or",
  "me", "my", "i", "is", "are", "it", "please", "some", "that", "this",
  "be", "can", "you", "your", "need", "want", "help", "make", "write",
  "give", "create", "do", "does", "how", "what", "should", "into", "from",
]);

function tokenize(str) {
  return (str || "").toLowerCase().match(/[a-z0-9]+/g) || [];
}

function uniqueTokens(str) {
  return [...new Set(tokenize(str).filter((t) => !STOPWORDS.has(t)))];
}

/** Build a token -> weight map for one registry entry. Higher weight = stronger signal. */
function buildHaystack(fields) {
  const map = new Map();
  for (const { text, weight } of fields) {
    for (const tok of tokenize(text)) {
      map.set(tok, Math.max(map.get(tok) ?? 0, weight));
    }
  }
  return map;
}

function scoreQuery(queryTokens, haystack) {
  let score = 0;
  for (const tok of queryTokens) score += haystack.get(tok) ?? 0;
  return score;
}

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error('Usage: node tools/swarm-router.mjs "<natural language ask>"');
  process.exit(1);
}

const agentsRegistry = read("registry/agents.json");
const toolsRegistry = read("registry/tools.json");
const queryTokens = uniqueTokens(query);

const candidates = [];

for (const a of agentsRegistry.agents) {
  const haystack = buildHaystack([
    { text: a.name, weight: 3 },
    { text: a.id, weight: 3 },
    { text: a.tier, weight: 1 },
    { text: a.repo, weight: 1 },
    { text: a.summary, weight: 1 },
  ]);
  candidates.push({
    type: "agent",
    id: a.id,
    name: a.name,
    repo: a.repo,
    location: a.canonical_source,
    summary: a.summary,
    portable: a.portable,
    score: scoreQuery(queryTokens, haystack),
  });
}

for (const t of toolsRegistry.tools) {
  const haystack = buildHaystack([
    { text: t.id, weight: 3 },
    { text: t.kind, weight: 1 },
    { text: t.repo, weight: 1 },
    { text: (t.provides || []).join(" "), weight: 2 },
    { text: t.path, weight: 1 },
  ]);
  candidates.push({
    type: "tool",
    id: t.id,
    name: t.id,
    repo: t.repo,
    location: t.path,
    summary: (t.provides || []).join(", "),
    status: t.status,
    score: scoreQuery(queryTokens, haystack),
  });
}

candidates.sort((a, b) => b.score - a.score);
const top = candidates.filter((c) => c.score > 0).slice(0, 3);

console.log(`Query: "${query}"`);
console.log(`Tokens: ${queryTokens.join(", ") || "(none after stopword removal)"}`);
console.log("");

if (!top.length) {
  console.log("No keyword overlap found. Try different terms, or browse registry/agents.json and registry/tools.json directly.");
  process.exit(0);
}

top.forEach((c, i) => {
  console.log(`${i + 1}. [${c.type}] ${c.name}  (score: ${c.score})`);
  console.log(`   repo: ${c.repo}`);
  console.log(`   ${c.type === "agent" ? "canonical_source" : "path"}: ${c.location}`);
  if (c.type === "agent" && c.portable === false) console.log("   note: portable=false — repo-internal, won't run standalone");
  if (c.type === "tool" && c.status && c.status !== "shipped") console.log(`   note: status=${c.status} — not yet fully shipped`);
  console.log(`   ${c.summary}`);
  console.log("");
});
