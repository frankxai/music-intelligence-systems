# Top-Voice Roadmap — the path to top-voice status in AI music

> Staged like `roadmap/ROADMAP.md`: each stage has a definition of done and an explicit unblock
> condition — the next stage doesn't start until the previous one's gate is green. Operating
> inputs: `docs/CREATOR-STRATEGY.md` (what to post and which agent executes it) and
> `data/creator-content-index.json` (what exists — the 2026-07-08 run: 414 items, 80
> music-related, zero canon-track posts). Offer sequencing follows D9 of
> `docs/L99-NORTH-STAR.md`; quality gates follow D10.

Last updated: 2026-07-08

---

## The honest dependency, stated up front

**Consistency beats virality.** Top-voice status in a niche this small is not one viral thread;
it's being the person who ships a track and two grounded posts every week for a year while everyone
else posts screenshots for a month and stops. The entire system — the swarm router, the album
pipeline, the take-log, the content agents — exists for exactly one strategic reason: **to make
weekly shipping near-zero-friction** so the cadence survives busy weeks. If a stage below feels
blocked, the fix is almost always "reduce the friction of the loop," not "post harder."

Second honest dependency: per the L99 scorecard, Product & GTM currently grades **D+** — real IP,
pre-revenue, zero finished canon tracks. This roadmap starts from that truth, not from the
ambition.

---

## Stage 0 — Proof (one canon track + one build-log post)

*You cannot be a voice in AI music without one finished artifact that demonstrates the whole claim.*

**Ship:**
- **One canon-compliant Arcanea track, end to end.** Per D9(3), this is "the case study everything
  else sells on." The slot already exists: `albums/arcanea-vol-1/album.json` has "Alera — Theme
  No. 1" specified at 528 Hz, Lydian, 86 BPM — the exact worked example from CANON.md. Run it
  through the full pipeline: prompt pack → Suno session (WORKFLOW.md Loop A) → intake →
  Guardian-tag → mastering QC (LUFS window per `schemas/album.schema.json`) → release gate.
- **One build-log post about making it.** `/build-log` on the session that produced the track —
  the MDX log + LinkedIn draft come out of the same command. Archetype 1 + 2 in a single artifact:
  the track proves the music, the post proves the system.
- **The Suno craft cluster keeps running** (archetype 3) — it needs no unblock and feeds SEO while
  Stage 0 completes.

**Definition of done:** the track is published on a real surface (Suno public / streaming), its
`album.json` entry flips to `published` with a Guardian binding, and the build-log post is live on
frankx.ai.

**Unblocks Stage 1 when:** the loop has been run once, end to end, with the take-log and
processed-ledger artifacts actually written — proving the weekly rhythm is mechanical, not
aspirational.

---

## Stage 1 — Rhythm (the weekly ship)

*One track + two posts, every week, using the daily operating loop.*

**Ship, weekly:**
- 1 track through the pipeline (not necessarily canon — catalog and craft tracks count).
- 2 posts from the archetype grid in `docs/CREATOR-STRATEGY.md` (the Mon–Sun cadence table).
- The daily music loop is WORKFLOW.md **Loop C** (morning prompt-pack → generation session →
  post-session pipeline → human gate). Note: no `/daily-music` command is registered yet — if the
  loop earns a front door, it needs a `BRAND-MAP.md` row and a D8 review first; until then Loop C
  runs by its written procedure.
- Sunday review closes the learning loop: re-run `tools/index-creator-content.mjs`, feed reply
  data into hook-learn, log take-log verdicts.

**Definition of done:** 8 consecutive weeks at floor cadence (8+ tracks, 16+ posts), with the
misses logged honestly — a skipped week that's recorded is data; a skipped week that's hidden is
drift.

**Unblocks Stage 2 when:** the 8-week streak holds AND the friction log shows the loop costs
Frank ≤ 2 focused sessions/week (taste + publish). If it costs more, fix the pipeline (P0/P1
backlog in L99) before scaling volume.

---

## Stage 2 — Authority (the album + the system-in-public series)

*From "ships tracks" to "the person who built the machine."*

