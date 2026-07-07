# Album OS — Engineering Proposal

**Status:** Proposed (design doc, no code in this document)
**Date:** 2026-07-07
**Scope:** music-intelligence-systems (hub) composing FrankX, Starlight-Intelligence-System, vibe-os
**Companion (Phase 1, concurrent):** `tools/tag-arcanea-guardian.mjs`, `tools/album-builder.mjs`, `schemas/album.schema.json`, `albums/arcanea-vol-1/`, `docs/SUNO-INTAKE.md` — built in parallel with this proposal; this document specifies the fuller system that tooling grows into.
**Canon reference:** `Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md` (v0.2, 2026-04-29)

---

## 1. Vision — what an Album OS is

An **Album OS** is a repeatable, canon-driven pipeline that turns a pile of Suno exports into a released, sequenced, sync-ready album with matching visuals. The unit of work moves from *track* to *album*: intake, canon-tagging, curation, sequencing, mastering gates, cover art, release manifest, and licensing all operate against one committed album definition instead of ad-hoc per-song decisions.

### The current ad-hoc state (measured, not asserted)

- `FrankX/data/music-asset-registry.json` holds **61 tracks**; exactly **3** carry an `arcanea` tag (verified 2026-07-07 against the file on disk).
- One of those three — "Arcanea (light me up)", genre `pop rock / soul` — **violates the Arcanea canon it is tagged with**: CANON.md refuses "clean English-lyric pop vocals (wrong canon)" and mandates choral/languageless vocal posture. Tagging today is a free-text convention, not a checked contract.
- New Suno exports land in a Drive folder ("Arcanea Music — Suno Intake", id `1iF8qP5m31K6X7WfbCof6dOBQdlfes-aB`) with no downstream automation: no classification, no Guardian binding, no QC, no album membership.
- The ecosystem already has 32 registered agents (`registry/agents.json`) covering every individual stage — prompting, mastering QC, licensing, release, A&R, distribution — but **nothing owns the album as an artifact**. There is no album schema, no sequencing logic, no per-Guardian frequency verification, and no path from "10 good tracks" to "Arcanea Vol. 1 on Distrokid with canonical covers".

The Arcanea label canon is unusually machine-checkable: each of the 10 Guardians is locked to a Solfeggio frequency (Lyssandria 174 Hz through Shinkami 1111 Hz), a modal preference (Lydian/Phrygian/Dorian per Guardian), tempo bands (70-90 / 90-130 / 130-160 BPM), a vocal posture, a visual palette, and a mastering posture (~-18 to -16 LUFS integrated, dynamic-range protected, score-grade for sync). CANON.md declares canon binding **non-waivable**: releases that do not honor the frequency canon are refused at gate. That makes Arcanea the ideal first album to build the OS against — the brief is explicit enough to be a test suite. But the Album OS itself is label-agnostic: any label CANON under `verticals/music-is/labels/` (or any future label) supplies the parameters; the pipeline stays the same. No snowflake one-offs.

**Rule zero applies** (`ECOSYSTEM.md`): compose, don't duplicate. The Album OS adds exactly three new things — an album schema, a canon-tagger, and a sequencer — and routes everything else through agents that already exist.

---

## 2. The pipeline — stage graph and ownership

```
Drive intake ──► catalog-register ──► canon-tag ──► curate/cull ──► sequence
                                                                       │
release/licensing ◄── release-manifest ◄── cover/visual ◄── master-gate
```

Eight stages. For each: owner, built-vs-gap, and the data contract in/out.

### Stage 1 — Intake

| | |
|---|---|
| **Owner** | Operator + `docs/SUNO-INTAKE.md` (Phase 1, concurrent build). No agent owns Drive automation yet. |
| **Built** | Drive folder exists ("Arcanea Music — Suno Intake", `1iF8qP5m31K6X7WfbCof6dOBQdlfes-aB`). Suno exports land there manually. Phase 1 documents the manual pull. |
| **Gap** | Automated Drive → local sync (service-account or Drive MCP pull into a working directory). Suno has no public API (`roadmap/DEFERRED.md`), so generation-side automation stays deferred; *intake*-side automation is not blocked and is a Next-phase item. |
| **In** | Suno export files (mp3/wav + cover PNG + generation metadata where the export includes it: title, prompt text, style tags). |
| **Out** | Files in a local intake directory + one provisional entry per track. |

