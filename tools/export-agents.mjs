#!/usr/bin/env node
/**
 * export-agents.mjs — the portability engine.
 *
 * Reads registry/agents.json, loads each portable agent's canonical_source
 * (side-by-side clone layout: all ecosystem repos under one parent directory),
 * strips repo-internal mechanics, and emits four portable formats:
 *
 *   exports/claude-projects/<id>/instructions.md
 *   exports/custom-gpts/<id>/gpt-config.md        (instructions <= 8000 chars)
 *   exports/gemini-gems/<id>/gem-instructions.md
 *   exports/system-prompts/<id>.md                (provider-agnostic)
 *
 * Zero dependencies. Deterministic. Generated exports are committed so
 * consumers never need to run this.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PARENT = resolve(HUB, "..");
const VERSION = "1.0.0";
const GPT_INSTRUCTIONS_CEILING = 8000;
const GPT_DESCRIPTION_CEILING = 300;

// Section-name handling. Order = priority for the Custom GPT ceiling
// (higher keeps; lowest dropped first when over 8000 chars).
const SECTION_PRIORITY = [
  "role", "purpose", "process", "expertise", "core knowledge", "outputs",
  "output style", "boundaries", "anti-patterns", "voice", "voice check",
  "triggers", "inputs",
];
const DROP_SECTIONS = new Set([
  "smoke eval", "integration", "model choice", "memory", "session logging",
]);
const RENAME_SECTIONS = { triggers: "When to use", inputs: "What to provide" };

// Conversation starters per agent (fallbacks below).
const STARTERS = {
  "lyric-writer": [
    "Write a chorus about leaving a small town — country, hopeful, not cheesy.",
    "Critique these lyrics and tell me which lines to cut.",
    "Format this lyric for Suno with section tags and suggest a style prompt.",
    "My verse 2 just repeats verse 1. Help me advance the story.",
  ],
  "film-sync-composer": [
    "Decode this music brief and turn it into a cue spec.",
    "Make my track sync-ready — what's missing from the package?",
    "Design a cue for a 90-second chase scene with dialogue over the middle third.",
    "Turn this temp track reference into an original direction (without copying it).",
  ],
  "music-theory-teacher": [
    "I make beats by ear. Teach me what I'm already doing.",
    "Why does this chord progression feel so good? (I'll paste the chords.)",
    "Explain major vs minor with an experiment I can run in Suno.",
    "Give me a 5-minute exercise on syncopation.",
  ],
  "orchestration-architect": [
    "Turn this piano sketch into a string quartet arrangement plan.",
    "Why does my AI-generated 'orchestral' track sound fake, and what's the prompt fix?",
    "Voice this chord for brass so the melody carries.",
    "Plan the dynamic arc for a 3-minute trailer cue.",
  ],
  "music-producer": [
    "Produce a track for my podcast intro — walk me through your flow.",
    "What should I make next, based on what's working in ambient?",
    "Take this idea from genre pick to release-ready checklist.",
    "QC thinking: what makes a Suno track feel professionally finished?",
  ],
  "music-suno-prompt-architect": [
    "Write 3 Suno prompt variants for a lo-fi focus track.",
    "Here's my track idea — give me anchor, paraphrase, and contrarian prompts.",
    "Stack style tags for cinematic synthwave under 200 characters.",
    "Fix this Suno prompt — it keeps generating generic results.",
  ],
  "music-suno-mastery": [
    "Give me a production brief for a deep house track.",
    "What are the genre conventions I should respect for jazz fusion?",
    "Brief me on making an 8-minute progressive ambient piece in Suno.",
    "Which Suno v4.5 mode fits: I have vocals and need instrumentation?",
  ],
  "music-mastering-qc": [
    "My track is at -9 LUFS. Walk me through what to fix for streaming.",
    "Explain true peak vs sample peak like I'm a producer, not an engineer.",
    "Build me a pre-release QC checklist for AI-generated tracks.",
    "What does DR 8 mean and when is it too squashed?",
  ],
  "music-licensing": [
    "I want to use my AI track in a client's ad — what license questions matter?",
    "Compare licensing implications: YouTube background music vs paid sync.",
    "What metadata does a licensing-ready track need?",
    "Explain one-stop clearance in plain language.",
  ],
  "vibe-os-master": [
    "I need deep focus for 2 hours — design my session.",
    "Take me from anxious to calm with the ISO principle.",
    "What BPM, key, and instruments support a morning energy state?",
    "Pair a frequency layer with a meditation track — what does the evidence say?",
  ],
};
const FALLBACK_STARTERS = (name) => [
  `What can you do as ${name}?`,
  "Walk me through your process on a small example.",
  "Here's my situation — tell me what you need from me.",
  "What do people usually get wrong in your domain?",
];

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { meta, body: raw.slice(m[0].length) };
}

function splitSections(body) {
  // Split on H2 headings; content before the first H2 (incl. H1 title) is preamble.
  const lines = body.split("\n");
  const sections = [];
  let current = { name: "_preamble", lines: [] };
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      sections.push(current);
      current = { name: h2[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

/** Strip ACOS/repo-internal framing from a description string (identity line). */
function cleanDescription(text) {
  if (!text) return text;
  text = text.replace(/\s*Auto-invokes when\s[^.]+\./g, "");
  text = text.replace(/\s*Pillar\s+\d+[^.]*slot\s+\d+[^.]*\./g, "");
  text = text.replace(/\s*The [^.]*@aco-router[^.]*\./g, "");
  return text.replace(/\s{2,}/g, " ").replace(/\.\./g, ".").trim();
}

