#!/usr/bin/env node
/**
 * album-builder.mjs — validates an album manifest against schemas/album.schema.json
 * (hand-rolled checks, same approach as validate-registry.mjs — not a full JSON
 * Schema validator, but enforces the contracts that matter) and emits a
 * formatted tracklist + release-manifest summary.
 *
 * Zero dependencies. Deterministic. No network, no LLM calls.
 *
 * Usage:
 *   node tools/album-builder.mjs albums/arcanea-vol-1/album.json
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readHub = (p) => JSON.parse(readFileSync(join(HUB, p), "utf8"));

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error("Usage: node tools/album-builder.mjs <path-to-album.json>");
  process.exit(1);
}

let album;
try {
  album = JSON.parse(readFileSync(resolve(manifestPath), "utf8"));
} catch (e) {
  console.error(`Failed to read/parse ${manifestPath}: ${e.message}`);
  process.exit(1);
}

const errors = [];
const err = (msg) => errors.push(msg);

// Reconciled with schemas/album.schema.json (2026-07 contract note): candidate/selected/culled/
// mastered/released is the authoritative pipeline lifecycle from docs/engineering/2026-07-album-os.md
// §2; published/planned/draft/archived are kept for backward compatibility with existing manifests.
const TRACK_STATUS = new Set([
  "candidate", "selected", "culled", "mastered", "released",
  "published", "planned", "draft", "archived",
]);

// --- required top-level fields ---
for (const f of ["title", "label", "tracks", "sequence", "masteringTarget"]) {
  if (album[f] === undefined) err(`album: missing required field '${f}'`);
}

// --- tracks ---
if (album.tracks) {
  if (!Array.isArray(album.tracks) || album.tracks.length === 0) {
    err("album.tracks: must be a non-empty array");
  } else {
    album.tracks.forEach((t, i) => {
      const where = `tracks[${i}] (${t.title ?? "untitled"})`;
      if (!t.title) err(`${where}: missing title`);
      if (!t.status) err(`${where}: missing status`);
      else if (!TRACK_STATUS.has(t.status)) err(`${where}: bad status '${t.status}'`);
      if (t.bpm != null && (t.bpm < 30 || t.bpm > 220)) err(`${where}: bpm ${t.bpm} out of range [30,220]`);
      if (t.durationSec != null && t.durationSec < 0) err(`${where}: negative durationSec`);
    });
  }
}

// --- sequence must resolve to tracks ---
const trackKey = (t) => t.sunoId || t.title;
const trackByKey = new Map((album.tracks || []).map((t) => [trackKey(t), t]));
if (album.sequence) {
  if (!Array.isArray(album.sequence) || album.sequence.length === 0) {
    err("album.sequence: must be a non-empty array");
  } else {
    for (const ref of album.sequence) {
      if (!trackByKey.has(ref)) err(`album.sequence: '${ref}' does not resolve to any track (by sunoId or title)`);
    }
    if (album.tracks && album.sequence.length !== album.tracks.length) {
      err(`album.sequence: has ${album.sequence.length} entries but tracks has ${album.tracks.length} — every track should appear in sequence exactly once`);
    }
  }
}

// --- masteringTarget ---
if (album.masteringTarget) {
  const mt = album.masteringTarget;
  if (!Array.isArray(mt.lufsIntegrated) || mt.lufsIntegrated.length !== 2) {
    err("album.masteringTarget.lufsIntegrated: must be a [low, high] pair");
  }
}

// --- masteringProfile (optional; dispatches sync-score vs. streaming mastering-qc targets) ---
const MASTERING_PROFILE = new Set(["sync-score", "streaming"]);
if (album.masteringProfile !== undefined && !MASTERING_PROFILE.has(album.masteringProfile)) {
  err(`album.masteringProfile: bad value '${album.masteringProfile}' — must be one of ${[...MASTERING_PROFILE].join(", ")}`);
}

// --- optional cross-check: guardian ids against data/arcanea-guardians.json, if present ---
let guardiansById = new Map();
try {
  const { guardians } = readHub("data/arcanea-guardians.json");
  guardiansById = new Map(guardians.map((g) => [g.id, g]));
} catch {
  // data file not required for a generic album — skip cross-check silently
}
if (guardiansById.size && album.tracks) {
  album.tracks.forEach((t, i) => {
    if (t.guardian && !guardiansById.has(t.guardian)) {
      err(`tracks[${i}] (${t.title}): guardian '${t.guardian}' not found in data/arcanea-guardians.json`);
    }
  });
}

if (errors.length) {
  console.error(`FAIL — ${errors.length} problem(s) validating ${manifestPath}:`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

// --- emit tracklist + release-manifest summary ---
const fmtDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

console.log(`${album.title}`);
console.log(`Label: ${album.label}${album.guardianTheme ? `  ·  Guardian theme: ${album.guardianTheme}` : ""}`);
console.log("=".repeat(60));
console.log("");
console.log("TRACKLIST");
console.log("-".repeat(60));

let totalSec = 0;
let allHaveDuration = true;

album.sequence.forEach((ref, i) => {
  const t = trackByKey.get(ref);
  const guardian = t.guardian ? guardiansById.get(t.guardian) : null;
  const guardianLabel = guardian ? `${guardian.name} (${guardian.frequencyHz} Hz)` : t.guardian || "—";
  const freq = t.frequencyHz != null ? `${t.frequencyHz} Hz` : (guardian ? `${guardian.frequencyHz} Hz` : "—");
  const dur = t.durationSec != null ? fmtDuration(t.durationSec) : "—";
  if (t.durationSec != null) totalSec += t.durationSec;
  else allHaveDuration = false;

  console.log(`${String(i + 1).padStart(2, "0")}. ${t.title}  [${t.status}]`);
  console.log(`    Guardian: ${guardianLabel}   Frequency: ${freq}   Duration: ${dur}`);
});

console.log("");
console.log("RELEASE MANIFEST SUMMARY");
console.log("-".repeat(60));
console.log(`Tracks: ${album.tracks.length}`);
console.log(`Total runtime: ${allHaveDuration ? fmtDuration(totalSec) : `${fmtDuration(totalSec)} (partial — not all tracks have durationSec)`}`);
if (album.releaseTargets?.length) console.log(`Release targets: ${album.releaseTargets.join(", ")}`);
console.log(`Mastering target: ${album.masteringTarget.lufsIntegrated[0]} to ${album.masteringTarget.lufsIntegrated[1]} LUFS integrated${album.masteringTarget.notes ? ` — ${album.masteringTarget.notes}` : ""}`);
console.log("");
console.log(`OK — ${manifestPath} is valid.`);
