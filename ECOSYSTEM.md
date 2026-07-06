# The Music Intelligence Ecosystem Map

> Canonical cross-repo map. Every spoke links back here; this file is the single source of truth for what lives where. Machine-readable mirror: [`registry/repos.json`](registry/repos.json).

**Rule zero: compose, don't duplicate.** Agents, skills, tools, and data each have exactly one home. The hub registers and exports; it never forks.

---

## Data flow

```
research            states              prompts              generation
(vibe-os docs,  →   (vibe-state     →   (skills, agents, →   (Suno / Hailuo /
 MIS research/)      schema, 15-state    MCP tools)           Udio — manual,
                     library)                                 no public API)
        ↑                                                          │
        │                                                          ▼
   learning loop    education          publication           catalog
   (open questions, ← (AI Music     ←  (frankx.ai music  ←   (FrankX asset
    experiments)       Academy)         pages, socials)       registry, 12k+)
```

## The repos

### music-intelligence-systems (this repo) — THE HUB
- **Role:** Registry, schemas, portable exports, research engine, this map.
- **Provides:** `registry/*.json`, `schemas/*.json`, `exports/` (Claude Projects / Custom GPTs / Gemini Gems / generic), 5 canonical agents (`agents/`) — including `swarm-orchestrator`, which routes any music/vibe ask to the right agent(s)/tool(s) across all 6 repos (see `tools/swarm-router.mjs` for the deterministic keyword-scoring companion) — and `research/`.
- **Consumes:** Agent sources from FrankX, vibe-os, ai-music-academy; patterns from Starlight verticals.

### vibe-os — the state-change engine
- **Repo:** https://github.com/frankxai/vibe-os
- **Role:** Research-backed music for state change. The science layer.
- **Key paths:** `tools/vibe-prompt-generator.py` (15-state library), `tools/frequency-generator-pro.py`, `tools/vibe-os-mixer.py`, `mcp-server/server.py` (7 MCP tools), `skills/<name>/SKILL.md`, `docs/` (music-psychology research, frequency-healing research, whitepaper).
- **Provides:** The vibe-state model (formalized here as `schemas/vibe-state.schema.json`), the first ecosystem MCP server, the research corpus behind `research/SOURCES.md`.

### FrankX — the production OS (private operations, public agent patterns)
- **Repo:** https://github.com/frankxai/FrankX
- **Role:** Frank's operating repo: the 9-agent Music Production pillar + the catalog data.
- **Key paths:** `.claude/agents/music-*.md` (producer, suno-mastery, suno-prompt-architect, create-wizard, catalog-indexer, mastering-qc, licensing, release-manager, video-batch), `.claude/commands/create-music.md`, `data/music-asset-registry.json`, `data/inventories/frankx/music.json` (12k+ catalog).
- **Provides:** The canonical agent definition format (`schemas/agent.schema.json` mirrors it), production agent sources for `exports/`, the track-metadata shape (`schemas/track-metadata.schema.json`).

### Starlight-Intelligence-System — the substrate
- **Repo:** https://github.com/frankxai/Starlight-Intelligence-System
- **Role:** SIP protocol substrate. Hosts the two music verticals this hub references.
- **Key paths:** `verticals/sound-intelligence/` (public forkable reference: Composition, Production, Catalog, Performance, Audience, Sync — 6 agents, 30 `/sound-*` commands), `verticals/music-is/` (operated label vertical: curator, archivist, persona-keeper, producer, distributor, amplifier, royalty-architect).
- **Relationship:** MIS adopts its registry conventions and attribution style; MIS registers itself there as a repo-context (operational tier). Substrate files are never modified from here.

### ai-music-academy — the education spoke
- **Repo:** https://github.com/frankxai/ai-music-academy
- **Role:** Learn the language and concepts behind music + AI production. 4 tiers: Starter / DJ / Producer / Genius.
- **Key paths:** `agents/portable/` (6 importable teaching/production personas), `docs/CURRICULUM.md`, `docs/ECOSYSTEM-ALIGNMENT.md` (tier → ecosystem asset map), `curriculum/`.
- **Provides:** Education agent sources for `exports/`; the learning pathway that the Music Theory Teacher agent points students to.

### awesome-music-agent-skills — community discovery
- **Repo:** https://github.com/frankxai/awesome-music-agent-skills
- **Role:** Curated list (150+ entries): generation, MIR/analysis, transcription, stem separation, recommendation, APIs, **MCP servers**, DAW tools, datasets — plus the ecosystem's own entries.
- **Provides:** The outward-facing directory; the place third-party music MCP servers and agent skills get registered.

### claude-skills-library — skill distribution
- **Repo:** https://github.com/frankxai/claude-skills-library
- **Role:** Installable skills in canonical SKILL.md format.
- **Key paths:** `free-skills/suno-ai-mastery/`, `free-skills/suno-prompt-architect/`, `free-skills/vibe-os-master/`.

### agentic-creator-os (ACOS) — creator workflows
- **Repo:** https://github.com/frankxai/agentic-creator-os
- **Role:** Creator OS; hosts the education-focused `music-production` agent and the `/create-music` command pattern.
- **Key paths:** `.claude/agents/music-production.md`.

### starlight-agent-skills — skill index
- **Repo:** https://github.com/frankxai/starlight-agent-skills
- **Role:** Pointer index to music/sound skills across the ecosystem (canonical index: `registry/skills.json` here).

### frankx.ai — the public surface
- **Site repo:** https://github.com/frankxai/frankx.ai-vercel-website
- **Music routes:** `/music-intelligence` (ecosystem hub page) · `/music` (hub) · `/music/templates` (free research-backed Suno templates) · `/music-lab` (8 free interactive instruments) · `/vibe` + `/products/vibe-os` (Vibe OS product) · `/studio/music`.
- **Data:** `data/music-asset-registry.json` (published tracks), `data/music-intelligence-ecosystem.json` (drives the hub page).

### Adjacent (registered, not music-specific)
- **agentic-intelligence-system (AIS)** — agent-discoverability conventions (`agents.json`, `/llms.txt`); MIS `registry/agents.json` follows its field conventions so emitting MIS discoverability artifacts is mechanical.
- **second-brain-os, starlight-cosmos-engine, starlight-swarm, starlight-evals** — substrate/infra; `starlight-evals` is the future home for listening-eval lanes (see `research/METHODOLOGY.md` §Evaluation).

---

## Contracts

1. **Registry entries point at canonical sources.** An agent's `canonical_source` is a repo+path; the hub never edits the source.
2. **Exports are generated + committed.** Consumers copy from `exports/`; only contributors run the generator (requires the ecosystem cloned side-by-side under one parent dir).
3. **Schemas are descriptive, then normative.** They started as mirrors of the existing FrankX / claude-skills-library / vibe-os shapes; new assets should validate against them.
4. **Evidence framing is non-negotiable.** Any "vibe" claim carries its evidence grade (strong / preliminary / anecdotal) per `research/METHODOLOGY.md`.
5. **Attribution compounds.** Exports carry a "Built from the FrankX Music Intelligence System" footer with source path + date — in the spirit of Starlight's SIP attestation, without touching the substrate.

---

*Maintained in the hub. PRs that add a repo must update both this file and `registry/repos.json`.*