/** Remove repo-internal mechanics from a section's text. */
function portabilityTransform(text) {
  // Drop fenced code blocks that reference repo-internal tooling/paths.
  text = text.replace(/```[a-z]*\n[\s\S]*?```/g, (block) =>
    /node lib\/|memory\.mjs|\.claude\/|Agent\(subagent_type|claude mcp add|content\/music\/|data\/music-/.test(block) ? "" : block
  );
  const INTERNAL = /node lib\/acos|memory\.mjs|ReasoningBank|subagent_type|@music-[a-z-]+`?'?s? |\.claude\/|when Frank |\bFrank\b[ ']|Pillar \d+ \(Music|data\/music-catalog|CLAUDE\.md|@aco-router|@music-catalog-indexer|Arcanean mythology/;
  const lines = text.split("\n").filter((l) => !INTERNAL.test(l));
  // Collapse 3+ blank lines.
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildCore(agent, meta, sections) {
  // Order sections: priority list first (in priority order), then the rest in
  // original order, dropping repo-internal ones.
  const kept = sections.filter(
    (s) => s.name !== "_preamble" && !DROP_SECTIONS.has(s.name.toLowerCase())
  );
  const rank = (s) => {
    const i = SECTION_PRIORITY.indexOf(s.name.toLowerCase());
    return i === -1 ? SECTION_PRIORITY.length : i;
  };
  kept.sort((a, b) => rank(a) - rank(b));
  const parts = [];
  for (const s of kept) {
    const text = portabilityTransform(s.lines.join("\n"));
    if (!text) continue;
    const display = RENAME_SECTIONS[s.name.toLowerCase()] ?? s.name;
    parts.push({ name: display, text });
  }
  return parts;
}

function footer(agent) {
  return [
    "---",
    "Built from the FrankX Music Intelligence System",
    `- Source: ${agent.canonical_source}`,
    `- Hub: https://github.com/frankxai/music-intelligence-systems`,
    `- Generated: ${TODAY} by export-agents.mjs ${VERSION}`,
  ].join("\n");
}

const TODAY = new Date().toISOString().slice(0, 10);

function renderSections(parts) {
  return parts.map((p) => `## ${p.name}\n\n${p.text}`).join("\n\n");
}

function identityLine(agent, meta) {
  // Prefer registry summary (clean) over frontmatter description (may have ACOS trigger language).
  const raw = agent.summary || meta.description || "";
  return `You are **${agent.name}** — ${cleanDescription(raw)}`;
}

function emitClaudeProject(agent, meta, parts) {
  return [
    `# ${agent.name} — Claude Project Instructions`,
    "",
    identityLine(agent, meta),
    "",
    renderSections(parts),
    "",
    "## Project knowledge to upload (optional, improves grounding)",
    "",
    "- Your own lyrics / tracks / briefs / scores relevant to the work",
    "- The vibe-os research docs (github.com/frankxai/vibe-os/tree/main/docs) if state-change music matters to you",
    "- Your catalog or release metadata if the work touches licensing/release",
    "",
    footer(agent),
  ].join("\n");
}

