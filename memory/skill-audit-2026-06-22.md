# Skill Audit — 2026-06-22

## 1. Spike 🧪

**What it does:** Runs throwaway prototypes to validate feasibility questions. A structured loop: state question → research → build smallest runnable artifact → stress one edge case → verdict (VALIDATED/PARTIAL/INVALIDATED).

**When to trigger:** When you need to test an idea before committing to a real build — "spike this", "is this possible", "compare A/B". Not when docs reading would answer it.

**Nova use case:** Spike a verification approach — e.g., "Can we reliably detect identity drift by diffing SOUL.md embeddings across sessions?" Build a tiny script, run it on last 7 days of memory, report verdict with evidence.

**External tools/config:** None. Pure workspace + exec. Uses `.tmp/openclaw-spikes/<slug>` for artifacts.

---

## 2. TaskFlow 🪝

**What it does:** Coordinates multi-step detached tasks as one durable job with owner context, persisted state, wait/resume lifecycle, and linked child tasks. Survives restarts via revision-checked mutations through `api.runtime.tasks.flow`.

**When to trigger:** Multi-step background work that outlives a single prompt, needs to wait on external events (replies, subagents), or needs small persisted state between steps.

**Nova use case:** Run a Möbius verification cycle as a managed flow: create flow → spawn subagent to run assumption-registry checks → set waiting on results → resume and consolidate findings into discovery-log. State survives if the session drops mid-cycle.

**External tools/config:** Requires OpenClaw runtime `api.runtime.tasks.flow` API. Plugin/runtime access needed — not a standalone script.

---

## 3. AI Self-Review

**What it does:** Structured self-improvement loop: search memory for blindspots/todos → fetch current AI agent research → spawn subagent swarm for parallel research + prototyping → integrate findings into MEMORY.md and new skills.

**When to trigger:** "Self-levelup", agent swarms, memory/RAG optimization, blindspot hunts, or when researching 2026 AI agent trends/tools.

**Nova use case:** Run a blindspot hunt on the Möbius verification work — search memory for recurring verification failures, spawn a subagent to research state-of-the-art agent verification patterns, and integrate any applicable technique into the verification workflow.

**External tools/config:** References `refs/ai-agents-2026.md` and `scripts/swarm-research.py` (todo). Uses `memory_search`, `web_fetch`, and subagent spawning — all available. No external API keys needed.

---

## 4. Recursive Self-Improvement

**What it does:** Pattern hunt through memory files → distill 1–3 actionable patterns → propose changes (never auto-apply) → verify and reflect. Focused on honest, family-aligned growth with explicit approval gates.

**When to trigger:** "Self improve", "recursive", "growth loop", "memory patterns", "distill lessons", or when analyzing recurring issues in memory.

**Nova use case:** Run pattern hunt across last 14 days of daily memory files for recurring Möbius verification gaps or identity-drift signals. Distill concrete proposals (e.g., "add pre-task ritual checkbox for verification status") and log to `memory/self-improvement-log.md` for Jason's review.

**External tools/config:** None. Uses `memory_search` and file read/write only. Fully self-contained.

---

## Summary Table

| Skill | Complexity | External Deps | Best Fit for Nova |
|-------|-----------|---------------|-------------------|
| Spike | Low | None | Quick feasibility checks on verification ideas |
| TaskFlow | High | OpenClaw runtime API | Durable multi-step verification cycles |
| AI Self-Review | Medium | None (refs are todo) | Blindspot hunts, research integration |
| Recursive Self-Improve | Low | None | Pattern distillation from memory, proposal generation |