### Stage 2 — Catalog-register

| | |
|---|---|
| **Owner** | `music-catalog-indexer` (FrankX, haiku, `FrankX/.claude/agents/music-catalog-indexer.md`). Registry tier `pillar-2`, `portable: false` — runs inside FrankX where the catalog data lives. |
| **Built** | Fully. It is the source-of-truth indexer; the release manager and QC agents already read its output. |
| **Gap** | None structural. The indexer must not be bypassed: Album OS *reads* the catalog, never writes it directly (the indexer owns `data/music-asset-registry.json` / `data/music-catalog.json`). |
| **In** | Intake files + provisional metadata. |
| **Out** | Track entries validating against `schemas/track-metadata.schema.json` (this hub) — `inventoryId`, `sunoId`, `title`, `genre[]`, `tags[]`, `assetRefs`, `status`. |

### Stage 3 — Canon-tag (Guardian match)

| | |
|---|---|
| **Owner** | `tools/tag-arcanea-guardian.mjs` (hub, Phase 1 v1 — concurrent build) for scoring; **human confirms** (see §3); `music-curator` (Starlight music-is, opus) is the persona that adjudicates disputed bindings. |
| **Built** | Phase 1 v1 lands with the concurrent tooling: metadata-driven scoring (title/prompt/tags/BPM). |
| **Gap** | The fuller scoring model in §3 — spectral frequency verification, mode detection, vocal-posture classification, confidence tiers, review queue. |
| **In** | Track entry (track-metadata shape) + the label CANON (Guardian table). |
| **Out** | Per-track canon block: `{ label: "arcanea", guardian: "alera", confidence, score_breakdown, confirmed_by, confirmed_at }` written into the track's `tags`/metadata and into the album manifest. Unbound tracks route to `releases-experimental` per CANON.md, never silently into the main feed. |

### Stage 4 — Curate / cull

| | |
|---|---|
| **Owner** | `music-curator` (Starlight music-is, opus, A&R quality gate) — the registry's explicit gate agent. Vibe/state framing support from `vibe-os-master` (vibe-os) where a track claims a state-change function. |
| **Built** | The curator agent exists as the label vertical's A&R gate. |
| **Gap** | An *album-context brief* — the curator today gates single releases; it needs the album manifest as input so cull decisions consider coverage (e.g. "we have four 90-110 BPM heroic cues and no contemplative opener"). |
| **In** | Candidate track list (canon-tagged) + album concept (Guardian, target length, arc profile). |
| **Out** | `tracks[]` with `status: selected | culled | hold`, each with a one-line reason. Culled tracks stay in the catalog — hide, don't delete. |

### Stage 5 — Sequence

| | |
|---|---|
| **Owner** | `tools/album-builder.mjs` (hub, Phase 1 v1 — concurrent build). No existing agent owns sequencing; nearest personas are `starlight-sound-catalog` (release plan / version map) and `film-sync-composer` (hub — cue-arc thinking). The heuristic is specified in §4 so it lives in the tool, reviewable by those personas rather than duplicated into a new agent. |
| **Built** | Phase 1 v1: manifest assembly + basic ordering. |
| **Gap** | The full arc heuristic (§4): energy curve, key/mode adjacency, frequency journey, transition constraints. |
| **In** | Selected tracks with BPM, mode (where known), duration, energy proxy. |
| **Out** | Ordered `tracks[]` in the album manifest + an arc report (energy curve plot data, transition notes) for human review. |

### Stage 6 — Master-gate

