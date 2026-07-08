# Music Intelligence eval rubrics

> Scoring rubrics for the eval harness at `evals/music/score.mjs`. Purpose: "test which models and
> process steps are best, eval and optimize" — per `WORKFLOW.md` Loop D. Every rubric here is
> grounded in an existing doc or tool in this repo; none of it invents a new agent, tool, or metric
> that doesn't already have a documented basis.

## (a) Canon-fit — how well a track fits its claimed Guardian, 0–100

Scores a track descriptor against **one named Guardian** on the same four signals
`tools/tag-arcanea-guardian.mjs` uses to rank *all ten* Guardians for an unbound track: frequency
proximity, mode match, tempo-band fit, and vocal-posture overlap. Same math, different question —
the tagger asks "which Guardian fits best?"; this rubric asks "does this track actually fit the
Guardian it's tagged with?" (the question a pre-release QC pass needs).

| Component | Max points | Signal |
|---|---|---|
| Frequency proximity | 50 | Track's dominant/tuned frequency vs. the Guardian's canonical Solfeggio Hz (`data/arcanea-guardians.json`), log-scale falloff to 200 Hz distance |
| Mode match | 20–30 | Track's mode vs. the Guardian's `modePreference` (30 for a direct match; 20–22 for Guardians whose canon preference is "all modes" or "modal mixture") |
| Tempo-band fit | 0–15 | Track's BPM vs. the Guardian's `tempoBandBpm`, where canon states one (only Draconia and Aiyami have a stated band; Guardians without one score 0 on this axis for every track — that's a canon fact, not a scoring bug) |
| Vocal-posture overlap | 0–5 | Keyword overlap between the track's described vocal posture and the Guardian's `voiceTone` |

**Total: 0–100.** Grading bands used by this harness (defined for this eval, not the same as the
0–1 confidence tiers in `docs/engineering/2026-07-album-os.md` §3.2, which score a different
ranking question against all ten Guardians at once):

- **65–100 — on-canon.** Strong fit; safe to sequence into the named Guardian's album.
- **40–64 — marginal.** Some real signal but incomplete data or a partial mismatch; listen before
  sequencing.
- **0–39 — off-canon.** Per CANON.md, a track this far off its claimed Guardian should not ship
  under that Guardian's name — route to `releases-experimental` or re-tag, per
  `docs/engineering/2026-07-album-os.md` §3.3.

## (b) Mastering pass — LUFS-integrated gate

Arcanea's sync-grade mastering target is -18 to -16 LUFS integrated (`schemas/album.schema.json`
`masteringTarget.lufsIntegrated`, and `albums/arcanea-vol-1/album.json` as the concrete instance).
This is a different target from the generic streaming default (-14 LUFS) that `music-mastering-qc`
uses when no album-level override is set — see
`docs/engineering/2026-07-album-os.md` §2 Stage 6 for the conflict and the resolution
(`masteringProfile` field dispatches the right target).

| Verdict | Condition |
|---|---|
| **pass** | Measured LUFS-integrated falls inside the target window (default [-18, -16]) |
| **warn** | Within 1 LU of the window on either side |
| **fail** | More than 1 LU outside the window on either side |

The harness does not gate on true-peak or dynamic-range numbers here — CANON.md states the mastering
posture as "dynamic-range-protected" without a specific DR figure, and inventing one would be exactly
the kind of unsupported metric this harness is meant to avoid. If/when a specific true-peak or DR
threshold is documented, add it as a second axis rather than guessing one now.

## (c) Cover brand-gate — checklist pass

Every visual asset walks the same brand gate regardless of which engine produced it
(`docs/MEDIA-TOOLING-DOCTRINE.md` "Engine choice is orthogonal to the brand gate"). For an Arcanea
cover specifically, the checklist items come from `docs/engineering/2026-07-album-os.md` §2 Stage 7
(cover/visual):

| Check | Source |
|---|---|
| `paletteMatch` | Cover uses the claimed Guardian's canonical palette (`data/arcanea-guardians.json` `.palette`) |
| `typographyLock` | Title typography follows the label's typography lock (Album OS §2 Stage 7) |
| `bannedStyleClean` | Avoids the CANON banned-style list: no generic-fantasy painterly look, no AI-slop fantasy (Album OS §2 Stage 7) |
| `godbeastPresent` | Guardian's Godbeast motif is present, where the Guardian's visual DNA calls for one (optional — not every context requires it; mark `n/a` if not applicable rather than failing on it) |

**Verdict:** `pass` only if every non-`n/a` check is `true`. Any `false` check fails the gate with
the specific check named — mirrors the "exact deltas, never adjectives" discipline already used by
`music-mastering-qc`.

## (d) Model A/B comparison template

For a genuine engine decision — e.g. nb2 vs. a higher-tier NB model vs. Higgsfield Soul for a cover;
Remotion vs. Higgsfield Kling for a video — the harness does not simulate quality, because doing so
would be exactly the "invented metric" anti-pattern this task disclaims. Instead it prints a
comparison template with the columns a real decision needs:

| Column | Filled by |
|---|---|
| Engine | You (candidate engines under comparison) |
| Cost | The harness, where `docs/MEDIA-TOOLING-DOCTRINE.md` states it (native = compute-only/≈free; Higgsfield/frontier = credits per generation, metered) — otherwise left blank |
| Quality (1–5) | Human or LLM judge, after generating the actual candidates |
| Brand-fit (1–5) | Human or LLM judge against the checklist in (c), or the analogous canon-fit rubric in (a) for audio |
| Notes | Judge's rationale |

This mirrors `docs/MEDIA-TOOLING-DOCTRINE.md`'s own decision matrix shape (job → default engine →
escalation trigger → gate) — the template just gives you blank cells for the specific candidates you
are actually testing, rather than re-deriving the matrix by hand every time.

**Honest limitation:** this rubric cannot be scored deterministically. There is no live-generation
comparison in this harness — see `evals/music/README.md`.
