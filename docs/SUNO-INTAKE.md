# Suno Intake — from export to sequenced album

Suno has no public API for generation retrieval, and pulling assets any other
way risks the platform's ToS. So intake here is **manual-by-design**: you
export from Suno yourself, drop the file where the tooling expects it, and
the rest of the pipeline is scripted and deterministic. This is the
ToS-safe path, not a workaround for a missing integration.

## The intake folder

**"Arcanea Music — Suno Intake"** — Google Drive folder, id
`1iF8qP5m31K6X7WfbCof6dOBQdlfes-aB`.

This is where exported Suno audio (and any cover art) lands before it's
processed into the catalog. It's referenced here for continuity — this repo
has no Drive tool and does not read the folder directly. A human (or an
agent with Drive access) pulls files down locally before running any of the
tooling below.

## The end-to-end flow

```
1. Generate in Suno
2. Export (manual — no Suno API; download from the Suno UI)
3. Drop the export into the "Arcanea Music — Suno Intake" Drive folder
4. "Ingest the intake folder" — pull the new file(s) down to a local
   working directory (e.g. sync the Drive folder, or download individually)
5. Tag — run tools/tag-arcanea-guardian.mjs against the track's descriptor
   (title, bpm, mode, frequencyHz, vocalPosture — whatever's known) to get
   the top-3 Guardian match + reasoning
6. Master — apply the Arcanea mastering target (-18 to -16 LUFS integrated,
   dynamic-range-protected, sync-grade — see
   Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md)
7. Sequence — add the track to an album manifest (see
   schemas/album.schema.json) and run tools/album-builder.mjs to validate
   + regenerate the tracklist
```

## Step-by-step with the tools in this repo

**Tag a track against the 10-Guardian roster:**

```bash
node tools/tag-arcanea-guardian.mjs --title "Ocean Chorus" --bpm 84 --mode lydian --frequencyHz 528
```

Scores every Guardian in `data/arcanea-guardians.json` (self-contained
mirror of CANON.md's roster) on frequency proximity, mode match, and
tempo-band fit (where canon states one), and prints the top 3 with a
score and a plain-language reason per match. Deterministic — no network,
no LLM calls, no guessing.

**Add the track to an album and validate the sequence:**

```bash
node tools/album-builder.mjs albums/arcanea-vol-1/album.json
```

Validates the manifest against `schemas/album.schema.json` (required
fields, track status enum, sequence-resolves-to-tracks, Guardian ids exist
in the roster) and prints a formatted tracklist + release-manifest summary
(per-track Guardian + frequency, total runtime, mastering target).

## Why manual export instead of an API pull

- Suno does not expose a public API for pulling generated assets.
- Any unofficial pull path (scraping, reverse-engineered endpoints) risks
  ToS violation and account action — not worth it for a label workflow that
  runs a handful of releases per Guardian per year.
- Manual export keeps a human in the loop at the one point (listening to
  the actual export) where machine tooling can't substitute for ears.

## Canon-binding reminder

Per CANON.md: **every Arcanea-label release names its Guardian in
metadata.** A track that doesn't bind to a Guardian either stays in draft or
ships as an Arcanea-experiment in a separate sub-feed — it does not get a
Guardian invented for it after the fact. See
`albums/arcanea-vol-1/README.md` for how this plays out with the label's
existing pre-canon catalog.
