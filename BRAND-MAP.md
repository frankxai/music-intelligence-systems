# BRAND-MAP.md — the naming contract

> Implements Decision D1 of `docs/L99-NORTH-STAR.md`: "Coherent hub taxonomy buried under a
> four-way collision on Vibe OS — at the exact point money changes hands." One table, one meaning
> per name, no ad-hoc naming. One-liners are grounded in `docs/AUDIENCES.md` and
> `docs/L99-NORTH-STAR.md`; canonical URLs are grounded in `ECOSYSTEM.md` / `registry/repos.json`.

**Register key:** `masterbrand` (the umbrella above everything) · `umbrella` (public product/agent
surface) · `product` (a specific paid or free deliverable) · `mythic` (Arcanea canon language —
Solfeggio/frequency/Guardian framing, confined to Arcanea label surfaces per the Starlight
brand-register rule) · `engine` (the underlying science/research layer, hedged evidence framing) ·
`education` (the teaching surface).

| Name | Single meaning | Register | ICP | Canonical URL | One-liner |
|---|---|---|---|---|---|
| **FrankX** | The masterbrand — Frank Riemer's overarching creator/AI-architect identity. Every product, repo, and surface below sits under it. | masterbrand | All six `docs/AUDIENCES.md` segments enter here | `https://frankx.ai` | AI Architect and Creator — enterprise-grade AI systems translated into practical, ships-real-products creative tools. |
| **Music Intelligence System** | The public umbrella for every music-AI capability FrankX ships — agents, tools, research, products. Not a product itself. | umbrella | All six `docs/AUDIENCES.md` segments (Producers, Film/Sync, Orchestras, Creators, Educators, Labels) | `frankx.ai/music-intelligence` | "The Agentic Music Producer's OS" — its positioning tagline, **not a second name** (per D1). |
| **Vibe OS** | One thing only: the music state-change **product** — the paid Suno toolkit `/music/templates` already promises. Not the engine, not the research, not a second name for the umbrella. | product | Content Creators & Vibe Architects (`docs/AUDIENCES.md` #4) | `frankx.ai/products/vibe-os` — **contested**; see "still Frank's call" below | State-change music sessions: the vibe-os engine's research turned into a paid Suno/Hailuo/Udio session-design toolkit. |
| **Arcanea** | The Guardian-canon music label — ten Guardians, each locked to a Solfeggio frequency, a mode, and a mastering posture. Mythic register only; never the vehicle for literal frequency-healing claims outside its own surfaces. | mythic | Record Labels & A&R (`docs/AUDIENCES.md` #6), specifically the operated-label persona | No public surface yet — operates inside `Starlight-Intelligence-System/verticals/music-is/labels/arcanea/CANON.md`; long-term home planned at `arcanea-ecosystem/labels/arcanea-records` per that vertical's `QUICK-START.md` | A canon-bound label where ten Guardians each own a frequency, a mode, and a vocal posture — non-waivable canon, mythic framing, never claimed as literal science outside its own surfaces. |
| **The album pipeline** *(formerly "Album OS" — retired as an outward name)* | Internal name for the 8-stage intake -> canon-tag -> curate -> sequence -> master -> cover -> release -> monetize pipeline (`schemas/album.schema.json`, `tools/album-builder.mjs`, `tools/tag-vibe-profile.mjs`). | product *(internal tooling — never publicly named)* | Internal only (Frank + agents); not an external-facing surface | None — do not use "Album OS" in public-facing copy, per D1 | The pipeline that turns a pile of Suno exports into a released, sequenced album with matching visuals (`docs/engineering/2026-07-album-os.md` §1). |
| **vibe-os** *(the repo)* | The engine — the state-change science layer (vibe-state library, MCP server, frequency tools) that the Vibe OS product is built on top of. Distinct from the "Vibe OS" product name above; same words, different register. | engine | Developers / Claude Code users who want the MCP server directly (power-user overlap with `docs/AUDIENCES.md` #4) | `https://github.com/frankxai/vibe-os` | The research-backed state-change engine: vibe-state library + MCP server + frequency tools, evidence-graded per `research/METHODOLOGY.md`. |
| **ai-music-academy** | The education surface — a 4-tier curriculum (Starter -> DJ -> Producer -> Genius) teaching music + AI production concepts. | education | Music Educators (`docs/AUDIENCES.md` #5) | `https://github.com/frankxai/ai-music-academy` — repo + portable teaching agents; no live public site yet | Learn the language and concepts behind music + AI production, four tiers deep. |

---

## The gate

**Any new name — product, agent persona, label, repo, internal tool, whatever — must earn a row in
this table before it ships in public copy, agent descriptions, docs, or code comments.** If it
doesn't have a row here yet, it isn't a real name in this ecosystem yet; it's a draft. Adding a row
means answering all six columns, in particular:

- **Single meaning** — one sentence, no "and also." If a name needs two meanings, it's actually two
  names (this is exactly the Vibe OS collision D1 fixes: "Vibe OS the product" vs. "vibe-os the
  repo" vs. the Notion tracker at `/products/vibe-os` vs. `/music/templates`'s paid-toolkit framing
  were four things wearing one name).
- **Register** — pick from the key above, or justify a new one. Mythic-register language
  (Solfeggio/frequency-canon/Guardian framing) stays confined to Arcanea label surfaces; hedge
  everywhere else, per the existing Starlight brand-register rule and `research/METHODOLOGY.md`'s
  evidence-grade discipline.
- **Canonical URL** — if the name is public-facing, it needs exactly one URL. Two URLs claiming the
  same product name (as `/vibe` and `/products/vibe-os` currently both do) is the bug, not a
  feature.

## Still Frank's call

This table records the naming *architecture* (D1, decided). It does not resolve two open questions
from `docs/L99-NORTH-STAR.md`'s "Decisions only Frank can make":

1. **Vibe OS product identity** — `/products/vibe-os` is currently a FREE "Creative State
   Management" Notion tracker while `/music/templates` sells it as the paid Suno toolkit, and
   `ECOSYSTEM.md`'s own route map lists both `/vibe` and `/products/vibe-os` as "(Vibe OS product)."
   The audit's recommendation: make `/products/vibe-os` the paid music product the funnel already
   promises, and resolve `/vibe` into either a redirect or a distinct (renamed) surface. Until Frank
   decides, this table's canonical-URL cell for Vibe OS stays marked contested.
2. **ai-music-academy positioning** — whether it's a live product surface or an archived experiment
   is strategic, not mechanical; this table treats it as live (education register, real repo) but
   does not resolve monetization or site-presence questions.

Neither open question changes the *names themselves* — Vibe OS is still one thing (the product),
Arcanea is still mythic-only, the album pipeline is still internal. What's open is which URL wins
and how visible ai-music-academy becomes, not what anything is called.
