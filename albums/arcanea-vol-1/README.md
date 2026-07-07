# Arcanea, Vol. 1

The first album scaffold for the Arcanea label — see the canon at
`Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md`
(10-Guardian roster, per-Guardian Solfeggio-frequency tuning, mastering
discipline) and its self-contained mirror at `data/arcanea-guardians.json`
in this repo.

## What's in this album

`album.json` mixes two generations of the label's catalog, honestly labeled:

1. **3 published legacy tracks** — "Arcanea (light me up) (Remastered)",
   "Arcanean Legends", "Arcanean Starlight". These are real tracks from the
   FrankX catalog (`FrankX/data/music-asset-registry.json`, tag `arcanea`)
   that predate the CANON.md Guardian-binding discipline — they're
   pop-rock/soul and arena-rock, not the cinematic-orchestral-mythic sound
   DNA canon locks in. They carry no `guardian` field because they were
   never bound to one; per CANON.md's canon-binding rule, un-bound releases
   either stay as-is or move to `releases-experimental/` — inventing a
   Guardian binding for them here would misrepresent the catalog.
2. **3 planned Guardian-bound placeholder slots** — "Alera — Theme No. 1"
   (528 Hz, Lydian, 86 BPM — the exact worked example from CANON.md's
   per-platform copy section), "Lyssandria — Theme No. 1" (174 Hz, Aeolian),
   "Maylinn — Theme No. 1" (417 Hz, Dorian). These show the intended shape
   of a canon-compliant release: every future Arcanea track names its
   Guardian in metadata and is frequency-tuned to that Guardian's Hz.

Phase order follows CANON.md's roster priority: Alera (Phase 1), Lyssandria
(Phase 2), Maylinn (Phase 3).

## Adding a track

1. Drop the exported Suno file into the "Arcanea Music — Suno Intake" Drive
   folder (see `docs/SUNO-INTAKE.md` for the full intake flow).
2. Once it's local, run `node tools/tag-arcanea-guardian.mjs` against the
   track's descriptor (title, bpm, mode, frequencyHz, vocalPosture — whatever
   you have) to get the top-3 Guardian match + reasoning.
3. Add a track entry to `album.json` with the matched `guardian` id,
   `frequencyHz`, `bpm`, `mode`, and a `status` of `"planned"` (not yet
   mastered/released), `"draft"` (mastered, not yet sequenced for release),
   or `"published"` (live).
4. Add the track's `sunoId` (preferred) or `title` to `sequence` in the
   position you want it to play.

## Rebuilding the tracklist

```bash
node tools/album-builder.mjs albums/arcanea-vol-1/album.json
```

This validates `album.json` against `schemas/album.schema.json` (required
fields, status enum, sequence-resolves-to-tracks, guardian ids exist in
`data/arcanea-guardians.json`) and prints a formatted tracklist plus a
release-manifest summary (per-track Guardian + frequency, total runtime,
mastering target).
