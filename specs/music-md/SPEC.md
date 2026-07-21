# MUSIC.md — an agent-readable context file for music

**Spec version: 0.1 (draft)** · Status: proposed standard, dogfooded in this repo
· Maintained in `music-intelligence-systems` · License: MIT

---

## 1. Why this exists

Agents can read a repo's `AGENTS.md` and know how to work on the code. Nothing equivalent
exists for music. A song, album, or catalog touched by AI tooling carries context that today
lives nowhere machine-readable:

- what this music **is** (identity, sound DNA, intent),
- how it was **made** (generation lineage: model, prompts, human edits),
- what may be **done with it** (license state, AI-disclosure posture, sync readiness),
- what **exists** for it (masters, stems, covers, videos), and
- what an agent **must not do** (re-lyric a released track, invent a persona, force a canon
  binding).

Existing standards don't cover this. DDEX (incl. the 2025 AI-disclosure extension) is B2B
supply-chain metadata for labels/DSPs. ID3 is file tags. MusicXML is notation. JAMS is MIR
research annotation. None of them is a *working context file* an agent reads before touching
a body of music — the `AGENTS.md` / `llms.txt` role. As of mid-2026 no such convention
exists anywhere; this spec proposes one.

`MUSIC.md` is that file: Markdown with YAML frontmatter, colocated with the music it
describes. Humans read the prose; agents read both.

## 2. Placement and scoping

A `MUSIC.md` describes the directory tree it sits in. Three scopes:

| Scope | Placement | Describes |
|---|---|---|
| `catalog` | repo root or catalog root | A label, artist, or whole catalog |
| `album` | album directory (next to `album.json`) | One release |
| `track` | track directory | One track |

**Nearest file wins**, and narrower scopes inherit from broader ones (the `AGENTS.md`
convention): a track-level file overrides album-level statements for that track only. Agents
SHOULD read every `MUSIC.md` from the target file up to the root and merge, nearest-last.

## 3. File format

YAML frontmatter (the machine layer) + Markdown body (the judgment layer). The frontmatter
contract is `schemas/music-md.schema.json`. Everything is optional except `music_spec`,
`scope`, and `title` — **omit over invent** (§5.1) is the spine of this spec.

### 3.1 Frontmatter keys (v0.1)

```yaml
---
music_spec: "0.1"          # required — spec version this file targets
scope: album               # required — catalog | album | track
title: "Example Label, Vol. 0"   # required
artist: "Example Artist"   # display name or persona name
label: "Example Label"

# Identity — where the sound DNA machine-lives
profile_pack: profile-packs/example-profile-pack.json   # path/URL; MAY point outside the
                                                        # public tree (private pack) — declare,
                                                        # don't inline
profile: glasshouse        # track scope: the bound profile id (omit if unbound — never guess)
album_manifest: album.json # album scope: the album.json this file annotates

# Intent — what the music is for
functional_intent:         # vibe-state ids or free targets the music serves
  - deep_focus
sound_dna:                 # coarse anchors; the pack holds the precise ones
  bpm: [80, 100]
  modes: [Lydian]
  instrumentation: "piano, ambient synth pads, minimal percussion"
  references: "the shipped example pack's 'glasshouse' profile"

# Lineage — how it was made (mandatory when any AI contributed; see §5.3)
generation:
  provider: suno           # suno | udio | elevenlabs | lyria | stable-audio | ace-step |
                           # heartmula | live | daw | hybrid | human | other
  model: "v5"
  ai_contribution: generated  # human | assisted | generated
  prompt_provenance: take-log.jsonl   # where prompts/takes are logged
  human_edits: "lyrics hand-written; arrangement curated across 14 takes"

# Rights — what may be done with it (see §5.4)
rights:
  license_state: suno-paid-commercial   # free-text state id; SHOULD name the actual basis
  owner: "Example Artist"
  ai_disclosure: "vocals and instrumentation AI-generated (Suno v5); lyrics human-written"
  sync_ready: false

# Assets — what exists (paths relative to this file)
assets:
  masters: [final/master-14lufs.wav]
  stems: stems/
  cover: art/cover.png
  video: null

# Measurement — measured overrides declared (see §5.2)
measurements:
  lufs_integrated: -14.2
  bpm_measured: 88
  key_measured: "C# major"

links:
  spotify: null
  suno: null

updated: 2026-07-21
---
```

