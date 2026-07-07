# Agentic Music Intelligence System — Master Blueprint

> The complete value chain: from "what should I make" through generation, approval, visuals,
> publishing, and monetization — built as composable modules, not a monolith. This doc is the
> umbrella that ties together the Suno-bridge proposal (`vibe-os/docs/engineering/2026-07-suno-ecosystem-bridge.md`)
> and the Album OS proposal (`docs/engineering/2026-07-album-os.md`), and extends past album
> assembly into distribution and monetization.

Last updated: 2026-07-07

---

## 1. The honest boundary map (read first)

An "agentic music intelligence system" spans work done by three different actors. Confusing them is
the main way these systems fail, so name them explicitly:

| Actor | What it is | Can it see your live Suno tab? | Token cost |
|---|---|---|---|
| **Claude Code** (this session) | Headless agent with filesystem, git, Drive MCP, subagent swarms | No | Cheap per file op; no vision cost |
| **Claude-in-Chrome** | Separate Claude agent running in your logged-in browser | Yes — it's the only one that can | Vision-heavy; scales with observation frequency |
| **Container Playwright** | Fresh headless Chromium in the cloud sandbox | No (not your session, not logged in) | Cheap if reading structured DOM; expensive on screenshots |

**The two agents don't share a context.** The only channel between Claude Code and Claude-in-Chrome
is shared state on disk / Drive. That's not a limitation to route around — it's the architecture.
Each does what it's shaped for, and the handoff between them is a small structured file.

### Token governance (the rule that keeps this affordable)

Live browser observation is the most expensive operation available:
- A screenshot to the model: ~1,000–1,600 tokens each.
- A full DOM / accessibility snapshot of a page as heavy as Suno: 2,000–10,000+ tokens.
- A continuous "watch what Frank does" loop: 100k+ tokens/session, most of it re-reading the same page.
- Reading an exported track's metadata from Drive: a few hundred tokens, once.

**Rule: capture at checkpoints, never observe continuously.** The one moment worth capturing is
*song approval*. Everything downstream keys off that single structured event, not off a screen-watching
loop. This is 100–1000x cheaper and loses nothing that matters.

---

## 2. The value chain as modules

Twelve modules. Each is independently useful, has a clear owner, and a data contract in/out. Built
ones are marked; the rest are the roadmap.

```
  INTELLIGENCE        GENERATION         POST-APPROVAL           DISTRIBUTION        MONETIZATION
  ┌──────────┐        ┌──────────┐       ┌──────────────┐        ┌──────────┐        ┌──────────┐
  │ 1 Ideate │───────▶│ 2 Generate│──────▶│ 4 Catalog    │───────▶│ 9 Publish│───────▶│11 Monetize│
  │ 3 Prompt │        │  (Suno,   │       │ 5 Canon-tag  │        │ (Spotify,│        │ (stream, │
  │  science │        │   Chrome  │       │ 6 QC/master  │        │  Apple,  │        │  sync,   │
  └──────────┘        │   loop)   │       │ 7 Sequence   │        │  YT,     │        │  NFT,    │
        │             └──────────┘       │ 8 BRIEF ★    │        │  social) │        │  ads,    │
        │                   │            └──────────────┘        └──────────┘        │  products)│
        │                   ▼                    │                     │             └──────────┘
        │            ┌──────────┐                ▼                     │                   │
        └───────────▶│ 3 Capture│         ┌──────────────┐            │                   │
          learning   │ (Drive   │         │ Cover + Video │◀───brief──┘                   │
          loop ◀─────│  intake) │         │  generation   │                               │
          (12)       └──────────┘         └──────────────┘◀──────────performance data─────┘
```

### Module inventory

