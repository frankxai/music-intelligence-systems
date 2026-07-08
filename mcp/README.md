# MCP Topology

Model Context Protocol servers in the Music Intelligence ecosystem. Status: `shipped` | `specified` | `planned`.

## Shipped

### vibe-os MCP Server

**Repo:** frankxai/vibe-os  
**Path:** `mcp-server/server.py`  
**Status:** shipped (v0.2.0)

**Install:** there is no `vibe-os-mcp` package on PyPI — install from source:
```bash
git clone https://github.com/frankxai/vibe-os
cd vibe-os
pip install -r mcp-server/requirements.txt
```

**Register — Claude Code (project scope):**
```bash
claude mcp add vibe-os -- python3 mcp-server/server.py
```

**Claude Desktop / Cursor config (`.mcp.json`):**
```json
{
  "mcpServers": {
    "vibe-os": {
      "command": "python3",
      "args": ["/absolute/path/to/vibe-os/mcp-server/server.py"]
    }
  }
}
```

**Tools exposed:**

| Tool | Description |
|---|---|
| `list_vibe_states` | Returns all 15 named vibe states with BPM, key, mode, instruments |
| `generate_vibe_prompt` | Generates a Suno-ready prompt for a named state (with optional lyric guide) |
| `generate_transition_prompt` | ISO-principle transition between two states |
| `generate_custom_prompt` | Generates a prompt from raw params (BPM, key, mood, instruments) |
| `list_frequency_presets` | Returns binaural/isochronic frequency presets with evidence framing |
| `design_frequency_session` | Full session design; renders 24-bit WAV when `output_path` provided |
| `plan_session_mix` | Plans a multi-state session with transitions and total duration |

**Implementation note:** The server wraps the existing hyphenated-filename Python tools (`vibe-prompt-generator.py`, `frequency-generator-pro.py`, `vibe-os-mixer.py`) via `importlib.util.spec_from_file_location`. The original CLI tools are unchanged and still work independently.

---

## Specified (not yet built)

### music-catalog MCP Server

**Repo:** frankxai/music-intelligence-systems (future)  
**Status:** specified

Would expose the FrankX 12,000+ song catalog (from `data/music-asset-registry.json`) as queryable tools: search by genre/BPM/mood, recommend tracks for a vibe state, return licensing metadata. Blocked on: catalog data normalization, hosting decision.

### ai-music-academy MCP Server

**Repo:** frankxai/ai-music-academy (future)  
**Status:** planned

Would expose curriculum data: lesson lookup, exercise generation, progress tracking. Blocked on: auth/DB backend (deferred — see roadmap/DEFERRED.md).

---

## Topology

```
MCP Clients (Claude Code / Desktop / Cursor / Cline)
  │
  ├── vibe-os ──────── SHIPPED
  │     └── list_vibe_states, generate_vibe_prompt, ...
  │
  ├── music-catalog ── SPECIFIED
  │     └── search_catalog, recommend_for_state, ...
  │
  └── academy ──────── PLANNED
        └── get_lesson, generate_exercise, ...
```

## Adding a New MCP Server

1. Implement as a FastMCP server in the target repo (`mcp-server/server.py`)
2. Add a pyproject.toml entry point: `your-server = "your_module:app.run"`
3. Register it in `registry/tools.json` (kind: `mcp-server`, status: `shipped`)
4. Update this file with the tool listing
5. Run `node tools/validate-registry.mjs` to confirm no registry errors
