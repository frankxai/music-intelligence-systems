# Getting Started

Pick your path based on what you want to do right now.

---

## Path 1: Import a portable agent into your AI app (5 minutes)

**Use case:** You want a specialist music AI inside Claude.ai, ChatGPT, Gemini, or another platform.

1. Browse the exports: `exports/` in this repo or read docs/PORTABILITY.md
2. Pick the agent that matches your work
3. Follow the import steps for your platform

Fastest picks:
- **Claude.ai Project:** copy `exports/claude-projects/<id>/instructions.md` → paste into Project Instructions
- **Custom GPT:** open `exports/custom-gpts/<id>/gpt-config.md` → follow the field-by-field guide
- **Any LLM API:** copy `exports/system-prompts/<id>.md` → use as system message

---

## Path 2: Run the vibe-os MCP server (10 minutes)

**Use case:** You want Claude Code / Desktop / Cursor to design state-change music sessions for you.

```bash
# Option A: pip
pip install vibe-os-mcp

# Option B: source (includes WAV rendering)
git clone https://github.com/frankxai/vibe-os
cd vibe-os
pip install mcp[cli] scipy numpy
```

Add to your `.mcp.json`:
```json
{
  "mcpServers": {
    "vibe-os": {
      "command": "python",
      "args": ["/path/to/vibe-os/mcp-server/server.py"]
    }
  }
}
```

Then ask Claude: `list_vibe_states()` → `generate_vibe_prompt("deep-focus")` → paste into Suno.

Full tool reference: `mcp/README.md`

---

## Path 3: Use the free Suno prompt templates (2 minutes)

**Use case:** You want research-backed prompts to paste directly into Suno or Udio.

Go to: frankx.ai/music/templates

8 templates covering: Deep Focus · Morning Energy · Creative Flow · Stress Relief · Workout · Deep Sleep · Study/Retention · Heart Coherence

Each template includes: BPM, key/mode, science rationale, evidence grade, copy-paste prompt.

---

## Path 4: Explore the research framework (30 minutes)

**Use case:** You want to understand the evidence behind the music-psychology claims.

Start here:
1. `research/METHODOLOGY.md` — evidence grades and the research loop
2. `research/OPEN-QUESTIONS.md` — what is and isn't settled (MQ-001 through MQ-007)
3. `research/SOURCES.md` — the bibliography with DOIs
4. vibe-os research docs: `vibe-os/research/WHITEPAPER.md`, `music-psychology.md`, `frequency-research.md`

---

## Path 5: Contribute an agent or experiment

**Use case:** You want to add a new agent to the registry or log a music-psychology experiment.

**New agent:**
1. Read `schemas/agent.schema.json` for the required fields
2. Write the agent in the home repo (FrankX, vibe-os, academy, or here in `agents/`)
3. Add an entry to `registry/agents.json`
4. Run `node tools/validate-registry.mjs` — must pass
5. Run `node tools/export-agents.mjs` — generates portable exports
6. PR against `music-intelligence-systems`

**New experiment:**
1. Copy `research/experiments/TEMPLATE.md` → `research/experiments/EXP-NNN-title.md`
2. Complete every field (null results welcome)
3. Add any new sources to `research/SOURCES.md`
4. Update relevant MQ-NNN entries in `research/OPEN-QUESTIONS.md`
5. PR against `music-intelligence-systems`

---

## Audience-Specific Paths

See `docs/AUDIENCES.md` for entry paths by audience (producers, film/sync, orchestras, educators, content creators, labels).
