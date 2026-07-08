# Media Tooling Doctrine — which engine for which job, and why

> The tool-routing policy for the agentic music system. Decided once, at brief time, by rule — not
> ad hoc per asset. Consumed by `@music-brief-writer` (sets `tool` per asset in the brief) and any
> future `media-router`. Companion to `AGENTIC-MUSIC-INTELLIGENCE-BLUEPRINT.md`.

Last updated: 2026-07-07

---

## The one principle

**Native CLI is the default. Reach for a frontier MCP (Higgsfield) only for the three things native
genuinely can't do. Gate every output the same way regardless of engine.**

Why native-default (all four are real, not ideology):
- **Cost** — native = compute only (≈ free). Higgsfield = credits per generation. Reserve credits for hero assets.
- **Determinism + brand-lock** — code-composed (Remotion) and gated (nb-generate's design-thinking gate) hit exact brand tokens every render. Frontier models drift shot to shot.
- **Volume** — 12k catalog lyric videos = Remotion loop, not 12k Higgsfield credits.
- **Durability** — native scripts don't break when an external service changes its API or drops. (Higgsfield MCP disconnected repeatedly during this very session — that is the durability argument, demonstrated.)

The three things that justify frontier (Higgsfield), and *only* these:
1. **Character consistency across a set** — a Guardian's face/form identical across all their releases. Higgsfield Soul `create_character` → reuse the character id. Native NB2 can't hold identity across generations.
2. **Real cinematic motion** — image→video with physical camera/motion realism (Kling/Veo/Hailuo). For a flagship trailer, not every track.
3. **Shots native can't fake** — product-photoshoot realism, motion-control/puppeteer, outpaint/reframe of frontier footage.

Everything else — most stills, all batch lyric videos, all frequency audio, all mastering — is native.

Note on quality: native is **not** "the cheap lower-tier." NB2 (`gemini-3.1-flash-image`) is frontier-grade
for stills; its only real gap vs. Higgsfield Soul is *identity persistence across a set*. So most cover
iterations should run on `nb-generate` and only escalate to Soul when a Guardian's visual identity must
lock across multiple releases.

---

## Decision matrix

| Job | Default engine | Escalate to frontier when… | Gate (always) |
|---|---|---|---|
| Cover iterations / concepts | `nb-generate --model nb2` | Guardian identity must persist across releases → Higgsfield Soul (`create_character`) | visual-creation-council + visual-brand-guidelines |
| Final hero cover (flagship Guardian) | Higgsfield Soul (locked character) | — (this is already the frontier case) | same gate + `@visual-book-cover` typography overlay |
| Batch lyric videos (catalog scale) | Remotion (`music-video-batch`) | never — volume kills credits | brand-guidelines |
| Flagship cinematic video / trailer | Higgsfield (Kling/Veo, image→video from cover) | this IS the frontier case | virality_predictor pre-publish |
| Social shorts / clips | Remotion or Descript cut | motion B-roll needed → Higgsfield shorts | brand-guidelines |
| Frequency / healing audio | vibe-os `frequency-generator-pro.py` (native) | never — deterministic synthesis | — |
| Mastering | ffmpeg (`@music-mastering-qc`, -16 LUFS sync) | never | LUFS gate is the gate |
| Audio edit / captions / Studio Sound | Descript MCP | — | — |
| Music generation itself | Suno (human + Cowork browser) | — | canon fit + mastering-QC |

---

## Per-asset routing for one album track (the concrete flow)

```
approved track (Suno → Drive)
        │
        ▼  brief-writer sets tool per asset from this doctrine
  ┌─────────────────────────────────────────────────────────┐
  │ cover        → nb-generate nb2  (Soul only if Guardian    │
  │                 identity must lock across releases)        │
  │ lyric video  → Remotion (music-video-batch)               │
  │ hero video   → Higgsfield Kling/Veo  ONLY if flagship      │
  │ freq layer   → vibe-os frequency-generator-pro (if track   │
  │                 is a healing/frequency release)            │
  │ master       → ffmpeg -16 LUFS                             │
  └─────────────────────────────────────────────────────────┘
        │  every visual walks the SAME brand + council gate
        ▼
  release-ready asset set
```

Engine choice is orthogonal to the brand gate: native and frontier outputs both pass
`@visual-creation-council` + `@visual-brand-guidelines`. Brand-lock is enforced at the gate, never
assumed from the engine.

---

## Best music FIRST, then best tooling (the order is load-bearing)

Visuals serve approved music; they never lead. The music-quality loop, in order:

1. **Canon is the taste anchor.** Guardian frequency / mode / tempo band / vocal posture (choral,
   languageless) is the bar every take is judged against. Off-canon = culled, not fixed.
2. **Tight Suno iteration** (Cowork drives): generate variations, A/B against canon, keep only fits.
3. **Mastering-QC gate** — ffmpeg, -18 to -16 LUFS sync-grade (overrides the generic -14 streaming default).
4. **Keep-rate learning** — the take-log records which prompts produced approved takes; that biases the
   next prompt-pack. The music itself gets better at *Frank's* sound every cycle. This is the flywheel
   that makes it "intelligence," not a pipeline.
5. **Self-describing generation** — `@music-suno-prompt-architect` embeds per-Guardian frequency/mode
   anchors in the prompt, so returning tracks carry their own tagging metadata (Suno exports don't).

Only once a track clears this loop does the visual/video routing above fire.

---

## Long-term: decide at brief time, route by policy

- The **brief** (`@music-brief-writer`, module 8) writes a `tool` field per asset using this doctrine —
  so the engine is chosen once, by rule, at approval, and every downstream generator just reads it.
- A future **`media-router`** (sibling to `tools/swarm-router.mjs`) can encode this matrix as code:
  input an asset request, output the engine + gate. Same deterministic-routing pattern as the
  swarm-router already shipped.
- **Credits governance:** frontier calls (Higgsfield) are logged and reserved for hero/flagship assets;
  a budget guard warns when a batch would route volume work to a credit-metered engine (an anti-pattern).
- **New-engine rule:** do not add a new generator without a job the current stack (NB2 · Higgsfield ·
  Remotion · Descript · vibe-os · ffmpeg) genuinely can't cover. The surface is covered; additions must
  justify against this matrix.

---

## Cost & token notes

- Native generation = a bash/CLI call: cheap in both money and agent tokens.
- Frontier MCP generation = credits + async polling loops = more tokens and real spend. Worth it for
  the ≤3 justified cases, wasteful anywhere else.
- This is the same governance stance as the browser doctrine in the blueprint: spend the expensive
  resource only where it's the only thing that works.
