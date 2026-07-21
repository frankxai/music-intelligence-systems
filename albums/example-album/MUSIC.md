---
music_spec: "0.1"
scope: album
title: "Example Label, Vol. 0"
artist: "Example Artist"
label: "Example Label"
profile_pack: ../../profile-packs/example-profile-pack.json
album_manifest: album.json
functional_intent:
  - deep_focus
  - high_energy
sound_dna:
  modes: [Lydian, Phrygian]
  instrumentation: "piano and pads on the clarity side; driving synths and drums on the power side"
  references: "the shipped example pack's 'glasshouse' and 'ironworks' profiles"
generation:
  provider: suno
  model: "v5"
  ai_contribution: generated
  human_edits: "titles, sequencing, and mastering targets human-decided; this is a demo manifest — no real audio exists"
rights:
  license_state: demo-no-audio
  owner: "Example Artist"
  ai_disclosure: "demo album for tooling walkthroughs; the one 'published' track id is a placeholder"
  sync_ready: false
assets:
  masters: []
  stems: null
  cover: null
  video: null
updated: 2026-07-21
---

# Example Label, Vol. 0

The worked `MUSIC.md` instance for the spec at `specs/music-md/SPEC.md` — an album-scope
context file sitting next to its `album.json`, exactly where an agent would find it.

## The Sound

Two poles from the example pack: **Glasshouse** clarity (Lydian, 80–100 BPM, crystalline) and
**Ironworks** drive (Phrygian, 130–160 BPM, relentless). A real album's prose here would say
what the pack's numbers can't — what the record is *about*.

## Agent guidance

- This is demo data. Do not treat the placeholder `sunoId` as a real generation.
- Tracks carry no `profile` binding until a human confirms one — the tagging engine proposes,
  it never decides (match-floor discipline).
- Cover-art generation for a real album would inherit the bound profile's `palette` from the
  pack; here there is nothing to render.

## History

Created 2026-07-21 alongside the profile-pack engine as the repo's runnable, zero-private-data
demo of the intake → tag → sequence pipeline.
