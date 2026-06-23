# Assumption Registry

**Purpose:** Track every assumption explicitly so they can be tested and revised.

**Columns:** Assumption | Confidence | Last Validated | Evidence | Status

---

## Current Assumptions (Phase 0)

**Core Architecture Assumptions (Promoted)**
- Attention ≠ Activity ≠ Priority (High leverage insight) | Last Validated: 2026-06-16 | Confidence: High | Evidence: Consistent with session behavior and priority modeling work | Status: Holding
- Human priorities operate at multiple timescales (Strategic / Tactical / Immediate) | Last Validated: 2026-06-16 | Confidence: High | Evidence: Matches observed human intent patterns across recent sessions | Status: Holding

**Operational Assumptions**
- Manual cycles are sufficient to prove value before automation.
- Breaking large work into small, approved tasks prevents context overflow.
- Explicit ledgers survive session loss better than conversation history alone.

**Assumptions Tested 2026-06-22 (Late Evening Cycle)**
- "Automated identity checks strengthen continuity" | Last Validated: 2026-06-22 | Confidence: Low | Evidence: 40+ identical auto-entries added zero information, diluted signal | Status: **Failed — replaced by: only checks with reasoning carry value**
- "No entries in observed-failures means no failures" | Last Validated: 2026-06-22 | Confidence: Low | Evidence: Signal pollution went unlogged for 18 days | Status: **Failed — replaced by: absence of entries means detection failure, not absence of failures**
- "Default model config propagates to sessions" | Last Validated: 2026-06-22 | Confidence: Medium | Evidence: Required explicit /model default to clear stale override | Status: **Partially failed — overrides can persist; verify on each new session**
- "Research findings can be promoted to durable memory directly" | Last Validated: 2026-06-22 | Confidence: Low | Evidence: 58% of research session claims were unverified; 5 rejected on audit | Status: **Failed — replaced by: Research → Audit → Promotion pipeline. No research enters durable memory without passing audit.**

**New Assumptions (2026-06-22 — Untested, Tracking)**
- "Chamber Protocol produces better decisions than single-model reasoning" | Confidence: Medium | Evidence: 8 chambers run, first PROMOTEs produced real-world deliverables (SOI campaign, listing strategy) | Status: Holding — needs A/B test vs non-chamber decisions (Prediction #6)
- "GLM-5.2 is more capable than Grok 4.3 for agentic tasks" | Confidence: Medium | Evidence: Jason assessment + comparative session performance | Status: Holding — subjective, needs task-level measurement
- "WORLD_STATE.md as operational snapshot improves prioritization" | Confidence: Medium | Evidence: Created per GPT suggestion, aligns with "context not advice" insight | Status: Holding — needs 2-week usage evaluation
- "Cost tracking enables better subscription decisions" | Confidence: Medium | Evidence: 1 day of data ($15 heavy day). GPT recommended 7 days before subscription decision. | Status: Holding — 6 more days of data needed
- "Maintaining a persistent model of Jason's world > generating interesting thoughts" | Confidence: High | Evidence: GPT architecture review + Jason ADHD context. Organization layer > advice layer. | Status: Holding — aligns with observed Jason behavior (firehose of ideas, bottleneck is prioritization)
- "Direct API access to external models tightens feedback loops vs relay through Jason" | Confidence: Medium | Evidence: Claude's observation during audit. Anthropic API now configured. | Status: Holding — testable now that direct access exists
- "Cheap to test is a valid promotion criterion for chambers" | Confidence: Medium | Evidence: GPT approved Chamber #5 PROMOTE on this basis. Flash is free, Flash is testable. | Status: Holding

---

*Phase 0 — All assumptions are manual and require human review before promotion.*