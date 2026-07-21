#!/usr/bin/env node
/**
 * tag-arcanea-guardian.mjs — DEPRECATED shim.
 *
 * The Guardian-specific tagger became the generic profile-pack engine:
 * tools/tag-vibe-profile.mjs (same scoring math, pack-driven). The Arcanea
 * roster this tool used to read (data/arcanea-guardians.json) moved to
 * Frank's private FrankX repo as a profile pack, per docs/PACKAGING.md —
 * the engine is public, the brand is private.
 *
 * If you have an Arcanea-shaped pack locally, this forwards to the generic
 * engine; otherwise it prints migration instructions and exits non-zero.
 */

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const engine = join(HUB, "tools", "tag-vibe-profile.mjs");
const args = process.argv.slice(2);

const hasPack = args.some((a) => a === "--profile-pack" || a.startsWith("--profile-pack="));
const legacyRoster = join(HUB, "data", "arcanea-guardians.json");

if (hasPack) {
  process.exit(spawnSync(process.execPath, [engine, ...args], { stdio: "inherit" }).status ?? 1);
}
if (existsSync(legacyRoster)) {
  // Pre-migration checkout: keep old invocations working against the roster via the generic engine.
  console.error("[deprecated] tag-arcanea-guardian.mjs → use tools/tag-vibe-profile.mjs. Forwarding…");
  process.exit(
    spawnSync(process.execPath, [engine, "--profile-pack", legacyRoster, ...args], { stdio: "inherit" }).status ?? 1
  );
}

console.error("tag-arcanea-guardian.mjs is deprecated and the Arcanea roster is no longer in this repo.");
console.error("The engine is generic now:");
console.error("  node tools/tag-vibe-profile.mjs [--profile-pack <your-pack.json>] --title ... --bpm ... --mode ...");
console.error("Docs: docs/BRING-YOUR-OWN-PROFILE-PACK.md · why: docs/PACKAGING.md");
console.error("(Frank's Arcanea pack lives privately at FrankX/data/music/arcanea-profile-pack.json)");
process.exit(1);
