#!/usr/bin/env node
/**
 * tag-vibe-profile.mjs — deterministic profile-matching for any label or producer.
 *
 * Scores a track descriptor against a profile pack (schemas/profile-pack.schema.json)
 * on three signals:
 *
 *   - frequency proximity  (track frequencyHz vs. profile's canonical anchor Hz)
 *   - mode match            (track mode vs. profile's modePreference)
 *   - tempo-band fit        (track bpm vs. profile's tempoBandBpm, where stated)
 *
 * A small vocal-posture keyword-overlap signal is added if provided. `key` is
 * accepted but not scored — packs tie profiles to modes, not specific keys.
 *
 * The engine is generic; the pack is where a brand's taste lives. This repo ships
 * profile-packs/example-profile-pack.json so the tool runs with zero private data.
 * A real label points --profile-pack at its own pack (see
 * docs/BRING-YOUR-OWN-PROFILE-PACK.md).
 *
 * No network, no LLM calls. Missing fields simply contribute zero — the track
 * is scored on whatever's provided.
 *
 * Usage:
 *   node tools/tag-vibe-profile.mjs --title "Track" --bpm 86 --mode lydian --frequencyHz 880
 *   node tools/tag-vibe-profile.mjs --profile-pack path/to/pack.json --bpm 140 --mode phrygian
 *   node tools/tag-vibe-profile.mjs '{"title":"Track","bpm":86,"mode":"lydian","frequencyHz":880}'
 *
 * Add --json to print machine-readable output instead of the human-readable report
 * (mirrors evals/music/score.mjs's --json flag). Shape:
 *   { input, pack: { name, version }, top3: [{ profile, frequencyHz, score, reasons[] }], matched }
 *
 * Per docs/engineering/2026-07-album-os.md §3.2 ("never force the nearest match"): if the
 * top score is below MATCH_FLOOR (no axis actually fired), no profile is proposed — top3 is
 * empty and matched is false, in both JSON and human output.
 */

import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PACK = "profile-packs/example-profile-pack.json";

// A score of 0 is exactly what every profile gets on zero signal (no bpm/mode/frequencyHz/
// vocalPosture provided) — any score >= 1 required at least one axis to actually fire.
const MATCH_FLOOR = 1;

function parseArgs(argv) {
  const out = { _json: false, _pack: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") {
      out._json = true;
      continue;
    }
    if (a === "--profile-pack" || a.startsWith("--profile-pack=")) {
      out._pack = a.includes("=") ? a.slice(a.indexOf("=") + 1) : argv[++i];
      continue;
    }
    rest.push(a);
  }
  if (rest.length === 0) return out._json || out._pack ? out : null;
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
  if (out.bpm !== undefined) out.bpm = Number(out.bpm);
  if (out.frequencyHz !== undefined) out.frequencyHz = Number(out.frequencyHz);
  return out;
}

function loadPack(packArg) {
  const rel = packArg || DEFAULT_PACK;
  const candidates = isAbsolute(rel) ? [rel] : [resolve(process.cwd(), rel), join(HUB, rel)];
  for (const p of candidates) {
    try {
      const pack = JSON.parse(readFileSync(p, "utf8"));
      // Legacy compat: pre-migration Arcanea rosters used "guardians" for the same shape.
      if (!Array.isArray(pack.profiles) && Array.isArray(pack.guardians)) pack.profiles = pack.guardians;
      if (!Array.isArray(pack.profiles) || pack.profiles.length === 0) {
        console.error(`Profile pack ${p} has no profiles[] — see schemas/profile-pack.schema.json`);
        process.exit(1);
      }
      return pack;
    } catch (e) {
      if (e.code !== "ENOENT") {
        console.error(`Failed to read profile pack ${p}: ${e.message}`);
        process.exit(1);
      }
    }
  }
  console.error(`Profile pack not found: ${rel} (tried cwd and repo root)`);
  process.exit(1);
}

function freqScore(trackHz, profileHz) {
  if (trackHz == null || Number.isNaN(trackHz) || profileHz == null) return { score: 0, reason: null };
  const diff = Math.abs(trackHz - profileHz);
  const TOLERANCE = 5;
  const MAX_DIFF = 200;
  if (diff <= TOLERANCE) {
    return { score: 50, reason: `frequency ${trackHz}Hz matches ${profileHz}Hz (diff ${diff}Hz)` };
  }
  if (diff >= MAX_DIFF) return { score: 0, reason: null };
  const score = Math.round(48 * (1 - (diff - TOLERANCE) / (MAX_DIFF - TOLERANCE)));
  return { score, reason: `frequency ${trackHz}Hz is ${diff}Hz from ${profileHz}Hz` };
}

function modeScore(trackMode, profile) {
  if (!trackMode || !Array.isArray(profile.modePreference) || !profile.modePreference.length)
    return { score: 0, reason: null };
  const tm = String(trackMode).toLowerCase();
  const prefs = profile.modePreference.map((m) => m.toLowerCase());
  const matched = prefs.some((p) => p === tm || p.includes(tm) || tm.includes(p));
  if (!matched) return { score: 0, reason: null };
  if (prefs.includes("all modes / modulating")) {
    return { score: 20, reason: `${profile.name} works in all modes (modulating) — "${trackMode}" fits` };
  }
  if (prefs.includes("modal mixture")) {
    return { score: 22, reason: `${profile.name} synthesizes modal mixture — "${trackMode}" fits` };
  }
  return { score: 30, reason: `mode match: ${profile.name} prefers ${profile.modePreference.join("/")}` };
}

