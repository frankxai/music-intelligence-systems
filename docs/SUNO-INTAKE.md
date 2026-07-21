# Suno Intake — from export to sequenced album

Suno has no public API for generation retrieval, and pulling assets any other
way risks the platform's ToS. So intake here is **manual-by-design**: you
export from Suno yourself, drop the file where the tooling expects it, and
the rest of the pipeline is scripted and deterministic. This is the
ToS-safe path, not a workaround for a missing integration.

Throughout this doc, **Arcanea** (Frank's label) is the worked case study.
Its actual roster and album live privately in his `FrankX` repo per
`docs/PACKAGING.md` — the commands below run against the public example
profile pack, and a real label swaps in its own via `--profile-pack`.

## The intake folder

The case-study intake point is a Google Drive folder ("Arcanea Music — Suno
Intake"). Yours can be any folder your workflow reaches — the tooling below
never reads it directly. A human (or an agent with Drive access) pulls files
down locally before running any of the tooling below.

## The end-to-end flow

```
1. Generate in Suno
2. Export (manual — no Suno API; download from the Suno UI)
3. Drop the export into your intake folder
4. "Ingest the intake folder" — pull the new file(s) down to a local
   working directory (e.g. sync the Drive folder, or download individually)
5. Tag — run tools/tag-vibe-profile.mjs against the track's descriptor
   (title, bpm, mode, frequencyHz, vocalPosture — whatever's known) to get
   the top-3 profile match + reasoning for your pack
6. Master — apply your label's mastering target (Arcanea's is -18 to -16
   LUFS integrated, dynamic-range-protected, sync-grade)
7. Sequence — add the track to an album manifest (see
   schemas/album.schema.json) and run tools/album-builder.mjs to validate
   + regenerate the tracklist
```

## Step-by-step with the tools in this repo

**Tag a track against a profile pack:**

```bash
node tools/tag-vibe-profile.mjs --title "Ocean Chorus" --bpm 84 --mode lydian --frequencyHz 880
# real label:
node tools/tag-vibe-profile.mjs --profile-pack ~/labels/yours.json --title "Ocean Chorus" --bpm 84 --mode lydian
```

Scores every profile in the pack (default: the shipped
`profile-packs/example-profile-pack.json`) on frequency proximity, mode
match, and tempo-band fit (where the pack states one), and prints the top 3
with a score and a plain-language reason per match. Deterministic — no
network, no LLM calls, no guessing. Authoring your own pack:
`docs/BRING-YOUR-OWN-PROFILE-PACK.md`.

**Add the track to an album and validate the sequence:**

```bash
node tools/album-builder.mjs albums/example-album/album.json
```

Validates the manifest against `schemas/album.schema.json` (required
fields, track status enum, sequence-resolves-to-tracks) and prints a
formatted tracklist + release-manifest summary (per-track profile +
frequency, total runtime, mastering target).

## Why manual export instead of an API pull

- Suno does not expose a public API for pulling generated assets.
- Any unofficial pull path (scraping, reverse-engineered endpoints) risks
  ToS violation and account action — not worth it for a label workflow that
  runs a handful of releases per profile per year.
- Manual export keeps a human in the loop at the one point (listening to
  the actual export) where machine tooling can't substitute for ears.

## Canon-binding reminder

The discipline the Arcanea case study runs (worth copying): **every release
names its profile in metadata.** A track that doesn't bind to a profile
either stays in draft or ships in a separate experiments sub-feed — it does
not get a profile invented for it after the fact. The tagging tool enforces
the same posture: below the match floor, it proposes nothing.
