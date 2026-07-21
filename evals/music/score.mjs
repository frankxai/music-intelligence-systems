#!/usr/bin/env node
/**
 * score.mjs — zero-dependency eval scorer for evals/music/RUBRICS.md.
 *
 * Deterministic, no network, no LLM calls — same discipline as
 * tools/tag-arcanea-guardian.mjs and tools/validate-registry.mjs. Scores a JSON
 * candidate descriptor against one of four rubrics:
 *
 *   canon-fit       — 0-100, track fit vs. its claimed Guardian (reuses the
 *                      frequency/mode/tempo/vocal-posture math from
 *                      tools/tag-arcanea-guardian.mjs, scored against one named
 *                      Guardian instead of ranking all ten)
 *   mastering-pass  — LUFS-integrated gate vs. a target window (default
 *                      [-18, -16], the Arcanea sync-grade target)
 *   brand-gate      — cover checklist pass/fail (palette / typography / banned
 *                      style / Godbeast)
 *   model-ab        — NOT scored deterministically. Prints a comparison
 *                      template (cost / quality / brand-fit / notes) for a
 *                      human or LLM judge to fill in. See RUBRICS.md (d) for
 *                      why this one can't be a number.
 *
 * Usage:
 *   node evals/music/score.mjs canon-fit --profile glasshouse --frequencyHz 880 --bpm 86 --mode lydian --vocalPosture "clear crystalline weightless"
 *   node evals/music/score.mjs canon-fit '{"profile":"glasshouse","frequencyHz":880,"bpm":86,"mode":"lydian"}'
 *   node evals/music/score.mjs canon-fit --profile-pack path/to/pack.json --profile <id> ...
 *   (--guardian remains a back-compat alias for --profile; default pack is the shipped example)
 *   node evals/music/score.mjs mastering-pass --lufsIntegrated -17
 *   node evals/music/score.mjs mastering-pass --lufsIntegrated -17 --low -18 --high -16
 *   node evals/music/score.mjs brand-gate --paletteMatch true --typographyLock true --bannedStyleClean true --godbeastPresent n/a
 *   node evals/music/score.mjs model-ab --asset cover --engines nb-generate-nb2,higgsfield-soul
 *   node evals/music/score.mjs model-ab --asset video
 *
 * Add --json to any rubric to print machine-readable output instead of the
 * human-readable report.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const HUB = resolve(HERE, "..", "..");
const readHub = (p) => JSON.parse(readFileSync(join(HUB, p), "utf8"));

const RUBRICS = new Set(["canon-fit", "mastering-pass", "brand-gate", "model-ab"]);

// ---------------------------------------------------------------------------
// arg parsing (mirrors tools/tag-arcanea-guardian.mjs: --key value pairs, or a
// single JSON blob argument)
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { _json: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") {
      out._json = true;
      continue;
    }
    rest.push(a);
  }
  if (rest.length === 0) return out;
  const joined = rest.join(" ").trim();
  if (joined.startsWith("{")) {
    try {
      Object.assign(out, JSON.parse(joined));
      return out;
    } catch (e) {
      console.error(`Failed to parse JSON argument: ${e.message}`);
      process.exit(1);
    }
  }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    let key, value;
    if (eq !== -1) {
      key = a.slice(2, eq);
      value = a.slice(eq + 1);
    } else {
      key = a.slice(2);
      value = rest[i + 1] !== undefined && !rest[i + 1].startsWith("--") ? rest[++i] : "true";
    }
    out[key] = value;
  }
  for (const numKey of ["frequencyHz", "bpm", "lufsIntegrated", "low", "high"]) {
    if (out[numKey] !== undefined) out[numKey] = Number(out[numKey]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// (a) canon-fit — same scoring math as tools/tag-arcanea-guardian.mjs,
//     applied to one named Guardian instead of ranking all ten.
// ---------------------------------------------------------------------------

function freqScore(trackHz, guardianHz) {
  if (trackHz == null || Number.isNaN(trackHz)) return { score: 0, reason: null };
  const diff = Math.abs(trackHz - guardianHz);
  const TOLERANCE = 5;
  const MAX_DIFF = 200;
  if (diff <= TOLERANCE) {
    return { score: 50, reason: `frequency ${trackHz}Hz matches ${guardianHz}Hz (diff ${diff}Hz)` };
  }
  if (diff >= MAX_DIFF) return { score: 0, reason: `frequency ${trackHz}Hz is ${diff}Hz from ${guardianHz}Hz — beyond the ${MAX_DIFF}Hz falloff window` };
  const score = Math.round(48 * (1 - (diff - TOLERANCE) / (MAX_DIFF - TOLERANCE)));
  return { score, reason: `frequency ${trackHz}Hz is ${diff}Hz from ${guardianHz}Hz` };
}

function modeScore(trackMode, guardian) {
  if (!trackMode) return { score: 0, reason: null };
  const tm = String(trackMode).toLowerCase();
  const prefs = guardian.modePreference.map((m) => m.toLowerCase());
  const matched = prefs.some((p) => p === tm || p.includes(tm) || tm.includes(p));
  if (!matched) return { score: 0, reason: `mode "${trackMode}" does not match ${guardian.name}'s preference (${guardian.modePreference.join("/")})` };
  if (prefs.includes("all modes / modulating")) {
    return { score: 20, reason: `${guardian.name} works in all modes (cosmic/modulating) — "${trackMode}" fits` };
  }
  if (prefs.includes("modal mixture")) {
    return { score: 22, reason: `${guardian.name} synthesizes modal mixture — "${trackMode}" fits` };
  }
  return { score: 30, reason: `mode match: ${guardian.name} prefers ${guardian.modePreference.join("/")}` };
}

function tempoScore(trackBpm, guardian) {
  if (trackBpm == null || Number.isNaN(trackBpm) || !guardian.tempoBandBpm) {
    return { score: 0, reason: guardian.tempoBandBpm ? null : `${guardian.name} has no stated tempo band in canon — this axis always scores 0` };
  }
  const [lo, hi] = guardian.tempoBandBpm;
  if (trackBpm >= lo && trackBpm <= hi) {
    return { score: 15, reason: `${trackBpm} BPM sits inside ${guardian.name}'s ${lo}-${hi} BPM band` };
  }
  const dist = trackBpm < lo ? lo - trackBpm : trackBpm - hi;
  if (dist <= 15) {
    return { score: Math.round(15 * (1 - dist / 15)), reason: `${trackBpm} BPM is ${dist} BPM outside ${guardian.name}'s ${lo}-${hi} band` };
  }
  return { score: 0, reason: `${trackBpm} BPM is ${dist} BPM outside ${guardian.name}'s ${lo}-${hi} band` };
}

function vocalScore(trackVocal, guardian) {
  if (!trackVocal) return { score: 0, reason: null };
  const tokens = String(trackVocal).toLowerCase().match(/[a-z]+/g) || [];
  const voiceTokens = guardian.voiceTone.toLowerCase().match(/[a-z]+/g) || [];
  const overlap = tokens.filter((t) => voiceTokens.includes(t));
  if (!overlap.length) return { score: 0, reason: `no overlap between vocal posture and ${guardian.name}'s voice/tone ("${guardian.voiceTone}")` };
  return { score: Math.min(5, overlap.length * 3), reason: `vocal posture echoes voice/tone: ${overlap.join(", ")}` };
}

function bandFor(total) {
  if (total >= 65) return "on-canon";
  if (total >= 40) return "marginal";
  return "off-canon";
}

function scoreCanonFit(input) {
  // --profile is the generic name; --guardian kept as a back-compat alias.
  const claimed = input.profile ?? input.guardian;
  if (!claimed) {
    console.error("canon-fit requires --profile <id> (or \"profile\" in the JSON blob)");
    process.exit(1);
  }
  const packPath = input.profilePack ?? input["profile-pack"] ?? "profile-packs/example-profile-pack.json";
  let pack;
  try {
    pack = JSON.parse(readFileSync(resolve(process.cwd(), packPath), "utf8"));
  } catch {
    pack = readHub(packPath);
  }
  const guardians = pack.profiles ?? pack.guardians;
  const guardian = guardians.find((g) => g.id === String(claimed).toLowerCase());
  if (!guardian) {
    console.error(`Unknown profile '${claimed}' in ${packPath}. Known ids: ${guardians.map((g) => g.id).join(", ")}`);
    process.exit(1);
  }

  const freq = freqScore(input.frequencyHz, guardian.frequencyHz);
  const mode = modeScore(input.mode, guardian);
  const tempo = tempoScore(input.bpm, guardian);
  const vocal = vocalScore(input.vocalPosture, guardian);
  const total = freq.score + mode.score + tempo.score + vocal.score;
  const band = bandFor(total);

  return {
    rubric: "canon-fit",
    guardian: guardian.id,
    total,
    band,
    breakdown: {
      frequency: freq,
      mode,
      tempo,
      vocalPosture: vocal,
    },
  };
}

// ---------------------------------------------------------------------------
// (b) mastering-pass
// ---------------------------------------------------------------------------

function scoreMasteringPass(input) {
  if (input.lufsIntegrated == null || Number.isNaN(input.lufsIntegrated)) {
    console.error("mastering-pass requires --lufsIntegrated <number>");
    process.exit(1);
  }
  const low = input.low != null && !Number.isNaN(input.low) ? input.low : -18;
  const high = input.high != null && !Number.isNaN(input.high) ? input.high : -16;
  const lufs = input.lufsIntegrated;

  let verdict;
  let reason;
  if (lufs >= low && lufs <= high) {
    verdict = "pass";
    reason = `${lufs} LUFS is inside the [${low}, ${high}] sync-grade window`;
  } else {
    const dist = lufs < low ? low - lufs : lufs - high;
    if (dist <= 1) {
      verdict = "warn";
      reason = `${lufs} LUFS is ${dist.toFixed(1)} LU outside the [${low}, ${high}] window`;
    } else {
      verdict = "fail";
      reason = `${lufs} LUFS is ${dist.toFixed(1)} LU outside the [${low}, ${high}] window`;
    }
  }

  return {
    rubric: "mastering-pass",
    verdict,
    lufsIntegrated: lufs,
    window: [low, high],
    reason,
  };
}

// ---------------------------------------------------------------------------
// (c) brand-gate
// ---------------------------------------------------------------------------

const BRAND_GATE_CHECKS = ["paletteMatch", "typographyLock", "bannedStyleClean", "godbeastPresent"];

function toTriState(v) {
  if (v === undefined) return undefined;
  if (v === "n/a" || v === "na") return "n/a";
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return v;
}

function scoreBrandGate(input) {
  const results = {};
  const failed = [];
  for (const check of BRAND_GATE_CHECKS) {
    const v = toTriState(input[check]);
    if (v === undefined) {
      results[check] = "not provided";
      failed.push(`${check} (not provided — treated as failing; provide true/false/n-a)`);
    } else if (v === false) {
      results[check] = false;
      failed.push(check);
    } else {
      results[check] = v; // true or "n/a" — both pass this check
    }
  }
  const verdict = failed.length === 0 ? "pass" : "fail";
  return {
    rubric: "brand-gate",
    verdict,
    checks: results,
    failedChecks: failed,
  };
}

// ---------------------------------------------------------------------------
// (d) model-ab — template only, not a deterministic score
// ---------------------------------------------------------------------------

const KNOWN_ENGINE_COST = {
  "nb-generate-nb2": "compute only (≈ free) — native default",
  "nb2": "compute only (≈ free) — native default",
  "remotion": "compute only (≈ free) — native default",
  "ffmpeg": "compute only (≈ free) — native default",
  "higgsfield-soul": "credits per generation (metered) — frontier",
  "higgsfield-kling": "credits per generation (metered) — frontier",
  "higgsfield-veo": "credits per generation (metered) — frontier",
  "higgsfield-hailuo": "credits per generation (metered) — frontier",
};

const DEFAULT_ENGINES = {
  cover: ["nb-generate-nb2", "higgsfield-soul"],
  video: ["remotion", "higgsfield-kling"],
};

function printModelAB(input) {
  const asset = input.asset || "cover";
  const engines = input.engines
    ? String(input.engines).split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ENGINES[asset] || ["engine-a", "engine-b"];

  console.log(`Model A/B comparison template — asset: ${asset}`);
  console.log("Per RUBRICS.md (d): NOT a deterministic score. Fill Quality/Brand-fit/Notes after");
  console.log("generating the actual candidates on each engine and judging them (human or LLM).");
  console.log("");
  console.log("| Engine | Cost | Quality (1-5) | Brand-fit (1-5) | Notes |");
  console.log("|---|---|---|---|---|");
  for (const engine of engines) {
    const cost = KNOWN_ENGINE_COST[engine.toLowerCase()] || "(unknown — not in MEDIA-TOOLING-DOCTRINE.md; fill in)";
    console.log(`| ${engine} | ${cost} | TBD — human/LLM judge | TBD — human/LLM judge | |`);
  }
  console.log("");
  console.log("Judge quality/brand-fit against evals/music/RUBRICS.md (a) canon-fit for audio");
  console.log("candidates, or (c) brand-gate for visual candidates.");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function usageAndExit() {
  console.error("Usage: node evals/music/score.mjs <rubric> [--flags | '{json}'] [--json]");
  console.error(`Rubrics: ${[...RUBRICS].join(", ")}`);
  process.exit(1);
}

const [rubric, ...argRest] = process.argv.slice(2);
if (!rubric || !RUBRICS.has(rubric)) usageAndExit();

const input = parseArgs(argRest);

if (rubric === "model-ab") {
  printModelAB(input);
  process.exit(0);
}

let result;
if (rubric === "canon-fit") result = scoreCanonFit(input);
else if (rubric === "mastering-pass") result = scoreMasteringPass(input);
else if (rubric === "brand-gate") result = scoreBrandGate(input);

if (input._json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// human-readable report
console.log(`Rubric: ${result.rubric}`);
if (result.rubric === "canon-fit") {
  console.log(`Guardian: ${result.guardian}`);
  console.log(`Total: ${result.total} / 100  —  band: ${result.band}`);
  console.log("");
  console.log("Breakdown:");
  for (const [axis, b] of Object.entries(result.breakdown)) {
    console.log(`  ${axis}: ${b.score}${b.reason ? `  — ${b.reason}` : ""}`);
  }
} else if (result.rubric === "mastering-pass") {
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Measured: ${result.lufsIntegrated} LUFS integrated`);
  console.log(`Window: [${result.window[0]}, ${result.window[1]}]`);
  console.log(`Reason: ${result.reason}`);
} else if (result.rubric === "brand-gate") {
  console.log(`Verdict: ${result.verdict}`);
  console.log("Checks:");
  for (const [check, v] of Object.entries(result.checks)) {
    console.log(`  ${check}: ${v}`);
  }
  if (result.failedChecks.length) {
    console.log(`Failed: ${result.failedChecks.join("; ")}`);
  }
}