| # | Module | Owner (real, existing unless noted) | Status |
|---|---|---|---|
| 1 | **Ideate** — what to make | `vibe-os` states + Arcanea CANON.md + trend intel (Xpoz/Semrush/Sandcastles skills) | Partly built |
| 2 | **Generate** — make the track | Suno (human) + Claude-in-Chrome live loop | Manual; loop = design |
| 3 | **Capture** — durable intake | Drive folder "Arcanea Music — Suno Intake" (`1iF8qP5m31K6X7WfbCof6dOBQdlfes-aB`) | **Built** |
| 4 | **Catalog** — index the take | `@music-catalog-indexer` (FrankX) | Built |
| 5 | **Canon-tag** — bind to Guardian | `tag-arcanea-guardian.mjs` + `data/arcanea-guardians.json` (MIS) | **Built this session** |
| 6 | **QC / master** — sync-grade gate | `@music-mastering-qc` (ffmpeg LUFS) | Built |
| 7 | **Sequence** — album arc | `album-builder.mjs` + `album.schema.json` (MIS) | **Built this session** |
| 8 | **Brief ★** — approval → structured brief | NEW — the missing hinge (see §3) | **Not built — priority 1** |
| 9 | **Cover + Video** | Higgsfield MCP, `@visual-*` agents, `music-video-batch` (Remotion) | Built, not brief-wired |
| 10 | **Publish** | `@music-release-manager` (Distrokid→Spotify/Apple/YT) | Built |
| 11 | **Distribute (social)** | Content Ops L4–L5, `postiz-distributor`, `@content-social-distributor` | Built, not music-wired |
| 12 | **Monetize** | streaming + `@music-licensing` (sync) + products + NFT (net-new) + ads | Mixed (see §5) |
| — | **Learn loop** | `hook-learn`, take-log keep-rate → biases module 1/3 | Design |

The point: **most of the chain already exists.** The gap isn't generation or publishing — it's the
**brief (module 8)** that connects an approved song to everything visual and commercial downstream.

---

## 3. The hinge: approval → brief (build this first, and why)

When you approve a song, that decision carries everything the rest of the pipeline needs — but today
it evaporates. The brief captures it once, as a structured file, and every downstream module reads it.

**What triggers it:** you approve a take (in Chrome, or by dropping it in the Drive folder and saying
"approve"). Not continuous watching — one checkpoint event.

**What the brief contains** (the contract):
```
brief:
  track: { title, sunoId?, guardian, frequencyHz, bpm, key, mode, durationSec, lyricsTheme }
  approvedAt, approvedBy
  intent: { album?, single?, sync-target?, mood, audience }
  visual: { palette (from Guardian), cover-concept, character/Guardian-visual-ref }
  video: { type: lyric|cinematic|loop, energy-curve, key-moments }
  distribution: { platforms[], release-window, licensing-posture }
  monetization: { streaming, sync-pitch?, nft?, product-bundle?, ad-use? }
```

**Why first:** cover (9), video (9), publish (10), social (11), and monetize (12) all read the brief.
Build it and five downstream modules light up at once. Skip it and every downstream step re-derives
the same context by hand, every time. It's the highest-leverage single build in the whole system.

**Owner:** a new `@music-brief-writer` agent (FrankX), auto-invoked on approval, writing
`briefs/<track-slug>.yaml` into the album folder. Composes the Guardian data (module 5) + CANON.md
visual/voice DNA to pre-fill the visual/palette fields automatically.

---

## 4. The ordered roadmap — what, in which order, and why

Each phase has an unblock condition. Don't start a phase until its predecessor's condition is met —
that's what stops this from becoming 40 half-built features.

### Phase 0 — NOW (foundation, mostly done)
- ✅ Drive intake bridge, Guardian tagger, album-builder, `/album` command, two engineering specs.
- **Remaining:** the approval→brief hinge (module 8). **This is the one thing to build next.**
- Unblock to Phase 1: brief schema exists + one real brief generated from one approved track.

### Phase 1 — Visual generation, brief-wired
- Wire cover art (Higgsfield Soul / NB2, per-Guardian palette from the brief) and lyric/cinematic
  video (`music-video-batch` Remotion + Higgsfield) to read the brief automatically.
- Why here: visuals are worthless without an approved track + brief; pointless before Phase 0.
- Unblock to Phase 2: one approved track → auto-generated cover + video from its brief.

### Phase 2 — Publish + distribute
- Wire `@music-release-manager` (Distrokid → Spotify/Apple/YT) and social fan-out
  (`postiz-distributor`, Content Ops L5) to consume the brief's distribution block.
- Why here: you only publish finished, visualized tracks. Requires Phases 0–1.
- Unblock to Phase 3: one track released to one platform + one social variant, from its brief.

### Phase 3 — Monetization modules
- Sync licensing (`@music-licensing` — the Arcanea cinematic/-16 LUFS catalog is *built for* film/TV/game sync; this is the highest-value near-term revenue).
- Products (album as a product via `product-engine`; vibe-os MCP as a tool product).
- NFT / ads / advanced — net-new, gated (see §5).
- Why last: monetization compounds on a catalog that's already produced, visualized, and distributed.