### 3.2 Body sections (recommended, not required)

- **The Sound** — prose sound DNA; what the numbers can't say.
- **Intent** — who this is for, what state or scene it serves.
- **Production notes** — what a producer/agent needs to know to extend it.
- **Agent guidance** — the load-bearing section: explicit dos/don'ts for downstream agents
  ("never re-lyric released tracks", "cover art holds the pack palette", "unbound tracks stay
  unbound until a human confirms").
- **History** — lineage prose: how the piece evolved, which takes were kept and why.

## 4. What consumes it

- **Production agents** read identity + guidance before generating anything (covers, videos,
  extensions, remasters) so output stays on-brand without the brand being re-explained per
  prompt.
- **Tagging/eval tooling** (`tools/tag-vibe-profile.mjs`, `evals/music/score.mjs`) resolves
  `profile_pack` and `profile` instead of being handed loose CLI args.
- **Content & cinema pipelines** read `functional_intent` + `rights.sync_ready` + `assets.stems`
  to decide whether and how a track may score a video, trailer, or session — the sync brief
  starts pre-answered.
- **Release tooling** maps `generation` + `rights.ai_disclosure` onto DDEX-style AI-disclosure
  fields at export time; the MUSIC.md is the upstream source of truth the B2B metadata is
  derived from.

## 5. Principles (normative)

### 5.1 Omit over invent
Every key except `music_spec`, `scope`, `title` is optional. An absent key means "not stated"
— never a default. Tools consuming MUSIC.md MUST treat missing fields as zero-signal, exactly
as the tagging engine does. Writing a guessed BPM is a spec violation; writing nothing is
compliant.

### 5.2 Measured overrides declared
When `measurements` and declared values (e.g. `sound_dna.bpm`) disagree, the measurement wins
for any scoring/gating decision. Declared values document intent; measurements document
reality; both stay in the file so the delta is visible (it's learning-loop data).

### 5.3 Provenance is mandatory for AI contribution
If any AI system contributed audio, lyrics, or arrangement, `generation` MUST be present with
at least `provider` and `ai_contribution`. A MUSIC.md with no `generation` block asserts
human-made. Misstating this field is the one way to lie with this file — don't.

### 5.4 Rights state is a claim, not a grant
`rights.license_state` records what the author believes the license basis is (e.g. a Suno
paid-plan commercial license — which is a license, not ownership). Consuming agents SHOULD
treat unknown/absent rights as "not cleared" and refuse irreversible distribution actions.

### 5.5 Public file, private references
A MUSIC.md in a public repo MAY reference private material (a private profile pack, an
unreleased album path) by location without inlining content. The reference declares the
dependency; the content stays private. This is the public-engine/private-brand boundary
(`docs/PACKAGING.md`) applied to context files.

## 6. Relationship to existing pieces

| Piece | Role | MUSIC.md's relation |
|---|---|---|
| `profile-pack.json` | A label's identity roster | MUSIC.md points at it (`profile_pack`) |
| `album.json` | Sequenced release manifest | MUSIC.md annotates it (`album_manifest`) |
| `take-log.jsonl` | Per-take generation log | MUSIC.md cites it (`prompt_provenance`) |
| vibe-state library | Functional-state definitions | MUSIC.md references state ids (`functional_intent`) |
| DDEX / AI-disclosure | B2B export metadata | Derived *from* MUSIC.md at release time |

## 7. On a `.music` file extension

Considered and **deferred**. The YAML frontmatter *is* the machine layer; a separate compact
`.music` sidecar format would duplicate it and require tooling before anyone benefits. If
real consumers emerge that need a pure-data interchange shape (DAW plugins, hosted services),
v0.2 can define `.music` as exactly "the frontmatter, as standalone YAML/JSON" — a
mechanical extraction, not a second standard. Until then: one file, `MUSIC.md`.

## 8. Versioning & contribution

- Spec versions are semver-ish; frontmatter declares the version it targets.
- v0.1 is deliberately small. Candidate v0.2 items: multi-track catalogs inline, persona
  files, stem-level lineage, standardized `license_state` enum aligned with platform terms,
  `.music` extraction (§7).
- Worked instance: `albums/example-album/MUSIC.md` in this repo. Schema:
  `schemas/music-md.schema.json`. Issues/PRs welcome in
  `github.com/frankxai/music-intelligence-systems`.
