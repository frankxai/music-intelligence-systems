# Portability Guide

How to import Music Intelligence System agents into any AI platform. All exports are in `exports/` and are pre-generated — you never need to run the export script.

---

## Available Agents

| Agent | Claude Project | Custom GPT | Gemini Gem | System Prompt |
|---|---|---|---|---|
| Lyric Writer | ✅ | ✅ | ✅ | ✅ |
| Film/Sync Composer | ✅ | ✅ | ✅ | ✅ |
| Music Theory Teacher | ✅ | ✅ | ✅ | ✅ |
| Orchestration Architect | ✅ | ✅ | ✅ | ✅ |
| Music Producer | ✅ | ✅ | ✅ | ✅ |
| Suno Prompt Architect | ✅ | ✅ | ✅ | ✅ |
| Suno Mastery | ✅ | ✅ | ✅ | ✅ |
| Music Mastering QC | ✅ | ✅ | ✅ | ✅ |
| Music Licensing | ✅ | ✅ | ✅ | ✅ |
| Vibe OS Master | ✅ | ✅ | ✅ | ✅ |
| Music Theory Teacher (Academy) | ✅ | ✅ | ✅ | ✅ |
| Music Producer (Academy) | ✅ | ✅ | ✅ | ✅ |
| Content Creator (Academy) | ✅ | ✅ | ✅ | ✅ |

---

## Claude Projects (Claude.ai)

1. Go to claude.ai → Create new Project
2. Open `exports/claude-projects/<agent-id>/instructions.md`
3. Copy the entire file content
4. Paste into the Project Instructions field
5. Optional: upload supporting documents listed in the "Project knowledge to upload" section at the bottom

**Best for:** Ongoing work sessions, document-heavy tasks, persistent context.

---

## Custom GPTs (ChatGPT)

1. Go to chat.openai.com → Explore GPTs → Create a GPT
2. Open `exports/custom-gpts/<agent-id>/gpt-config.md`
3. Follow the field-by-field guide in the file:
   - **Name** → paste as-is
   - **Description** → paste the ≤300 char description
   - **Instructions** → paste the fenced code block content (≤8000 chars, verified)
   - **Conversation starters** → add the 4 listed starters
   - **Capabilities** → match the settings listed (Web browsing ON, Code interpreter OFF, Image generation OFF)
4. Save and publish (or keep private)

**Note:** All Custom GPT exports are kept under 8,000 characters by the export engine. Lowest-priority sections are dropped first when trimming is needed.

---

## Gemini Gems (Google)

1. Go to gemini.google.com → Create a Gem
2. Open `exports/gemini-gems/<agent-id>/gem-instructions.md`
3. Everything below the `---` line is the gem instructions — copy it
4. Paste into the gem's instructions field

**Note:** The Gemini export uses Persona / Task / Format / Guardrails structure rather than section-by-section, which matches how Gems respond best.

---

## Generic System Prompt (Grok, Copilot, local models, APIs)

`exports/system-prompts/<agent-id>.md` works as a system/developer message in any LLM:

- **Grok:** paste as system prompt in the API or use xAI's system prompt field
- **Microsoft Copilot:** use as a custom instruction block
- **Local models (Ollama, LM Studio):** paste as the system message in the model config
- **OpenAI/Anthropic/Google APIs:** send as the `system` message in API calls
- **Coding agents (Claude Code, Cursor, Cline):** paste into a `.claude/agents/` file or similar agent persona file

---

## Regenerating Exports

Exports are committed and deterministic. If you modify an agent or registry entry:

```bash
node tools/validate-registry.mjs   # must pass first
node tools/export-agents.mjs       # regenerates all 4 formats for all portable agents
```

Commit the updated exports alongside the agent change.

---

## What Gets Stripped

The export engine (`tools/export-agents.mjs`) strips ACOS-internal mechanics that don't make sense outside the FrankX agent system:
- Dispatch references (`@music-catalog-indexer`, `@aco-router`)
- Internal file paths (`node lib/acos/memory.mjs`, `data/music-catalog/`)
- Session-logging instructions (`CLAUDE.md` references, `ReasoningBank`)
- Pillar/slot framing from agent names and descriptions

Domain knowledge, processes, expertise, and voice are preserved intact.
