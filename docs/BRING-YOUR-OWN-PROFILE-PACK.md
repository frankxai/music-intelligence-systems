# Bring Your Own Profile Pack

> How a producer or label configures the generic tagging engine with their own sound identity —
> without forking any code. Companion to `docs/PACKAGING.md` (why the boundary exists) and
> `schemas/profile-pack.schema.json` (the contract).

Last updated: 2026-07-21

---

## 1. What a profile pack is

A profile pack is one JSON file that describes your label's (or your own) **sound-identity roster**:
a set of named profiles, each with the musical anchors the engine scores tracks against —
anchor frequency, preferred modes, tempo band, vocal posture. The engine
(`tools/tag-vibe-profile.mjs`) is generic and public; the pack is where *your* taste lives.

The same pack drives everything downstream: canon-fit scoring in the eval harness
(`evals/music/score.mjs canon-fit`), album cross-checks (`tools/album-builder.mjs`), and any
brief-generation pipeline you point at it.

This repo ships `profile-packs/example-profile-pack.json` — four deliberately demo-grade profiles
(Low Tide / Daybreak / Ironworks / Glasshouse) so the tool runs out of the box with zero private
data. Real packs live in *your* private repo, the way Frank's Arcanea pack lives in his.

---

## 2. The schema, field by field

Full contract: `schemas/profile-pack.schema.json`. The shape:

```json
{
  "name": "Your Label",
  "version": "1.0.0",
  "description": "One line on what this roster is.",
  "source": "optional pointer to your canon/brand doc",
  "updated": "2026-07-21",
  "profiles": [
    {
      "id": "night-shift",
      "name": "Night Shift",
      "archetype": "After-hours",
      "frequencyHz": 220,
      "modePreference": ["Dorian", "Aeolian"],
      "tempoBandBpm": [70, 92],
      "voiceTone": "smoky, close-mic, conversational",
      "palette": "Sodium orange on wet asphalt"
    }
  ]
}
```

Per profile:

| Field | Scored? | Notes |
|---|---|---|
| `id` | — | Stable lowercase slug. Used in album manifests and JSON output. |
| `name` | — | Display name. |
| `archetype` | no | Role label for humans ("Drive", "Clarity"). |
| `frequencyHz` | **yes — up to 50 pts** | Anchor frequency, scored by proximity (±5 Hz = full 50, linear falloff to 0 at 200 Hz). Omit if your identity isn't frequency-anchored — the axis simply contributes zero. |
| `modePreference` | **yes — up to 30 pts** | List of modes. Two special values score lower on purpose: `"modal mixture"` (22) and `"all modes / modulating"` (20) — a catch-all preference is a weaker signal than a specific one. |
| `tempoBandBpm` | **yes — up to 15 pts** | `[low, high]`. Full points inside the band, linear falloff to 15 BPM outside. Omit when canon doesn't state one — don't invent. |
| `voiceTone` | **yes — up to 5 pts** | Keyword overlap with the track's `vocalPosture`. |
| `palette` | no | Visual identity hint for cover-art pipelines. |

Design rule inherited from the engine: **missing fields contribute zero, never an error.** A track
scored with no inputs matches nothing (the match floor), and a profile with no `tempoBandBpm`
just never earns tempo points. This keeps packs honest — you only encode what your canon
actually states.

---

## 3. Worked example — a non-Arcanea label from scratch

Say you run a small tape label, *Basement Light*, with three moods you actually release:

```json
{
  "name": "Basement Light",
  "version": "0.1.0",
  "description": "Lo-fi tape label: dust, warmth, and one loud exception.",
  "updated": "2026-07-21",
  "profiles": [
    {
      "id": "dust",
      "name": "Dust",
      "archetype": "Tape ambient",
      "modePreference": ["Aeolian"],
      "tempoBandBpm": [58, 74],
      "voiceTone": "wordless, buried, humming"
    },
    {
      "id": "porchlight",
      "name": "Porchlight",
      "archetype": "Folk warmth",
      "modePreference": ["Ionian", "Mixolydian"],
      "tempoBandBpm": [82, 104],
      "voiceTone": "close, worn, unpolished, warm"
    },
    {
      "id": "fuse",
      "name": "Fuse",
      "archetype": "The loud one",
      "modePreference": ["Phrygian"],
      "tempoBandBpm": [140, 170],
      "voiceTone": "shouted, raw, blown out"
    }
  ]
}
```

Note what's *absent*: no `frequencyHz` anywhere, because this label's identity isn't
frequency-anchored. The engine handles that fine — scoring leans on mode + tempo + voice.

Run it:

```bash
node tools/tag-vibe-profile.mjs --profile-pack ~/labels/basement-light.json \
  --title "Kitchen Tape 4" --bpm 66 --mode aeolian --vocalPosture "humming, buried under hiss"
```

Expected: `Dust` wins on tempo band + mode + vocal overlap; `Fuse` scores zero.

---

## 4. Wiring the pack into a pipeline

1. **Keep the pack in your private repo** (the `FrankX` pattern: one JSON at
   `data/music/<your>-profile-pack.json`, one album folder per release).
2. **Tag at intake** — after each generation session, run `tag-vibe-profile.mjs --profile-pack …`
   over the track descriptor and store the top-3 in your track metadata.
3. **Gate with the eval harness** — `evals/music/score.mjs canon-fit --profile-pack … --profile <id> …`
   scores a track against one *claimed* profile instead of ranking all of them.
4. **Never force the nearest match** — the engine refuses to propose a profile when no axis fired
   (match floor). Respect that refusal: a track that fits nothing ships unbadged or stays in
   drafts, per whatever release discipline your label runs.

---

## 5. FAQ

**Why not just edit the example pack in place?**
Because the example is public and yours probably shouldn't be. The `--profile-pack` argument
exists precisely so your identity never has to enter a public working tree.

**Can profiles overlap?**
Yes — overlapping tempo bands and shared modes are normal. The ranking + reasons output is
designed for a human curator to make the final call, not to be a classifier.

**How many profiles should a pack have?**
As many as your canon actually distinguishes. The example ships four; Frank's Arcanea pack runs
ten; the worked example above runs three. More profiles = more diffuse scores — only encode
identities you'd actually release under.