| | |
|---|---|
| **Owner** | `music-mastering-qc` (FrankX, sonnet — wraps ffmpeg `loudnorm` + `ebur128`). |
| **Built** | Loudness/true-peak/DR gating is fully built, including the `--target-lufs <n>` override and genre-adjusted tolerances. |
| **Gap — two real ones** | (a) **Target conflict:** the agent defaults to the streaming standard (-14 LUFS, DR >= 8 LU); Arcanea canon mandates score-grade ~-18 to -16 LUFS for sync. Resolution: the album manifest declares a `masteringProfile` (`sync-score` -> `--target-lufs -17` window [-18,-16], `streaming` -> default -14) and the Album OS passes it explicitly on every dispatch. The agent already flags overrides in metadata, so recall stays clean. (b) **Frequency canon check:** CANON.md requires "frequency-spectrum check confirming presence of Guardian's Hz" in the master. Not built anywhere. Specified as an extension of the same ffmpeg wrap: narrow-band energy measurement at the Guardian frequency (and octave-down, e.g. 264 Hz for Alera's 528) vs. neighboring bands; verdict `present | weak | absent`. `absent` fails the canon gate — non-waivable per CANON.md. |
| **In** | Mastered audio + album `masteringProfile` + Guardian frequency. |
| **Out** | Per-track verdict block: `{ lufs, truePeak, dr, guardianHzVerdict, verdict: pass|warn|fail }` recorded in the album manifest. Release stages refuse on `fail`, mirroring the existing `music-release-manager` gate semantics. |

### Stage 7 — Cover / visual

| | |
|---|---|
| **Owner** | Per-Guardian visual DNA comes from CANON.md (palette, Godbeast, typography lock, banned styles). In the MIS registry the only visual agent is `music-video-batch` (FrankX, Remotion lyric videos — repo-internal). Cover *generation* is a **gap** at the hub level; the nearest existing capability is FrankX's visual pillar (`visual-design-gods` composer with `visual-brand-guidelines` as gate, in `FrankX/.claude/agents/`), which is outside the MIS registry today. |
| **Built** | `music-video-batch` for lyric/canvas videos. Per-Guardian reference-image sets are specified in CANON.md at `personas/<guardian>/assets/reference-images/`. |
| **Gap** | (a) Register the cover path: either add FrankX's visual composer to `registry/agents.json` as a cross-domain entry, or keep covers a documented manual step with a per-Guardian prompt brief generated from CANON.md's visual DNA. Recommendation: the brief-generation route first (cheap, no registry churn), registry entry only if cover volume justifies it. (b) Frequency-ripple visual element per CANON.md is a brief constraint, not tooling. |
| **In** | Album manifest (Guardian -> palette, Godbeast, typography) + reference set. |
| **Out** | `coverRef` per album + optional per-track canvas assets; banned-style checklist (no generic-fantasy painterly, no AI-slop fantasy) attached to the brief. |

### Stage 8 — Release-manifest, distribution, licensing

| | |
|---|---|
| **Owner** | Two worlds, per the swarm-orchestrator's disambiguation rule 1 — this is a real decision (§7 Q1). **Personal-catalog path:** `music-release-manager` (FrankX, opus) composing `music-mastering-qc` + `music-licensing` as gates, emitting per-platform metadata for Distrokid/Spotify/Apple/YouTube (Frank uploads manually; no API client yet). **Operated-label path:** `music-distributor` (Starlight music-is) with `music-curator` clearing first, `music-amplifier` for promotion, `royalty-architect` for the money layer. |
| **Built** | Both paths fully exist as agents. The release manager's refusal semantics (abort on QC fail / licensing needs-review) are exactly the gate contract the Album OS needs — reuse, don't rebuild. |
| **Gap** | (a) Album-level (multi-track) release manifests — the release manager is per-song today; the Album OS iterates it per track and aggregates into the album manifest, or the release manager grows a `tracks[]` batch mode (Next phase). (b) Sync-side: `starlight-sound-sync` (placement thesis, brief fit, rights pack, license economics) is the target for the canon's highest-leverage rail; needs the album manifest + per-Guardian theme framing as input. (c) Royalty cascade defaults from CANON.md (Composer 45 / Publisher 25 / Master 20 / Arcanea attribution 10) belong in the album manifest so `royalty-architect` reads them instead of re-deriving. |
| **In** | Album manifest with all gates green. |
| **Out** | Per-platform release metadata files + release manifest (`data/music-releases/<batch-id>/` shape already emitted by `music-release-manager`) + sync rights pack. |

### The album manifest — the spine data contract

`schemas/album.schema.json` (Phase 1, concurrent build) is the contract every stage reads and writes. This proposal specifies the fields the schema should converge on:

```
albumId            kebab-case slug (e.g. arcanea-vol-1)
label              label slug -> resolves to a CANON.md under verticals/music-is/labels/
guardians[]        1..n Guardian bindings (1 for a persona album; n for a frequency-suite compilation)
concept            one-paragraph album thesis
arcProfile         ramp | peak-valley | ladder | custom (see §4)
masteringProfile   sync-score | streaming (drives Stage 6 targets)
canon              { frequencyHz[], modes[], tempoBands[], vocalPosture } — denormalized from CANON at bind time, so the album is self-describing
tracks[]           ordered; each: { inventoryId, guardian, canonTag: {score, confidence, confirmedBy},
                   sequenceIndex, qc: {lufs, truePeak, dr, guardianHzVerdict, verdict},
                   status: candidate|selected|culled|mastered|released }
royaltyCascade     { composer, publisher, master, attribution } — defaults from label CANON
release            { platforms[], batchId, syncRightsPackRef, status }
visual             { coverRef, briefRef, paletteLock }
```

Track entries reference the catalog by `inventoryId` — the album manifest never duplicates track metadata the catalog owns (rule zero, again).

---

## 3. Canon-tagging design — how a track maps to a Guardian

Phase 1's `tag-arcanea-guardian.mjs` ships a metadata-driven v1. This section specifies the model it grows into. The Guardian table in CANON.md gives four measurable axes plus one lexical axis:

### 3.1 Scoring model

For each track T and each Guardian G, compute a weighted score in [0, 1]:

| Component | Weight (v2 starting point) | Signal | Source |
|---|---|---|---|
| **Lexical canon signal** | 0.30 | Guardian name, realm, Godbeast, archetype terms in title / prompt text / tags ("Alera", "Echo", "Whale Otome", "Voice Guardian") | Suno export metadata, catalog tags |
| **Frequency proximity** | 0.30 | Dominant sustained low-frequency component (pedal/drone) vs. G's Hz, with octave equivalence (528 counts if 264 or 132 dominates) and a log-scale distance falloff | ffmpeg spectral analysis (Stage 6 machinery reused pre-master) |
| **Mode match** | 0.20 | Detected or prompt-declared mode vs. G's modal preference (Alera/Aiyami Lydian, Draconia/Ino Phrygian, Maylinn/Leyla Dorian, Lyssandria Aeolian, Lyria Mixolydian, Elara mixture, Shinkami any) | Prompt text first (declared intent), audio key/mode detection later |
| **Tempo band** | 0.10 | BPM vs. G's plausible bands (Draconia/Aiyami extend into 130-160; most Guardians sit 70-130) | Prompt text or ffmpeg beat estimate |
| **Vocal posture** | 0.10 | Choral/languageless vs. lead-vocal vs. English-lyric pop. Alera uniquely permits lead vocal (sung mythic-cadence); English-lyric pop scores 0 for *every* Guardian — it is canon-refused | Prompt text + operator ear (v2); vocal classifier (Later) |

Weights are a starting hypothesis, not doctrine — they get tuned against the first human-confirmed album (the confirmations are the labeled dataset). The tool must print the per-component breakdown, never just the total, so a human can see *why* a binding was proposed (mirrors `music-mastering-qc`'s "exact deltas, never adjectives" discipline).

**Honest limitation, stated up front:** Suno exports carry no tuning metadata, and several signals (mode, vocal posture) are unreliable to extract from audio without dedicated MIR tooling. v1 therefore leans on lexical + prompt-declared signals, which is acceptable *because the same system generates the prompts*: `music-suno-prompt-architect` + `music-suno-mastery` (FrankX) can embed the Guardian anchor ("pedal at 528 Hz, Lydian, 86 BPM, choral languageless") in every Arcanea prompt going forward, making future tracks self-describing at intake. Canon-tagging is easiest when the generation side cooperates — close the loop at the prompt, not only at the analyzer.

### 3.2 Ambiguity and ties

- **Confident bind:** top score >= 0.65 AND margin over runner-up >= 0.15 -> propose as `confidence: high`.
- **Suggest:** top score >= 0.45 but margin < 0.15, or score in [0.45, 0.65) -> `confidence: suggest`, both candidates listed.
- **Cross-Guardian collaboration:** two Guardians both >= 0.60 within 0.10 of each other AND the lexical signal names both -> propose a dual binding (CANON.md explicitly allows two-Guardian releases with both named in metadata). Never inferred from score alone — lexical co-mention required.
- **Unmatched:** top score < 0.45 -> the track is not Arcanea-canon. Route: `releases-experimental` if the operator still wants it under the label umbrella, or plain catalog otherwise. Never force the nearest Guardian.

### 3.3 Human confirmation

No binding is final without a human. The tool writes a review file into the album directory (`albums/<albumId>/canon-review.md` — table of track, proposed Guardian, score breakdown, confidence, `[ ]` confirm checkbox); the operator edits it; a `--apply-review` pass writes confirmed bindings into the album manifest and emits the tag updates for `music-catalog-indexer` to fold into the catalog (the indexer owns the write — the tagger only proposes). Every confirmed binding records `confirmedBy` + `confirmedAt`. This mirrors the FrankX-wide anti-pattern rule: no silent classification, no auto-apply.

The existing 3 arcanea-tagged tracks go through this same flow retroactively — expected outcome per §1: at least one lands in `releases-experimental`, not the canon feed.

---

## 4. Album arc / sequencing intelligence

Sequencing is a designable heuristic, not ML. Inputs per track: BPM, mode, duration, Guardian Hz, and an energy proxy (short-term loudness range + spectral density from the Stage 6 measurements — no new tooling). Three composable layers:

### 4.1 Energy curve (primary)

The album declares an `arcProfile`:

- **`ramp`** — monotonic-ish rise: contemplative (70-90 BPM) -> heroic (90-130) -> peak, ending one step down. Default for a trailer-adjacent EP.
- **`peak-valley`** — classic film-score shape: open mid, dip to the contemplative core at ~40% duration, peak at ~75-85%, resolve quiet. Default for a per-Guardian album; matches the Zimmer/Djawadi reference triangle's build discipline in CANON.md.
- **`ladder`** — frequency journey (see 4.3). Only for multi-Guardian compilations.

Fit is scored by least-squares distance between the track-order energy sequence and the profile template; the tool proposes the best-fit order and prints the curve so a human can see it.

### 4.2 Adjacency constraints (hard + soft)

- **Hard:** no two tracks >= 150 BPM adjacent (battle-tier fatigue); opener must not be battle-band; closer must be contemplative or mid unless `arcProfile: ramp` says otherwise.
- **Soft (scored):** mode adjacency — prefer transitions that share a tonal center, move by fifth, or stay within the Guardian's modal family; penalize Lydian -> Phrygian hard cuts unless the energy curve calls for the contrast at the peak. Pedal-tone continuity: adjacent tracks whose Guardian Hz are in simple ratios (octave, fifth) transition more smoothly — this is where the Solfeggio ladder is musically real (ratio math), independent of any healing claims. Evidence framing per `research/METHODOLOGY.md` applies: state-change claims about frequency sequences carry their evidence grade; the *ratio* argument is plain acoustics.
- **Transitions:** vibe-os's ISO-principle transition logic (`generate_transition_prompt` in the vibe-os MCP server) is the existing formalization of "meet the listener where they are, move them gradually" — reuse it as the adjacency scorer's reference rather than inventing a second transition model.

### 4.3 Frequency journey (multi-Guardian compilations)

For a 10-Guardian suite (the CANON.md "10-frequency moat" album), the natural narrative arc is the ascending Solfeggio ladder: Lyssandria 174 -> Leyla 285 -> Draconia 396 -> Maylinn 417 -> Alera 528 -> Lyria 639 -> Aiyami 741 -> Elara 852 -> Ino 963 -> Shinkami 1111. The energy curve then has to be solved *within* that fixed order (choose which track per Guardian, not which order) — a useful constraint that keeps compilation sequencing tractable. Descending or hub-and-spoke (open and close on Alera) variants are operator choices in the album manifest, not tool improvisation.

---

## 5. Composition map — routing through the existing ecosystem

The Album OS is a *conductor*, not a new orchestra. Any agent dispatch goes through `swarm-orchestrator` (hub) / `tools/swarm-router.mjs` semantics: exact `canonical_source` handoffs, `portable: false` respected, three-worlds disambiguation applied.

```
                         ┌────────────────────────────────────┐
                         │            ALBUM OS (hub)          │
                         │  schemas/album.schema.json         │
                         │  tools/tag-arcanea-guardian.mjs    │
                         │  tools/album-builder.mjs           │
                         │  albums/<albumId>/  (manifests)    │
                         └───────┬───────────────┬────────────┘
                                 │ routes via    │ reads canon
                       ┌─────────▼──────────┐   ┌▼──────────────────────────┐
                       │ swarm-orchestrator │   │ Starlight music-is label  │
                       │ (hub, registry-    │   │ CANON.md (arcanea)        │
                       │  grounded routing) │   │ — never modified from hub │
                       └─┬─────┬─────┬─────┬┘   └───────────────────────────┘
             ┌───────────┘     │     │     └───────────────┐
   ┌─────────▼─────────┐ ┌─────▼─────────────┐ ┌───────────▼───────────────┐
   │ FrankX (pillar-2) │ │ Starlight music-is│ │ vibe-os (engine)          │
   │ catalog-indexer   │ │ music-curator     │ │ transition logic (ISO)    │
   │ suno-prompt-arch. │ │ persona-keeper    │ │ frequency-generator-pro   │
   │ suno-mastery      │ │ music-distributor │ │ vibe-os-mixer             │
   │ mastering-qc      │ │ music-amplifier   │ └───────────────────────────┘
   │ licensing         │ │ royalty-architect │ ┌───────────────────────────┐
   │ release-manager   │ │ music-archivist   │ │ Starlight sound-intel.    │
   │ video-batch       │ └───────────────────┘ │ starlight-sound-sync      │
   │ music-producer    │                       │ starlight-sound-catalog   │
   └───────────────────┘                       └───────────────────────────┘
```

Stage-by-agent composition (every agent below exists in `registry/agents.json`; FrankX paths under `FrankX/.claude/agents/`):

| Stage | Agent / tool | Repo | Role in the Album OS | New work needed |
|---|---|---|---|---|
| Intake | (operator + `docs/SUNO-INTAKE.md`) | hub | Drive pull, file hygiene | Drive automation (Next) |
| Catalog-register | `music-catalog-indexer` | FrankX | Owns catalog writes | none |
| Prompt-side canon loop | `music-suno-prompt-architect`, `music-suno-mastery` | FrankX | Embed Guardian anchors in every Arcanea prompt | Arcanea anchor template (Now — prompt content, not code) |
| Canon-tag | `tag-arcanea-guardian.mjs` + `music-curator` | hub + Starlight | Score + adjudicate bindings | §3 v2 model (Next) |
| Curate/cull | `music-curator` | Starlight (music-is) | A&R gate with album context | album-context brief (Next) |
| Persona continuity | `persona-keeper` | Starlight (music-is) | Guardian persona consistency across releases | none |
| Sequence | `album-builder.mjs` (heuristic reviewed by `film-sync-composer`, `starlight-sound-catalog`) | hub | §4 arc logic | §4 full heuristic (Next) |
| Master-gate | `music-mastering-qc` | FrankX | LUFS/TP/DR + Guardian-Hz check | `masteringProfile` dispatch convention (Now), Hz check (Next) |
| Cover/visual | brief generated from CANON.md; `music-video-batch` for canvas/lyric video | hub + FrankX | Per-Guardian visual brief | brief generator (Next) |
| Release | `music-release-manager` OR `music-distributor` (+ `music-curator` gate) | FrankX / Starlight | Per-platform manifests, gates enforced | album batch mode (Next); world decision (§7 Q1) |
| Licensing/sync | `music-licensing`, `starlight-sound-sync`, `royalty-architect` | FrankX / Starlight | License classification, rights pack, cascade | manifest-fed inputs (Next) |
| Amplify | `music-amplifier` | Starlight (music-is) | Promotion per CANON voice rules | none |
| Archive | `music-archivist` | Starlight (music-is) | Label catalog record | none |

What the Album OS deliberately does **not** build: a new producer agent (that is `music-producer`), a new QC engine (that is `music-mastering-qc`), a new release pipeline (that is `music-release-manager` / `music-distributor`), or any modification to Starlight substrate files (CANON.md is read-only from this hub, per ECOSYSTEM.md contract 1).

---

## 6. Phased roadmap

### Now — Phase 1 (concurrent Sonnet tooling, this PR window)

- `schemas/album.schema.json` — album manifest contract (spine of §2).
- `tools/tag-arcanea-guardian.mjs` — v1 canon-tagger (lexical + metadata scoring, review-file flow).
- `tools/album-builder.mjs` — v1 manifest assembly + basic ordering.
- `albums/arcanea-vol-1/` — first album directory, dog-fooding the schema.
- `docs/SUNO-INTAKE.md` — documented manual Drive intake.
- **Also Now, zero-code:** Arcanea prompt-anchor template for `music-suno-prompt-architect` dispatches (per-Guardian frequency/mode/tempo/vocal anchors straight from CANON.md), and the `masteringProfile -> --target-lufs` dispatch convention for `music-mastering-qc`.

**Unblock condition for Next:** Vol. 1 manifest exists with >= 8 human-confirmed canon bindings (this becomes the tuning dataset for §3 weights), and §7 Q1-Q3 answered by Frank.

### Next (after Vol. 1 assembles)

- Canon-tagger v2: spectral Guardian-Hz measurement (reusing the ffmpeg wrap), confidence tiers, `--apply-review`, weight tuning against confirmed bindings.
- Guardian-Hz presence check inside the master-gate stage (`present | weak | absent`, fail on absent).
- Sequencer v2: full §4 heuristic (arc profiles, adjacency scoring, curve report).
- Album-context brief for `music-curator`; album batch mode for `music-release-manager` (or a thin per-track iteration wrapper in the hub if FrankX-side changes are deferred).
- Cover-brief generator from CANON.md visual DNA (palette, Godbeast, typography lock, banned-style checklist).
- Drive intake automation (service-account pull or Drive MCP), registered in `registry/tools.json`.
- Validate: `validate-registry.mjs` extended to validate `albums/*/album.json` against the schema in CI.

**Unblock condition for Later:** Vol. 1 released through one of the two release worlds end-to-end; sync rights pack produced once.

### Later

- Audio MIR upgrades: key/mode detection and vocal-posture classification (requires a real MIR dependency — essentia/librosa-class tooling; decide build-vs-defer only after v2's prompt-declared signals prove insufficient).
- 10-Guardian frequency-suite compilation (`arcProfile: ladder`) once >= 5 Guardians have confirmed tracks.
- `music-catalog-mcp` (currently `status: specified` in `registry/tools.json`) grows album-aware queries ("all confirmed Alera tracks not yet on an album") — still blocked on data normalization per ROADMAP.md.
- Sync pitch automation via `starlight-sound-sync` fed directly from album manifests.

### Belongs in `roadmap/DEFERRED.md` (do not build now)

- **Automated Distrokid upload** — already flagged as future in `music-release-manager`; external side effect, keep manual per the hard-stops policy.
- **Suno API generation integration** — already deferred there; unchanged.
- **MIR dependency (key/mode/vocal detection)** — defer until prompt-declared signals measurably fail; adds a heavy native dependency to a currently zero-dependency hub.
- **Streaming + sync dual-master automation** (auto-rendering a -14 LUFS streaming master from the -17 sync master) — needs a remastering step the ecosystem deliberately doesn't automate (QC measures, never re-encodes); revisit if dual-format releases become routine.

---

## 7. Open questions — decisions for Frank

1. **Which world releases Arcanea albums?** Arcanea is a Starlight music-is *label*, but the catalog data, QC tooling, and release manager live in FrankX. Options: (a) FrankX pipeline executes, music-is agents gate (curator/persona-keeper/royalty-architect as advisory personas); (b) full music-is path with `music-distributor`, FrankX only supplying data. The swarm-orchestrator's rule 1 says these must not be cross-wired silently. Recommendation: (a) for Vol. 1 — the FrankX release manager's gate semantics are built and tested — with the album manifest recording the label context so migrating to (b) later is a routing change, not a data change.
2. **Single sync-grade master or dual masters?** Canon says -18 to -16 LUFS; streaming platforms normalize around -14. A -17 master survives streaming normalization (platforms turn quiet masters up less than they turn loud masters down, and dynamics are preserved). Recommendation: single sync-grade master for Arcanea; revisit only if streaming performance data argues otherwise.
3. **Vol. 1 concept:** single-Guardian Alera album (per CANON.md Phase 1 priority and the existing 528 Hz cluster) or a multi-Guardian sampler? Recommendation: Alera — the canon's own phase plan says so, and single-Guardian sequencing is the simpler first exercise of §4.
4. **Canon-gate strictness during retro-tagging:** CANON.md says frequency canon is refused at gate, non-waivable. For *existing* catalog tracks generated before any frequency discipline existed, do they (a) get retro-verified and mostly land in `releases-experimental`, or (b) get a grandfather window? Recommendation: (a) — the experimental sub-folder exists exactly for this, and a soft launch of the gate erodes it permanently.
5. **The 3 currently-tagged tracks:** "Arcanea (light me up)" (pop rock/soul, English lyrics) conflicts with canon vocal posture. Confirm it moves to `releases-experimental` (it keeps its published status and URL — hide from the canon feed, don't delete).
6. **Where does album state live long-term?** `albums/` in this hub (current Phase 1 choice) vs. `FrankX/data/`. Hub keeps the schema and its instances together and stays public/portable; FrankX keeps it next to the catalog. Recommendation: hub for manifests, FrankX for audio/release artifacts — matches the existing canonical-source contract.
7. **Human-confirm surface:** markdown review file in the album directory (Phase 1) vs. an admin surface on frankx.ai later. Markdown is enough until album throughput exceeds roughly one per month.
8. **Weight tuning ownership:** who signs off on §3 weight changes once confirmations accumulate — operator judgment per album, or a logged decision in the album manifest? Recommendation: log the weight vector used in every manifest so retro-analysis is possible either way.

---

*Composes with `ECOSYSTEM.md` (rule zero), `registry/agents.json` v1.0.0 (32 agents), `registry/tools.json` v1.0.0, `schemas/track-metadata.schema.json`, and the Arcanea label CANON at `Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md` (read-only from this hub). Phase 1 concrete layer built concurrently — see companion files listed in the header.*