### The learning loop (runs continuously once Phase 2 ships)
- Performance data (streams, keeps, social engagement) → `hook-learn` / take-log keep-rate → biases
  module 1 (what to make) and module 3 (prompt science). The system gets better at *your* sound
  every cycle. This is what makes it "intelligence" and not just a pipeline.

---

## 5. Monetization surfaces — honest status

| Surface | Mechanism | Status | Note |
|---|---|---|---|
| **Streaming** | Distrokid → Spotify/Apple/YT | Built (`@music-release-manager`) | Baseline; low per-stream |
| **Sync licensing** | Pitch to film/TV/game/ad music supervisors | Built (`@music-licensing`) | **Highest near-term value** — Arcanea's cinematic/-16 LUFS canon is sync-native |
| **Products** | Album/stems/preset packs on Gumroad/site | Skill exists (`product-engine`) | Not music-wired yet |
| **Ads** | Own-content soundtrack + licensed ad use | Partial | Feeds Content Ops; brief's `ad-use` flag |
| **NFT** | On-chain music/1-of-1/editions | **Net-new** | No music-NFT pipeline exists. Starlight has a `crypto-intelligence` skill (v0.1 proof-of-pattern only). Treat as a gated Phase-3+ experiment with an explicit go/no-go, not a default. |

**Recommendation on NFT specifically:** don't build it speculatively. The value chain earns more,
sooner, from **sync licensing** (a single placement can outearn thousands of NFT-mint attempts, with
no gas/market/regulatory risk). Build NFT only if a specific drop has a specific audience already
asking for it. Documented here as a real option with an honest cost, not hype.

---

## 6. Productization — modules become sellable workflows

Each module is also a product, which is the whole "genius" of building it modular:

| Module(s) | Product form | Buyer |
|---|---|---|
| 1, 3 (ideate + prompt) | vibe-os MCP + Suno prompt packs | Producers, on frankx.ai |
| 5, 7 (tag + sequence) | Album OS — the canon-driven album pipeline as a workflow product | Labels, serious indie artists |
| 8, 9 (brief + visuals) | "Approve → full campaign" one-click kit | Creators |
| Whole chain | Agentic Music Intelligence System — the flagship | The ecosystem itself |

The album you make with it becomes the proof; the system that made it becomes the product. Same
pattern as Library OS: build the tool by using it, then sell the tool.

---

## 7. The Frank ⇄ Suno ⇄ ecosystem loop (day in the life)

```
  YOU (taste + 2 clicks)          CLAUDE-IN-CHROME               CLAUDE CODE + SWARM
  ─────────────────────           ────────────────               ───────────────────
  "make an Alera track"  ──────▶  reads prompt-pack from Drive
                                  fills Suno, hits generate
  listen, approve one    ──────▶  captures approval → writes
                                  brief + take-log to Drive
                                                       │
                                                       ▼
                                          Claude Code picks up brief
                                          ├─ catalog + canon-tag (auto)
                                          ├─ mastering-QC gate
                                          ├─ cover + video from brief (swarm, parallel)
                                          ├─ sequence into album
                                          └─ publish + social + sync-pitch
  review release manifest ◀───────────────────────────────────────┘
  approve to ship        ──────▶  (human gate — nothing auto-publishes)
```

You do taste and two clicks. The Chrome agent does the Suno mechanics and the approval capture. Claude
Code + swarm does everything after. The handoff is always a small file, never a live feed.

---

## 8. Open decisions (yours)

1. **Brief trigger** — approve in Chrome (needs the Chrome agent to write the brief), or drop-in-Drive
   + "approve" here (simpler, no Chrome dependency)? The second is cheaper and works today.
2. **Legacy tracks** — the 3 existing "arcanea" tracks are English-lyric pop-rock, off-canon. In or out
   of Vol. 1? (Album OS spec, open Q5.)
3. **First monetization focus** — confirm sync licensing as the Phase-3 lead over NFT/products.
4. **Watch-folder** — set up Drive-for-Desktop on your machine to auto-sync Suno downloads (kills the
   manual drag step)? (Suno-bridge spec, open Q4.)
5. **NFT go/no-go** — park entirely until a specific drop demands it, or scope a v0.1 experiment now?

---

## 9. Next action

The single highest-leverage build is **module 8, the approval→brief hinge** — it unlocks five
downstream modules and is the thing that turns the built foundation into a working end-to-end system.
Recommend building it next as `@music-brief-writer` + a `briefs/` contract, then wiring Phase-1 visual
generation to read it.
