# Deferred Items

Features and integrations explicitly deferred — each with the reason why. Revisit when the blocking condition changes.

---

## iOS / Android Apps

**Status:** Deferred indefinitely  
**Reason:** Requires native SDK work, App Store review cycles, and a backend (auth + subscription). No one in the current ecosystem is building this. The web surface (frankx.ai) serves the same use case for most users without the overhead.

---

## Web3 / NFT / XR Integrations

**Status:** Deferred indefinitely  
**Reason:** No clear user need in the current audience matrix. Adds significant infrastructure complexity. Not blocked, just not prioritized.

---

## AI Music Academy Backend (DB, Auth, Payments, Skool)

**Status:** Deferred until explicit commitment to build  
**Reason:** The academy has a production-grade Next.js UI and 6 TypeScript agent type definitions, but no runtime, no database, no auth, and no payment processing. Building a full SaaS backend requires sustained investment beyond a single session. The portable agents and curriculum alignment docs ship value without the backend.

**Blocking conditions resolved:** DB schema defined, auth provider chosen (Supabase/Clerk), payment processor wired (Stripe), Skool community migrated.

---

## Suno API Integration

**Status:** Deferred until public API exists  
**Reason:** Suno has no public API as of 2026-06-22. All Suno integrations currently use copy-paste prompts or browser-based workflows. When a public API ships, the vibe-os MCP server is the natural integration point (add a `generate_suno_track` tool).

---

## vibe-os TypeScript Port

**Status:** Deferred  
**Reason:** The Python tools are functional, well-tested, and actively used. A TypeScript port would enable tighter Next.js integration but adds no new capability. Revisit if the academy backend ships on Next.js and needs server-side vibe generation.

---

## DAW Plugins / Notation Software Integration

**Status:** Deferred  
**Reason:** Plugin development requires platform-specific SDKs (VST3, AU, AAX), code signing, and installer distribution. High barrier to entry for marginal gain over the current MCP-based workflow. Not blocked on resources — just not the right layer for this system.

---

## Newsletter / Social Distribution Automation

**Status:** Deferred — external side effects  
**Reason:** Auto-publishing to LinkedIn, X, newsletters requires social API credentials and approval. These are external side effects per the ACOS hard-stops policy. Distribution remains manual until a dedicated content-ops workflow is established.

---

## Skool Community Launch

**Status:** Deferred until academy backend ships  
**Reason:** Skool requires active content moderation, community management, and a payment-gated curriculum. Launching without the backend makes the community a dead end. Pair with the academy backend milestone.

---

## Streaming WAV Rendering in vibe-os MCP

**Status:** Deferred (medium-term)  
**Reason:** Current `design_frequency_session` with `output_path` renders synchronously. For sessions longer than ~30 seconds this blocks the MCP call. Streaming rendering requires either async MCP support or a background job queue — neither is trivially available in the current FastMCP setup.

---

_Add deferred items here rather than in the roadmap. Each entry needs: what it is, why it's deferred, and what would unblock it._
