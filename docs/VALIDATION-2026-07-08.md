# Validation Sweep — 2026-07-08

> Full ecosystem test + end-to-end validation after the functional-completeness build
> (audio analysis, atomic writes, learning-loop plumbing, schema authority + drift guard).
> Everything below was run against real files, not asserted. This is the "fully functional" proof.

## Headline: the audio-blindness gap is closed and proven

The L99 excellence review's #1 correctness gap — canon-fit grading declared metadata it never
measured — is fixed. `scripts/music/analyze-audio.py` on a real wav:

```
test_528hz.wav → { durationSec:10, lufsIntegrated:-10.5, pitchHz:528.27, keyGuess:"C",
                   analyzedWith:["ffmpeg-ebur128","librosa"] }
```
528 Hz → detected C (523 Hz reference) — measurement is real. BPM verified separately on a
synthetic 120 BPM track → 120.2. ffmpeg ebur128 (LUFS) is the guaranteed path; librosa is
best-effort with honest null-degradation.

## End-to-end chain (real audio → brief)

A sidecar declaring bpm 120 / key F, pointing at the 528 Hz wav, run through `ingest-intake.mjs`:
- brief written with an `audio.measured` block (LUFS -10.5, pitch 528.27, key C)
- **mismatch detection fired correctly**: declared key F vs measured C → flagged; declared LUFS
  outside the -18/-16 sync window → flagged. The pipeline now catches what it used to trust blind.
- Guardian tagger (`--json`): 528 Hz / Lydian → `alera 80` (correct lead-Guardian binding).

## Tool-level results (real data)

| Tool | Result |
|---|---|
| `analyze-audio.py` | real LUFS + pitch/key; honest null BPM on a tone |
| `tag-arcanea-guardian.mjs --json` | matched: true, alera 80 / lyria 52 / aiyami 30 |
| `album-builder.mjs` (arcanea-vol-1) | valid; -18/-16 LUFS sync target |
| `aggregate-take-stats.mjs` | honest `n:0` empty state |
| `build-mission.mjs status` | real 3+2 mission from the live catalog (452 to review, 19 released) |
| `validate-registry.mjs` | OK — 15 repos, 35 agents, 12 skills, 17 tools |

## Smoke suite (FrankX)

All 13 music/mission agents PASS: music-album-orchestrator, music-brief-writer,
music-mission-control, music-catalog-indexer, music-create-wizard, music-licensing,
music-mastering-qc, music-producer, music-release-manager, music-suno-mastery,
music-suno-prompt-architect, music-video-batch, plus atomic-write. Suite total 53/76 — the 23
failures are all pre-existing non-music lint (meta-*, prompt-*, and the network-blocked `memory`
embedding fetch), none touched by this work.

## Registry drift: found → driven to zero

The new `validate-registry` drift scanner (the tool built to catch description-vs-reality drift)
found real drift on first run and it was fully reconciled:
- +3 new FrankX agents registered (album-orchestrator, brief-writer, mission-control)
- +3 new tools registered (analyze-audio, aggregate-take-stats, atomic-write)
- 7 stale Starlight paths repointed (verticals/music-is/agents/ → agents/)
- the "Music Producer" name collision — which the FrankX-only P0 fix had missed in **two other
  repos** — archived to deprecated/ in agentic-creator-os + frankx.ai-vercel-website; the stale
  registry pointer repointed.
- **Final scan: 0 drift** (0 undocumented on disk, 0 missing on disk, 0 name collisions).

## Honest remaining edges (not blocking; tracked)

- `catalog.csv` is CSV, not JSON — not yet covered by the atomic-write JSON helper.
- The learning loop is tested plumbing, not yet learning — needs ~20 real kept tracks.
- librosa/ffmpeg run locally; a machine without them degrades to ffmpeg-only (LUFS still works).
- The 4 Frank-only decisions from L99-NORTH-STAR remain open (Vibe OS product identity, academy
  fate, catalog number, canon ground truth).

## Verdict

The music system is functionally complete and proven end-to-end on real data. The only thing
between here and a released track is a human making one in Suno and dropping it in the intake folder.
