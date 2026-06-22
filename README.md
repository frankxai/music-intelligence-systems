# Music Intelligence System

> The open hub for AI-era music creation — one registry, one schema layer, portable agents for every AI platform, and a research engine for music & state change.

**Built by [FrankX](https://frankx.ai) · Public surface: [frankx.ai/music-intelligence](https://frankx.ai/music-intelligence)**

---

## What is this?

Music creation with AI is fragmented: prompts live in one tool, agents in another, research in papers nobody operationalizes, and every chat platform wants its own configuration format. The Music Intelligence System (MIS) is the hub that connects them:

```
                       ┌──────────────────────────────┐
                       │  MUSIC INTELLIGENCE SYSTEM    │
                       │  (this repo — the hub)        │
                       │                               │
                       │  registry/   what exists      │
                       │  schemas/    shared contracts │
                       │  agents/     net-new agents   │
                       │  exports/    portable formats │
                       │  research/   open science     │
                       └──────┬───────────┬────────────┘
                              │           │
        ┌──────────┬──────────┼───────────┼──────────┬─────────────┐
        │          │          │           │          │             │
   ┌────▼───┐ ┌────▼────┐ ┌───▼─────┐ ┌───▼─────┐ ┌──▼──────┐ ┌────▼──────┐
   │vibe-os │ │ FrankX  │ │Starlight│ │AI Music │ │awesome- │ │ frankx.ai │
   │state-  │ │Pillar-2 │ │ sound + │ │Academy  │ │music-   │ │ /music-lab│
   │change  │ │9 agents │ │music IS │ │education│ │agent-   │ │ /music/   │
   │engine +│ │12k+     │ │verticals│ │4 tiers  │ │skills   │ │ templates │
   │MCP srv │ │catalog  │ │         │ │         │ │150+ list│ │ (free)    │
   └────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────────┘
```

**The rule: compose, don't duplicate.** Every agent, skill, and tool keeps living in its home repo. This hub registers them, gives them shared schemas, and exports them to every AI platform.

## Who is it for?

| You are | Start here |
|---|---|
| **Music producer** | [Portable agents](exports/) — import a production co-pilot into Claude, ChatGPT, or Gemini. Free prompt templates at [frankx.ai/music/templates](https://frankx.ai/music/templates) |
| **Record label / A&R** | [`registry/agents.json`](registry/agents.json) — catalog, licensing, release, and amplification agents; Starlight `music-is` vertical patterns |
| **Film / sync composer** | [`agents/film-sync-composer.md`](agents/film-sync-composer.md) + sync-licensing patterns |
| **Orchestrator / arranger** | [`agents/orchestration-architect.md`](agents/orchestration-architect.md) |
| **Songwriter** | [`agents/lyric-writer.md`](agents/lyric-writer.md) — lyric craft grounded in lyrics-psychology research |
| **Educator / student** | [`agents/music-theory-teacher.md`](agents/music-theory-teacher.md) + [AI Music Academy](https://github.com/frankxai/ai-music-academy) |
| **Content creator** | [vibe-os](https://github.com/frankxai/vibe-os) state library — the right music for any content, by target state |
| **Developer / agent builder** | [`schemas/`](schemas/), the [vibe-os MCP server](https://github.com/frankxai/vibe-os/tree/main/mcp-server), and [awesome-music-agent-skills](https://github.com/frankxai/awesome-music-agent-skills) |
| **Researcher** | [`research/`](research/) — methodology, open questions registry, sources |

Full per-audience paths: [`docs/AUDIENCES.md`](docs/AUDIENCES.md) · [`docs/GETTING-STARTED.md`](docs/GETTING-STARTED.md)

## Quick start

```bash
# See everything that exists across the ecosystem
cat registry/agents.json registry/skills.json registry/tools.json

# Validate the registry against the schemas
node tools/validate-registry.mjs

# Regenerate the portable exports (Claude Projects / Custom GPTs / Gemini Gems / generic)
node tools/export-agents.mjs
```

Or skip the tooling entirely: [`exports/`](exports/) is committed — copy any agent straight into your AI platform of choice. Import instructions: [`docs/PORTABILITY.md`](docs/PORTABILITY.md).

## The pieces

| Directory | What it is |
|---|---|
| [`ECOSYSTEM.md`](ECOSYSTEM.md) | The canonical cross-repo map — every repo's role, paths, and contracts |
| [`registry/`](registry/) | JSON registries: repos, ~30 agents, skills, tools/MCP servers |
| [`schemas/`](schemas/) | JSON Schemas: agent, skill, vibe-state, track metadata, export manifest |
| [`agents/`](agents/) | Net-new canonical agents: Lyric Writer, Film/Sync Composer, Music Theory Teacher, Orchestration Architect |
| [`exports/`](exports/) | Generated portable agents — Claude Projects, Custom GPTs, Gemini Gems, generic system prompts |
| [`tools/`](tools/) | Zero-dependency Node scripts: registry validation, export generation |
| [`research/`](research/) | The research engine: methodology, open questions (MQ-###), sources, experiment template |
| [`mcp/`](mcp/) | MCP topology — which servers exist, which are specified |
| [`roadmap/`](roadmap/) | Where this goes next, and what's deliberately deferred |

## Research, not vibes-about-vibes

The "vibe" layer is music psychology with citations: tempo entrainment, mode/valence mapping, timbre-emotion associations, lyric psychology, and brainwave entrainment evidence — inherited from the [vibe-os research docs](https://github.com/frankxai/vibe-os/tree/main/docs) and formalized in [`research/METHODOLOGY.md`](research/METHODOLOGY.md). Claims carry evidence grades; anecdotal traditions (e.g. solfeggio) are labeled as such. The open problems live in [`research/OPEN-QUESTIONS.md`](research/OPEN-QUESTIONS.md) — contributions welcome.

## License

MIT — see [LICENSE](LICENSE).

---

*Part of the FrankX ecosystem. The work speaks.*
