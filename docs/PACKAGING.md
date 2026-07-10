# Packaging & Distribution — Public Product, Private IP

> How this ecosystem is packaged, who gets what, and how someone else builds their own label on
> top of it without ever seeing Frank's. Companion to `BRAND-MAP.md` (naming) and
> `L99-NORTH-STAR.md` (D1/D2 decisions this doc operationalizes).

Last updated: 2026-07-08

---

## 1. The rule

**The engine is public. The brand is private. Never the reverse.**

A tagging algorithm, a schema, a scoring function, a pipeline — these are product. A specific
person's mythology, their unreleased tracks, their label's exact sound identity — that's IP. This
repo (and its public siblings) ship the first kind only. Frank's own instance of the second kind
lives in his private `FrankX` repo, configured *through* the public engine via a `--profile-pack`
argument the engine never sees the contents of at commit time.

This is the fix for a real mistake this ecosystem made and then corrected: the Arcanea Guardian
roster and an in-progress, unreleased album were sitting in this public hub. They now live in
`FrankX/data/music/arcanea-profile-pack.json` and `FrankX/albums/arcanea-vol-1/`. This repo ships
`profile-packs/example-profile-pack.json` — a generic, four-profile demo pack — so the tool is
runnable and legible with zero private data.

---

## 2. Repo map — what's public, what's private, why

| Repo | Visibility | Ships |
|---|---|---|
| `music-intelligence-systems` | **Public** | Registry, schemas, generic tagging engine (`tag-vibe-profile.mjs`), album-builder, eval harness, example profile pack, docs |
| `vibe-os` | **Public** | The state-change prompt engine (already generic — `morning_energy`, `deep_focus`, etc.), MCP server |
| `claude-skills-library` | **Public** | Free OSS skills (`suno-ai-mastery`, `suno-prompt-architect`, `vibe-os-master`, `lyric-craft`) |
| `awesome-music-agent-skills` | **Public** | Curated list, no proprietary content |
| `frankx.ai-vercel-website` | **Public** (necessarily — it's the deployed site) | Marketing pages, free templates — no private ops code |
| `FrankX` | **Private** | Frank's daily-ops layer (`/daily-music`, mission control, ingest), his Arcanea profile pack, his in-progress album, his briefs/take-log/mission-log |
| `ai-music-academy` | **Private** | Curriculum in development, not yet a live product |

The public repos, together, are a complete, runnable system with *no* private data required. The
private repo is thin by design: it's mostly configuration (one profile-pack JSON, one album folder,
personal daily logs) layered on top of public code — not a fork, not a parallel copy.

---

## 3. How a producer or label adopts this (the intended path)

1. Clone the public repos (`music-intelligence-systems`, `vibe-os`; optionally `claude-skills-library`
   for the free Suno skills).
2. Run `node tools/tag-vibe-profile.mjs` against the shipped example pack to see the engine work.
3. Write **their own** `profile-pack.json` — their own named categories, their own frequency/mode/
   tempo associations, their own palette. See `docs/BRING-YOUR-OWN-PROFILE-PACK.md` for the schema
   walkthrough and a fully worked example that is *not* Arcanea.
4. Point the ingest pipeline (their own copy, or a private repo of their own modeled on `FrankX`'s
   pattern) at their pack via `--profile-pack <their-file>`.
5. Everything downstream — canon-fit scoring, album sequencing, brief generation, the eval harness —
   now runs against *their* taste, using the same tested engine Frank uses for his.

Arcanea is referenced throughout the docs as the worked case study (a label with a fully realized
mythic identity), but its actual data is never in the clone. That's the point — someone reading the
docs learns the pattern, not the brand.

---

## 4. Distribution mechanics (current vs. roadmap)

| Mechanism | Status | Note |
|---|---|---|
| `git clone` + run from source | **Current** | The only supported path today. Matches `docs/GETTING-STARTED.md`. Zero packaging debt, zero registry-squatting risk. |
| Portable agent exports (Claude Projects / Custom GPTs / Gemini Gems) | **Current** | `docs/PORTABILITY.md` — 52 pre-generated exports, no install step at all. |
| `pip install vibe-os-mcp` | **Deferred** | Was documented before it existed (a real bug, fixed to source-install docs per the L99 audit). Publish to PyPI only when there's a real install-friction signal from actual users — not speculatively. |
| npm package for the CLI tools (`tag-vibe-profile`, `album-builder`) | **Deferred** | Same reasoning — a published npm package is a permanent commitment (semver, deprecation policy, name squatting). Clone-and-run has zero of that cost and the tools are already zero-dependency Node, so the friction it would remove is small. |
| A scaffold generator (`npx create-music-intelligence-label`) | **Deferred, but the highest-leverage future item** | Once ≥2 external labels have gone through step 3 above by hand, this is the natural next build — turn the manual profile-pack-authoring pattern into a generator. Premature before real external usage exists. |

The distribution model is deliberately boring right now: clone, read the docs, configure. That's
correct for a pre-revenue, pre-external-user system. Package registries are a cost you pay forever;
don't pay it before someone's asked for it.

---

## 5. What ships as the sellable product (per `L99-NORTH-STAR.md` D9)

The packaging boundary above is not the same as the pricing boundary. Recap, made concrete:

- **Free**: the public repos, as-is. Clone, run, build your own pack.
- **$27–37 (Producer Pack)**: a *curated* profile-pack + prompt-pack bundle sold via the existing
  Gumroad rails — i.e., someone else's version of what `arcanea-profile-pack.json` is for Frank,
  professionally made and sold as a product, not given away as source.
- **$297–997 (the workflow)**: hands-on setup of the whole pipeline for a label or serious indie
  artist — this document *is* the spec for that engagement.

None of this requires changing what's public. The product is the configuration + the service, not
the engine — the engine stays free and public because that's what makes the configuration and the
service valuable to sell.

---

## 6. Open items

- Confirm with Frank: should `example-profile-pack.json`'s four demo profiles get a permanent name
  (something a docs reader will remember), or stay intentionally forgettable so nobody mistakes them
  for a real product?
- The Producer Pack (D9) is unbuilt — this doc assumes it exists at the same generic/private
  boundary described above once someone builds it.
