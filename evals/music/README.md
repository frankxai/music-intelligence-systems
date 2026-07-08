# evals/music — the minimal eval harness

Answers "which models and process steps are best" for the pipeline in `WORKFLOW.md` Loop D, without
pretending to run generation models it doesn't have access to.

## What's here

- **`RUBRICS.md`** — the four scoring rubrics: canon-fit, mastering-pass, cover brand-gate, and the
  model A/B comparison template.
- **`score.mjs`** — zero-dependency Node scorer, same style as `tools/validate-registry.mjs` and
  `tools/tag-arcanea-guardian.mjs`: no network, no LLM calls, deterministic output for a given input.

## Honest scope — what this harness does and does not do

This harness scores **descriptors and measured outputs you already have** — a track's known
frequency/mode/bpm/vocal posture, a measured LUFS-integrated value, a cover's checklist results. It
does **not** call Suno, Higgsfield, NB2, or any other generation API to produce candidates for
comparison. There are no API keys configured in this environment for those services, and even where
there are, live generation-vs-generation comparison is a separate, much more expensive workflow than
this harness is meant to be.

Concretely:

- `canon-fit` and `mastering-pass` are fully deterministic — give them numbers, get a score and a
  verdict.
- `brand-gate` is deterministic given a checklist — it does not look at an actual image.
- `model-ab` is **not scored**. It prints a comparison table template (engine / cost / quality /
  brand-fit / notes) with the cost column pre-filled wherever `docs/MEDIA-TOOLING-DOCTRINE.md` states
  a real number (native ≈ free, Higgsfield = credits/metered). Quality and brand-fit are left as
  `TBD` for a human or an LLM judge to fill in after the candidates are actually generated elsewhere.

## Running it

```bash
# canon-fit: on-canon example (Alera track at her canonical frequency/mode)
node evals/music/score.mjs canon-fit --guardian alera --frequencyHz 528 --bpm 86 --mode lydian --vocalPosture "choral languageless resonant"

# canon-fit: off-canon example (English-lyric pop tagged as Alera anyway)
node evals/music/score.mjs canon-fit --guardian alera --frequencyHz 440 --bpm 120 --mode major --vocalPosture "clean english lead vocal pop"

# mastering-pass: sync-grade master, in window
node evals/music/score.mjs mastering-pass --lufsIntegrated -17

# mastering-pass: streaming-loud master, fails the sync-grade window
node evals/music/score.mjs mastering-pass --lufsIntegrated -12

# cover brand-gate: all checks pass, Godbeast not applicable to this context
node evals/music/score.mjs brand-gate --paletteMatch true --typographyLock true --bannedStyleClean true --godbeastPresent n/a

# cover brand-gate: banned-style violation
node evals/music/score.mjs brand-gate --paletteMatch true --typographyLock true --bannedStyleClean false --godbeastPresent true

# model A/B template for a cover decision
node evals/music/score.mjs model-ab --asset cover

# model A/B template for a video decision, explicit engine list
node evals/music/score.mjs model-ab --asset video --engines remotion,higgsfield-kling

# any rubric accepts a JSON blob instead of flags, and --json for machine-readable output
node evals/music/score.mjs canon-fit '{"guardian":"alera","frequencyHz":528,"bpm":86,"mode":"lydian"}' --json
```

## Where this plugs into the rest of the system

- Loop D (`WORKFLOW.md`) runs this harness before scaling a batch of covers/videos/masters, and
  before deciding whether a candidate track should be sequenced into an album.
- `docs/MEDIA-TOOLING-DOCTRINE.md` is the source of truth this harness defers to for engine cost and
  escalation triggers — `score.mjs` reads from it conceptually (the `KNOWN_ENGINE_COST` table mirrors
  its stated costs) but does not parse the doc at runtime; if the doctrine changes, update the table.
- `data/arcanea-guardians.json` is the same self-contained Guardian roster
  `tools/tag-arcanea-guardian.mjs` uses — one source of truth, read by both tools.