function tempoScore(trackBpm, profile) {
  if (trackBpm == null || Number.isNaN(trackBpm) || !profile.tempoBandBpm) return { score: 0, reason: null };
  const [lo, hi] = profile.tempoBandBpm;
  if (trackBpm >= lo && trackBpm <= hi) {
    return { score: 15, reason: `${trackBpm} BPM sits inside ${profile.name}'s ${lo}-${hi} BPM band` };
  }
  const dist = trackBpm < lo ? lo - trackBpm : trackBpm - hi;
  if (dist <= 15) {
    return { score: Math.round(15 * (1 - dist / 15)), reason: `${trackBpm} BPM is ${dist} BPM outside ${profile.name}'s ${lo}-${hi} band` };
  }
  return { score: 0, reason: null };
}

function vocalScore(trackVocal, profile) {
  if (!trackVocal || !profile.voiceTone) return { score: 0, reason: null };
  const tokens = String(trackVocal).toLowerCase().match(/[a-z]+/g) || [];
  const voiceTokens = profile.voiceTone.toLowerCase().match(/[a-z]+/g) || [];
  const overlap = tokens.filter((t) => voiceTokens.includes(t));
  if (!overlap.length) return { score: 0, reason: null };
  return { score: Math.min(5, overlap.length * 3), reason: `vocal posture echoes voice/tone: ${overlap.join(", ")}` };
}

function scoreTrack(track, profile) {
  const freq = freqScore(track.frequencyHz, profile.frequencyHz);
  const mode = modeScore(track.mode, profile);
  const tempo = tempoScore(track.bpm, profile);
  const vocal = vocalScore(track.vocalPosture, profile);
  const total = freq.score + mode.score + tempo.score + vocal.score;
  const reasons = [freq.reason, mode.reason, tempo.reason, vocal.reason].filter(Boolean);
  return { profile, total, reasons };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed) {
    console.error('Usage: node tools/tag-vibe-profile.mjs [--profile-pack <path>] --title "Track" [--bpm N] [--key K] [--mode M] [--frequencyHz N] [--vocalPosture "..."] [--json]');
    console.error('   or: node tools/tag-vibe-profile.mjs \'{"title":"Track","bpm":86,"mode":"lydian","frequencyHz":880}\' [--json]');
    process.exit(1);
  }
  const { _json: json, _pack: packArg, ...track } = parsed;

  const pack = loadPack(packArg);

  const scored = pack.profiles
    .map((p) => scoreTrack(track, p))
    .sort((a, b) => b.total - a.total || a.profile.id.localeCompare(b.profile.id))
    .slice(0, 3);

  const matched = scored.length > 0 && scored[0].total >= MATCH_FLOOR;
  const top3 = matched ? scored : [];

  if (json) {
    console.log(
      JSON.stringify(
        {
          input: track,
          pack: { name: pack.name, version: pack.version },
          top3: top3.map((s) => ({
            profile: s.profile.id,
            frequencyHz: s.profile.frequencyHz ?? null,
            score: s.total,
            reasons: s.reasons,
          })),
          matched,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(`Track: ${track.title || "(untitled)"}`);
  console.log(`Pack: ${pack.name ?? "(unnamed pack)"} v${pack.version ?? "?"} (${pack.profiles.length} profiles)`);
  const providedBits = [];
  if (track.bpm != null) providedBits.push(`bpm=${track.bpm}`);
  if (track.key) providedBits.push(`key=${track.key}`);
  if (track.mode) providedBits.push(`mode=${track.mode}`);
  if (track.frequencyHz != null) providedBits.push(`frequencyHz=${track.frequencyHz}`);
  if (track.vocalPosture) providedBits.push(`vocalPosture="${track.vocalPosture}"`);
  console.log(providedBits.length ? `Inputs: ${providedBits.join(", ")}` : "Inputs: (none — every profile scores 0)");
  if (track.key) console.log('Note: "key" is not scored — packs tie profiles to modes, not specific keys.');
  console.log("");

  if (!matched) {
    console.log("no profile proposed — insufficient signal");
    console.log(`(top score ${scored[0]?.total ?? 0} is below the match floor of ${MATCH_FLOOR}; provide at least one of bpm/mode/frequencyHz/vocalPosture)`);
    return;
  }

  top3.forEach((s, i) => {
    const arch = s.profile.archetype ? `${s.profile.archetype}, ` : "";
    const hz = s.profile.frequencyHz != null ? `${s.profile.frequencyHz} Hz` : "no anchor Hz";
    console.log(`${i + 1}. ${s.profile.name} (${arch}${hz})  — score: ${s.total}`);
    console.log(`   ${s.reasons.length ? s.reasons.join("; ") : "no matching signal — score is a default tie"}`);
    console.log("");
  });
}

main();
