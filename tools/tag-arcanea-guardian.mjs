#!/usr/bin/env node
/**
 * tag-arcanea-guardian.mjs — deterministic Guardian-matching for the Arcanea label.
 *
 * Scores a track descriptor against the 10-Guardian roster in
 * data/arcanea-guardians.json (self-contained mirror of
 * Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md)
 * on three signals:
 *
 *   - frequency proximity  (track frequencyHz vs. Guardian's canonical Solfeggio Hz)
 *   - mode match            (track mode vs. Guardian's canonical modePreference)
 *   - tempo-band fit        (track bpm vs. Guardian's tempoBandBpm, where canon states one)
 *
 * A small vocal-posture keyword-overlap signal is added if provided. `key` is
 * accepted but not scored — canon ties Guardians to modes, not specific keys.
 *
 * No network, no LLM calls. Missing fields simply contribute zero — the track
 * is scored on whatever's provided.
 *
 * Usage:
 *   node tools/tag-arcanea-guardian.mjs --title "Track" --bpm 86 --mode lydian --frequencyHz 528
 *   node tools/tag-arcanea-guardian.mjs '{"title":"Track","bpm":86,"mode":"lydian","frequencyHz":528}'
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(HUB, p), "utf8"));

function parseArgs(argv) {
  if (argv.length === 0) return null;
  const joined = argv.join(" ").trim();
  if (joined.startsWith("{")) {
    try {
      return JSON.parse(joined);
    } catch (e) {
      console.error(`Failed to parse JSON argument: ${e.message}`);
      process.exit(1);
    }
  }
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    let key, value;
    if (eq !== -1) {
      key = a.slice(2, eq);
      value = a.slice(eq + 1);
    } else {
      key = a.slice(2);
      value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    }
    out[key] = value;
  }
  if (out.bpm !== undefined) out.bpm = Number(out.bpm);
  if (out.frequencyHz !== undefined) out.frequencyHz = Number(out.frequencyHz);
  return out;
}

function freqScore(trackHz, guardianHz) {
  if (trackHz == null || Number.isNaN(trackHz)) return { score: 0, reason: null };
  const diff = Math.abs(trackHz - guardianHz);
  const TOLERANCE = 5;
  const MAX_DIFF = 200;
  if (diff <= TOLERANCE) {
    return { score: 50, reason: `frequency ${trackHz}Hz matches ${guardianHz}Hz (diff ${diff}Hz)` };
  }
  if (diff >= MAX_DIFF) return { score: 0, reason: null };
  const score = Math.round(48 * (1 - (diff - TOLERANCE) / (MAX_DIFF - TOLERANCE)));
  return { score, reason: `frequency ${trackHz}Hz is ${diff}Hz from ${guardianHz}Hz` };
}

function modeScore(trackMode, guardian) {
  if (!trackMode) return { score: 0, reason: null };
  const tm = String(trackMode).toLowerCase();
  const prefs = guardian.modePreference.map((m) => m.toLowerCase());
  const matched = prefs.some((p) => p === tm || p.includes(tm) || tm.includes(p));
  if (!matched) return { score: 0, reason: null };
  if (prefs.includes("all modes / modulating")) {
    return { score: 20, reason: `${guardian.name} works in all modes (cosmic/modulating) — "${trackMode}" fits` };
  }
  if (prefs.includes("modal mixture")) {
    return { score: 22, reason: `${guardian.name} synthesizes modal mixture — "${trackMode}" fits` };
  }
  return { score: 30, reason: `mode match: ${guardian.name} prefers ${guardian.modePreference.join("/")}` };
}

function tempoScore(trackBpm, guardian) {
  if (trackBpm == null || Number.isNaN(trackBpm) || !guardian.tempoBandBpm) return { score: 0, reason: null };
  const [lo, hi] = guardian.tempoBandBpm;
  if (trackBpm >= lo && trackBpm <= hi) {
    return { score: 15, reason: `${trackBpm} BPM sits inside ${guardian.name}'s ${lo}-${hi} BPM band` };
  }
  const dist = trackBpm < lo ? lo - trackBpm : trackBpm - hi;
  if (dist <= 15) {
    return { score: Math.round(15 * (1 - dist / 15)), reason: `${trackBpm} BPM is ${dist} BPM outside ${guardian.name}'s ${lo}-${hi} band` };
  }
  return { score: 0, reason: null };
}

function vocalScore(trackVocal, guardian) {
  if (!trackVocal) return { score: 0, reason: null };
  const tokens = String(trackVocal).toLowerCase().match(/[a-z]+/g) || [];
  const voiceTokens = guardian.voiceTone.toLowerCase().match(/[a-z]+/g) || [];
  const overlap = tokens.filter((t) => voiceTokens.includes(t));
  if (!overlap.length) return { score: 0, reason: null };
  return { score: Math.min(5, overlap.length * 3), reason: `vocal posture echoes voice/tone: ${overlap.join(", ")}` };
}

function scoreTrack(track, guardian) {
  const freq = freqScore(track.frequencyHz, guardian.frequencyHz);
  const mode = modeScore(track.mode, guardian);
  const tempo = tempoScore(track.bpm, guardian);
  const vocal = vocalScore(track.vocalPosture, guardian);
  const total = freq.score + mode.score + tempo.score + vocal.score;
  const reasons = [freq.reason, mode.reason, tempo.reason, vocal.reason].filter(Boolean);
  return { guardian, total, reasons };
}

function main() {
  const track = parseArgs(process.argv.slice(2));
  if (!track) {
    console.error('Usage: node tools/tag-arcanea-guardian.mjs --title "Track" [--bpm N] [--key K] [--mode M] [--frequencyHz N] [--vocalPosture "..."]');
    console.error('   or: node tools/tag-arcanea-guardian.mjs \'{"title":"Track","bpm":86,"mode":"lydian","frequencyHz":528}\'');
    process.exit(1);
  }

  const { guardians } = read("data/arcanea-guardians.json");

  console.log(`Track: ${track.title || "(untitled)"}`);
  const providedBits = [];
  if (track.bpm != null) providedBits.push(`bpm=${track.bpm}`);
  if (track.key) providedBits.push(`key=${track.key}`);
  if (track.mode) providedBits.push(`mode=${track.mode}`);
  if (track.frequencyHz != null) providedBits.push(`frequencyHz=${track.frequencyHz}`);
  if (track.vocalPosture) providedBits.push(`vocalPosture="${track.vocalPosture}"`);
  console.log(providedBits.length ? `Inputs: ${providedBits.join(", ")}` : "Inputs: (none — every guardian scores 0)");
  if (track.key) console.log('Note: "key" is not scored — canon ties Guardians to modes, not specific keys.');
  console.log("");

  const scored = guardians
    .map((g) => scoreTrack(track, g))
    .sort((a, b) => b.total - a.total || a.guardian.id.localeCompare(b.guardian.id))
    .slice(0, 3);

  scored.forEach((s, i) => {
    console.log(`${i + 1}. ${s.guardian.name} (${s.guardian.archetype}, ${s.guardian.frequencyHz} Hz)  — score: ${s.total}`);
    console.log(`   ${s.reasons.length ? s.reasons.join("; ") : "no matching signal — score is a default tie"}`);
    console.log("");
  });
}

main();
