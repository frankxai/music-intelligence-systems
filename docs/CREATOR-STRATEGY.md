# Creator Strategy — the music-creator social playbook

> What Frank posts, where, how often, and which agent executes it. Companion to
> `docs/TOP-VOICE-ROADMAP.md` (the staged path) and `data/creator-content-index.json`
> (what already exists — regenerate with `node tools/index-creator-content.mjs`).
> Voice contract: FrankX brand voice (`FrankX/CLAUDE.md` — lead with results, precise technical
> language, show don't tell, no guru tone). Naming contract: `BRAND-MAP.md`. Claims contract:
> the Metrics Truth Rule (`Starlight-Intelligence-System/CLAUDE.md`).

Last updated: 2026-07-08

---

## Positioning — the one sentence

**The AI architect who makes music.** Not a musician who discovered AI, not an AI influencer who
dabbles in Suno — an enterprise-grade systems builder who turned a multi-thousand-track Suno
practice into an agentic production pipeline, and shows the pipeline. The differentiator is the
*system*, demonstrated through the *music*. Every post is one of those two things or it doesn't ship.

What the index says today (2026-07-08 run): 414 items across three surfaces, 80 music-related —
57 blog posts and 23 live music routes. The Suno craft-teaching cluster already exists
(prompt-engineering guide, Suno-vs-Udio, workflow posts). What barely exists: build-in-public posts
about *this* system, track-drop posts with story, and Arcanea canon content. That gap is the
strategy.

---

## The 5 post archetypes

Every music post is one of these. Each names its executor — nothing here requires a new agent.

### 1. Build-in-public system posts

The pipeline itself is the content: the swarm router, the Guardian tagger, the mastering QC gate,
the take-log learning loop. Screenshot of terminal output + what problem it solves + one honest
limitation. This is the archetype only Frank can write — thousands of people prompt Suno; almost
nobody has an agentic album pipeline with eval rubrics.

- **Shape:** problem → the mechanism (name it, don't buzzword it) → what shipped → file path or
  repo link → one number (LUFS window, keep-rate, track count with "as of" date).
- **Executes:** `/build-log` (converts a build session into MDX log + LinkedIn draft + demo brief +
  Mermaid diagram + prompt-pack entry) → `@content-social-distributor` fans the MDX out per
  platform → `@integrity-guard` gates before anything ships.

### 2. Track-drop posts with story

A finished track plus the receipt trail: the prompt, the take count, what got killed and why, the
Guardian binding (if Arcanea), the mastering pass. Never "new song out 🎵" — always the decision
that made it work.

- **Shape:** hook (the surprising decision) → 15–30s clip or Suno link → 2–3 lines of how →
  where to hear the rest.
- **Executes:** `/music-release` (release lifecycle) → `/music-amplify` / the `music-amplifier`
  agent (registry `registry/agents.json`) drafts the promo angle → `@content-hook-engineer` for
  the tri-modal hook → human posts. The take-log from WORKFLOW.md Loop A is the raw material —
  the kills are often better content than the keeper.

### 3. Craft-teaching posts

Suno prompt structure, genre conventions, state-design (ISO principle), mastering targets, catalog
organization. The proven cluster — the index shows this is where existing music content already
lives, and it's the SEO surface (`/music/templates`, the prompt-engineering guide).

- **Shape:** one specific technique per post, before/after prompt or A/B audio, copy-paste block.
  Teach the mechanism, not "10 tips."
- **Executes:** `/frankx-ai-blog` or `/article-creator` for the long-form (with
  `suno-prompt-architect` / `music-suno-mastery` agents as source material) → `/social-from-blog`
  or `@content-social-distributor` for derivatives.

### 4. Canon/lore posts (Arcanea)

The Guardian roster, frequency-canon, the album as world-building. Mythic register is **confined to
Arcanea label surfaces** per `BRAND-MAP.md` and the Starlight brand-register rule — an Arcanea post
is always framed as label content ("from the Arcanea canon: …"), never as a literal
frequency-healing claim on Frank's main feed.

- **Shape:** one Guardian or one canon rule per post, its musical consequence (mode, BPM, mastering
  posture), the track that embodies it.
- **Executes:** `/arcanea-canon` + the canon at `data/arcanea-guardians.json` / the Starlight CANON
  mirror. **Note:** the FrankX content agents (`content-hook-engineer`,
  `content-social-distributor`) refuse Arcanean mythology by voice-check — by design. Canon posts
  are drafted on the label frame directly, not through those agents; they still pass
  `@integrity-guard` for the claims gate. Zero canon posts exist today; hold this archetype until
  Stage 0 of the roadmap ships a canon track to point at.

### 5. Proof/metrics posts

Keep-rates, catalog counts, funnel numbers, template downloads. Highest-trust archetype, and the
one most constrained: **every number obeys the Metrics Truth Rule** — read `metrics/current.json`
where available, "as of [date]" for exact figures, ranges when freshness is uncertain,
built/contributed/influenced ownership verbs. The catalog number specifically (500+ vs 12k+ vs
61-registered) is an open Frank decision per `docs/L99-NORTH-STAR.md`; until decided, use
"minimum public count" phrasing or the verified subset.

- **Shape:** the number + how it was measured + what it changed. If it can't be verified, it isn't
  a post.
- **Executes:** manual draft from `metrics/current.json` + the keep-rate ledger (D5, once built) →
  `@integrity-guard` is mandatory, not optional, for this archetype.

---

## Per-platform notes

Platform mechanics inherit from `@content-social-distributor`'s rules (the L4 content-ops layer in
`FrankX/.claude/rules/content-ops.md`) — don't re-derive them, dispatch the agent.

| Platform | Ceiling & mechanics | Music-specific angle |
|---|---|---|
| **X** | 280 hard, no link in post (reply-link), no hashtags, number-led lead | Archetypes 1, 2, 5. Terminal screenshots and A/B prompt pairs perform as native images. One post, not threads, until Stage 1 rhythm holds. |
| **LinkedIn** | 1200–1800 target, hook on own line, 3 hashtags at end, blog link on own line | Archetype 1 is the LinkedIn native — `/build-log` emits the LinkedIn draft directly. The AI-architect audience lives here; frame music as the demo of the system. |
| **Threads** | 500 hard, conversational, link in reply | Archetypes 2, 3. The take-log kill stories ("generated 9, kept 1, here's why") fit the register. |
| **YouTube Shorts** | Tri-modal hook (Visual + Audio + Text at second 0) | Archetype 2's natural home — the track IS the audio channel. `@content-hook-engineer` → `content-talking-head-producer` / `/talking-head-ship`. A track-drop short costs one hook + one screen recording of the pipeline. |

**Hard stop inherited from `FrankX/CLAUDE.md`:** no auto-posting to any platform. Every agent in
this chain writes drafts to disk; Frank owns the publish button. The distributor's
`content/social/<slug>/` review directory is the handoff point.

---

## The weekly cadence grid

One track + two posts per week is the floor (Stage 1 of the roadmap). The grid assumes WORKFLOW.md
Loop C (morning prompt-pack → generation session → post-session pipeline → human gate) runs once
a week minimum.

| Day | Action | Archetype | Executor |
|---|---|---|---|
| Mon | Generation session (Loop A/C): prompt pack → Suno → take-log | — (raw material) | prompt-architect agents + Claude-in-Chrome |
| Tue | Post 1: what the session produced or what the pipeline did | 1 or 2 | `/build-log` or `/music-release` → distributor |
| Wed | Reply block (see community loop) | — | manual, 20 min |
| Thu | Post 2: craft or proof post from the week's take-log | 3 or 5 | `/frankx-ai-blog` → `/social-from-blog` |
| Fri | Ship the track (release gate, if one passed QC) + Shorts cut | 2 | `/music-release` + `/talking-head-ship` |
| Sat | Nothing scheduled. Buffer, not content. | — | — |
| Sun | Review: index re-run, what got replies, feed take-log verdicts back | — | `tools/index-creator-content.mjs` + hook-learn loop |

Two posts a week, fifty weeks, is ~100 music posts a year — roughly double today's entire
music-related blog corpus. Cadence is the strategy; the grid exists so no week requires a
decision about *what kind* of thing to make.

---

## The community loop

Distribution without community is broadcasting. The loop:

1. **Reply-first ratio.** For every post published, leave 3–5 substantive replies on other
   builders' work the same day. Substantive = adds a mechanism, a number, or a tested alternative —
   never "great post 🔥".
2. **Who to engage** (maps to `docs/AUDIENCES.md` segments): Suno/Udio power users posting
   prompts and results (Producers, #1) · AI-music tooling builders — MCP servers, Suno wrappers,
   mastering tools (the peer set) · sync/library composers discussing briefs (#2) · music-tech
   researchers on state/focus music (the vibe-os evidence base) · creators asking "how do I make
   AI music not sound generic" (#4 — the funnel's top).
3. **The teachable-reply pattern.** When someone posts a mediocre Suno result, reply with the
   specific prompt change that would fix it. This is archetype 3 in 200 characters and converts
   better than any thread.
4. **Escalate DMs to content.** Recurring questions become craft posts; the question is the hook.
   Log them in the take-log week notes so Sunday review picks them up.
5. **Manual, always.** No auto-reply, no engagement pods, no follow-back scripts.

---

## What NOT to post

- **Engagement-bait.** No "RT if", no fake polls, no rage-bait takes on AI music discourse. The
  hook skill's intelligence-over-manipulation rule (no fear/shame/FOMO framing) is a hard
  constraint inherited from `@content-hook-engineer` — it applies to manual posts too.
- **Unverified numbers.** No catalog count, revenue figure, or keep-rate that doesn't trace to
  `metrics/current.json` or a checkable artifact. The 12k-vs-500-vs-61 catalog question is
  *open* — don't pick a number in a post before Frank picks it in the ledger.
- **Mythic register outside Arcanea surfaces.** Solfeggio/frequency-healing framing on the main
  feed reads as guru content and violates `BRAND-MAP.md`. Hedged research posture
  (`research/METHODOLOGY.md` evidence grades) is the only way state-change claims ship outside
  the label frame.
- **Guru tone.** No "transformation", no "unlock your potential", no motivational threads. If a
  post would work with any product swapped in, it's not a FrankX post.
- **Promises about unshipped features.** The L99 audit found the quickstart 404ing at step one;
  never post a capability the repo can't demonstrate today.
- **Anything auto-distributed.** Posting via any automated path is a `FrankX/CLAUDE.md` hard stop.

---

## Operating inputs

- `data/creator-content-index.json` — what exists; re-run before planning a content week.
- `docs/TOP-VOICE-ROADMAP.md` — which stage gates apply right now.
- WORKFLOW.md Loop C — the daily/weekly production loop that generates the raw material.
- `FrankX/.claude/agents/content-hook-engineer.md` + `content-social-distributor.md` — the
  existing content machinery this strategy composes. Nothing in this doc duplicates them.