**Ship:**
- **Arcanea, Vol. 1 completed** — the remaining Guardian-bound slots (Lyssandria 174 Hz Aeolian,
  Maylinn 417 Hz Dorian, per `albums/arcanea-vol-1/album.json`) plus enough canon tracks for a
  coherent release, sequenced and mastered through the album pipeline. The album is the proof at
  scale; canon/lore posts (archetype 4) finally have something to point at.
- **The system-in-public series** — a numbered build-log series (the swarm router, the Guardian
  tagger, the eval rubrics, the take-log learning loop), one component per post, each with the
  Mermaid diagram `/build-log` already emits. This is the moat content: reproducible by nobody
  who hasn't built the system.
- **Free templates funnel growth** — `/music/templates` (8 free Suno prompts today) grows on the
  back of craft posts; every craft post links the templates page, every template update is a post.
  Track template-page traffic as the Stage 2 metric that matters.

**Definition of done:** album released; ≥ 6 system-in-public posts live; templates funnel showing
week-over-week growth in the ledger (measured, not felt).

**Unblocks Stage 3 when:** the funnel demonstrably delivers an audience that *asks for more*
(replies, DMs, email signups logged in Sunday reviews) — monetizing before demand exists is how
the L99 audit found a paid-product page contradicting a free one.

---

## Stage 3 — Monetization (the Producer Pack)

*Sell to the audience the funnel built — per the D9 offer ladder, in order.*

**Ship:**
- **Vibe OS Producer Pack, $27–37, via the proven Gumroad pattern** — Independent Producers ICP
  only (`docs/AUDIENCES.md` #1). The pack productizes what the craft posts teach: prompt
  architectures, state-design templates, mastering targets.
- Precondition from D9(1), still open: Frank resolves the `/products/vibe-os` identity collision
  (free Notion tracker vs. paid Suno toolkit) before the pack ships — the funnel can't convert
  through a contradictory page.
- Proof/metrics posts (archetype 5) now include sales data, under the Metrics Truth Rule —
  "first 30 days: N sales as of [date]" or nothing.
- **Later, not now:** the album-pipeline workflow priced in the existing $297–997 band, per D9(4).
  Never SaaS subscription tiers for a product with no backend.

**Definition of done:** Producer Pack live at one canonical URL (BRAND-MAP gate), first cohort of
real sales in the ledger, refund/feedback loop feeding the next edition.

**Unblocks Stage 4 when:** revenue is recurring enough to prove the ladder works (multiple months
of sales, not a launch spike), and the weekly cadence *survived* the launch — a launch that broke
the rhythm failed the real test.

---

## Stage 4 — Platform (what top-voice actually means)

*The stage that cannot be scheduled, only earned.*

Top-voice status is an outcome metric, not a deliverable. Define it so it's checkable — and be
explicit: **as of 2026-07-08, none of these are achieved, and no current number should be cited
as progress toward them without a `metrics/current.json` entry:**

- **Citation:** AI-music roundups, newsletters, and AI search surfaces (ChatGPT/Perplexity/Claude)
  cite Frank's craft posts as the reference for Suno prompt engineering / agentic music pipelines.
- **Inbound:** platforms, tool vendors, or labels reach out (sync briefs, partnership asks,
  speaking) rather than the reverse.
- **Community gravity:** other builders' posts reference the system unprompted; the reply-first
  loop inverts (they reply to Frank first).
- **Distribution floor:** an owned-audience number (email list from the templates funnel) that
  makes any single platform's algorithm irrelevant — the threshold gets set in the ledger when
  Stage 2 data exists, not invented here.

**What Stage 4 changes operationally:** nothing. The weekly loop continues; the archetype mix
shifts toward canon and proof posts because the audience arrived for the system. If reaching
Stage 4 requires abandoning the cadence for chase-the-algorithm content, the definition above was
violated and the stage isn't real.

---

## Standing gates (every stage, from D10)

Every shipped artifact — track or post — passes its gate: `@integrity-guard` before publish,
mastering QC before release, Metrics Truth Rule before any number, `BRAND-MAP.md` before any new
name, human gate before anything goes public. The excellence layer is not a stage; it's the floor
all stages stand on.

## Review cadence

Re-grade this roadmap monthly against the index (`node tools/index-creator-content.mjs`) and the
L99 scorecard. A stage that hasn't moved in two review cycles gets a friction audit, not a pep
talk.
