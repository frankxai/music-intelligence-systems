# Audience Matrix

The Music Intelligence System serves six distinct audiences. Each has different entry points, tools, and outcomes.

---

## 1. Independent Music Producers

**What they need:** Genre-appropriate Suno prompts, mastering QC, release workflow, catalog organization.

**Entry point:** Free templates at frankx.ai/music/templates · `/music-intelligence` hub · `suno-prompt-architect` agent

**Key tools:**
- Vibe OS MCP server — generate state-specific production briefs
- Music Suno Mastery agent — genre conventions for 12+ styles
- Music Mastering QC agent — LUFS, true peak, dynamic range gate
- Music Producer agent — production flow orchestration

**Portable exports:** `exports/claude-projects/music-suno-prompt-architect/` or the Custom GPT equivalent

---

## 2. Film & Sync Composers

**What they need:** Decode music briefs, design cues to spec, build sync-ready packages.

**Entry point:** `film-sync-composer` agent (hub-native) · `/music-intelligence` hub

**Key tools:**
- Film/Sync Composer agent — brief decoding, cue design, licensing checklist
- Music Licensing agent — one-stop clearance, metadata requirements
- Orchestration Architect agent — AI orchestral prompts for trailer/film cues

**Portable exports:** `exports/system-prompts/film-sync-composer.md`

---

## 3. Orchestras & Ensemble Musicians

**What they need:** Orchestration plans, voicing specs, playability review, hybrid scoring.

**Entry point:** `orchestration-architect` agent (hub-native)

**Key tools:**
- Orchestration Architect agent — full orchestration workflow from sketch to delivery
- Music Theory Teacher agent — theoretical grounding for ensemble decisions

**Portable exports:** `exports/claude-projects/orchestration-architect/`

---

## 4. Content Creators & Vibe Architects

**What they need:** State-change playlists, focus/calm/energy sessions, vibe design for streams or spaces.

**Entry point:** frankx.ai/products/vibe-os · vibe-os MCP server · `vibe-os-master` agent

**Key tools:**
- Vibe OS MCP server — session design with state library and transitions
- Vibe OS Master agent — ISO principle guidance, BPM/key/instrument recommendations
- Free Suno templates — 8 state-specific copy-paste prompts with research rationale

**Portable exports:** `exports/custom-gpts/vibe-os-master/`

---

## 5. Music Educators

**What they need:** Approachable theory teaching, student-level explanations, AI-native learning tools.

**Entry point:** ai-music-academy · `music-theory-teacher` agent (hub-native)

**Key tools:**
- Music Theory Teacher agent — meets students where they are, uses their music
- AI Music Academy curriculum (4 tiers: Starter → DJ → Producer → Genius)
- Prompt-experiment designs using Suno as the theory lab

**Portable exports:** `exports/gemini-gems/music-theory-teacher/`

---

## 6. Record Labels & A&R

**What they need:** Catalog metadata, sync licensing strategy, release quality gates, royalty structure.

**Entry point:** `music-licensing` agent · Music Mastering QC agent

**Key tools:**
- Music Licensing agent — platform ToS comparison, sync vs streaming licensing
- Music Mastering QC agent — pre-release quality gate (LUFS, DR, true peak)
- Film/Sync Composer agent — understanding sync placement requirements

**Portable exports:** `exports/system-prompts/music-licensing.md`

---

## Quick Reference

| Audience | Best First Agent | MCP Tool | Free Template |
|---|---|---|---|
| Producers | music-suno-prompt-architect | generate_vibe_prompt | Deep Focus / Morning Energy |
| Film/Sync | film-sync-composer | — | — |
| Orchestras | orchestration-architect | — | — |
| Creators | vibe-os-master | list_vibe_states | All 8 templates |
| Educators | music-theory-teacher | — | — |
| Labels | music-licensing | — | — |
