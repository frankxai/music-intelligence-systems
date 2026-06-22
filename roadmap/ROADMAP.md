# Roadmap

## Now (shipped in this PR / v1.0)

- Registry: 15 repos, 31 agents, 11 skills, 11 tools
- 4 hub-native agents: Lyric Writer, Film/Sync Composer, Music Theory Teacher, Orchestration Architect
- Portability engine: 13 agents × 4 formats = 52 exports
- vibe-os MCP server: 7 tools, pip-installable
- Research framework: METHODOLOGY + OPEN-QUESTIONS + SOURCES + experiment template
- frankx.ai/music-intelligence hub page + /music/templates (8 free Suno prompts)
- ai-music-academy portable agents + ecosystem alignment

## Near-term (next 3 months)

### Hub improvements
- Automated export validation in CI (run `validate-registry.mjs` + `export-agents.mjs` on every PR)
- Contribution guide with step-by-step for adding agents from external repos
- First completed experiment in `research/experiments/` against MQ-001 or MQ-003

### vibe-os MCP
- Package stability: pin dependency versions, add `requirements.txt` lockfile
- Additional vibe states (currently 15; target 25 based on vibe-os research docs)
- Streaming WAV rendering (currently synchronous; large sessions block)

### Agent improvements
- Film/Sync Composer: add real-world sync brief case studies to Expertise
- Music Theory Teacher: add structured curriculum integration with ai-music-academy tiers
- Orchestration Architect: add sample library-specific guidance (Spitfire, East West, BBCSO)

## Medium-term (3–12 months)

### Research
- First structured experiment logged (MQ-007 — AI vs performed music for state-change)
- Guest researcher contribution (external music therapist or musicologist)
- Evidence grade upgrades if new RCTs publish on ISO principle or binaural beats

### Platform
- music-catalog MCP server (search 12k+ catalog by state/BPM/genre) — blocked on data normalization
- ai-music-academy backend (DB, auth, payments) — see DEFERRED.md
- frankx.ai/music-intelligence dynamic registry display (pulls from registry JSON)

### Ecosystem
- Cross-registry sync: Starlight Intelligence System music IS agents → MIS registry
- Suno API integration (if/when public API ships)

## Version conventions

`v1.x` — registry + export stability  
`v2.x` — MCP platform (catalog + academy servers)  
`v3.x` — research contributions and evidence upgrades