function emitCustomGPT(agent, meta, parts) {
  const description = (meta.description || agent.summary).slice(0, GPT_DESCRIPTION_CEILING);
  // Fit instructions under the ceiling by dropping lowest-priority sections.
  const truncated = [];
  let working = [...parts];
  const render = () => [identityLine(agent, meta), "", renderSections(working)].join("\n");
  while (render().length > GPT_INSTRUCTIONS_CEILING && working.length > 1) {
    const dropped = working.pop(); // parts are priority-ordered; pop = lowest
    truncated.push(dropped.name);
  }
  let instructions = render();
  if (instructions.length > GPT_INSTRUCTIONS_CEILING) {
    instructions = instructions.slice(0, GPT_INSTRUCTIONS_CEILING - 1) + "…";
    truncated.push("(hard-truncated)");
  }
  const starters = STARTERS[agent.id] ?? FALLBACK_STARTERS(agent.name);
  const doc = [
    `# ${agent.name} — Custom GPT Configuration`,
    "",
    `**Name:** ${agent.name}`,
    "",
    `**Description (≤300 chars):** ${description}`,
    "",
    "**Capabilities:** Web browsing ON · Code interpreter OFF · Image generation OFF",
    "",
    "**Conversation starters:**",
    ...starters.map((s) => `- ${s}`),
    "",
    `**Instructions (paste into the Instructions field — ${instructions.length} chars, ceiling 8000):**`,
    "",
    "```",
    instructions,
    "```",
    "",
    footer(agent),
  ].join("\n");
  return { doc, chars: instructions.length, truncated };
}

function emitGeminiGem(agent, meta, parts) {
  // Gemini Gems respond well to persona / task / context / format framing.
  const find = (...names) => parts.filter((p) => names.includes(p.name.toLowerCase()));
  const persona = find("role", "purpose", "expertise", "core knowledge");
  const task = find("process", "when to use", "what to provide");
  const format = find("outputs", "output style", "voice", "voice check");
  const guard = find("boundaries", "anti-patterns");
  const rest = parts.filter((p) => ![...persona, ...task, ...format, ...guard].includes(p));
  const block = (title, items) =>
    items.length ? `## ${title}\n\n${items.map((p) => p.text).join("\n\n")}` : "";
  return [
    `# ${agent.name} — Gemini Gem Instructions`,
    "",
    "Paste everything below this line into the Gem's instructions field.",
    "",
    "---",
    "",
    identityLine(agent, meta),
    "",
    block("Persona", persona),
    block("Task", task),
    block("Format", format),
    block("Guardrails", guard),
    rest.length ? renderSections(rest) : "",
    "",
    footer(agent),
  ].filter(Boolean).join("\n");
}

function emitSystemPrompt(agent, meta, parts) {
  return [
    `# ${agent.name} — System Prompt (provider-agnostic)`,
    "",
    "Works as a system/developer message in any LLM: Grok, Copilot, local models,",
    "OpenAI/Anthropic/Google APIs, or coding-agent persona files.",
    "",
    "---",
    "",
    identityLine(agent, meta),
    "",
    renderSections(parts),
    "",
    footer(agent),
  ].join("\n");
}

// ---------------------------------------------------------------------------

const registry = JSON.parse(readFileSync(join(HUB, "registry/agents.json"), "utf8"));
const manifest = {
  generated: new Date().toISOString(),
  generator: `export-agents.mjs ${VERSION}`,
  targets: ["claude-projects", "custom-gpts", "gemini-gems", "system-prompts"],
  agents: [],
};

let exported = 0, skipped = 0, missing = 0;
for (const agent of registry.agents) {
  if (!agent.portable) { skipped++; continue; }
  const srcPath = join(PARENT, agent.canonical_source);
  const entry = { id: agent.id, canonical_source: agent.canonical_source, source_found: existsSync(srcPath), outputs: [] };
  if (!entry.source_found) {
    console.warn(`MISSING source for ${agent.id}: ${srcPath}`);
    manifest.agents.push(entry);
    missing++;
    continue;
  }
  const raw = readFileSync(srcPath, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const parts = buildCore(agent, meta, splitSections(body));

  const out = (rel, content) => {
    const p = join(HUB, "exports", rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content + "\n");
    entry.outputs.push(`exports/${rel}`);
  };

  out(`claude-projects/${agent.id}/instructions.md`, emitClaudeProject(agent, meta, parts));
  const gpt = emitCustomGPT(agent, meta, parts);
  out(`custom-gpts/${agent.id}/gpt-config.md`, gpt.doc);
  entry.gpt_instructions_chars = gpt.chars;
  entry.truncated_sections = gpt.truncated;
  out(`gemini-gems/${agent.id}/gem-instructions.md`, emitGeminiGem(agent, meta, parts));
  out(`system-prompts/${agent.id}.md`, emitSystemPrompt(agent, meta, parts));

  manifest.agents.push(entry);
  exported++;
  console.log(`exported ${agent.id} (gpt: ${gpt.chars} chars${gpt.truncated.length ? `, dropped: ${gpt.truncated.join(", ")}` : ""})`);
}

writeFileSync(join(HUB, "exports/manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${exported} exported, ${skipped} non-portable skipped, ${missing} sources missing.`);
if (missing > 0) process.exitCode = 1;
