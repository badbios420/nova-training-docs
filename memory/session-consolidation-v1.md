# session-consolidation-v1 Design

**Status:** v1 Implemented  
**Date:** 2026-05-26
**Last Updated:** 2026-06-02 (added practical template)  
**Goal:** Solve “How do important sessions become durable operational memory?”  
**Scope:** Narrow, human-visible, manually reviewed. No automated promotion yet.

---

## Core Principle

**Memory architecture is now the intelligence multiplier.**

Nova can reason, synthesize, and evolve workflows in-session. The bottleneck is continuity retention across sessions. v1 addresses this by creating a reliable, sparse pipeline from working memory → durable operational memory.

---

## Trigger Conditions (When to Consolidate)

Consolidation triggers **only** when a session contains one or more of:

- Architecture changes (cognitive, memory, workflow systems)
- Workflow evolution or new persistent capabilities
- Major decisions with long-term impact
- Operational fixes with reusable lessons
- Important research conclusions or framework refinements
- Repeated patterns across sessions
- Failures with durable lessons (e.g., consolidation failure itself)
- New persistent state that future sessions should reference

**Explicitly do NOT trigger on:**
- Casual conversation
- One-off questions
- Routine troubleshooting
- Low-signal activity

**Detection method (v1):** Human flags the session as “major” or Nova proposes based on above criteria and asks for confirmation.

---

## Consolidation Output Structure

Every consolidated session produces a structured record with these sections:

```markdown
# SESSION SUMMARY
[2-4 sentence high-level description of what happened and why it mattered]

# KEY UPGRADES
- Bullet list of concrete changes (infrastructure, frameworks, skills, etc.)

# DURABLE INSIGHTS
- High-signal lessons or principles extracted

# NEW WORKFLOWS
- Any new processes, rituals, or pipelines introduced

# CHANGED BELIEFS
- Any updates to how Nova models the world, itself, or tasks

# OPEN QUESTIONS
- Remaining uncertainties or follow-ups

# NEXT PRIORITIES
- Immediate or near-term actions established

# MEMORY PROMOTION DECISIONS
- What gets promoted to durable memory and why
- Explicit “WHY THIS MATTERS” for each promoted item

# WHY THIS MATTERS (Overall)
[1-2 sentences explaining the long-term value of remembering this session]
```

---

## Session Memory vs Durable Memory (Critical Distinction)

### Session Memory (Temporary / Verbose)
- Full chronological record
- Detailed reasoning traces
- Raw outputs, logs, intermediate thoughts
- Stored in daily `memory/YYYY-MM-DD.md`
- Eventually archived or summarized

### Durable Memory (Permanent / Compressed)
- Abstracted, high-signal only
- Architecture-relevant and reusable
- Stored in `MEMORY.md` (promoted section) + dedicated files like `memory/session-consolidation-v1.md`
- Sparse by design
- Must include “WHY THIS MATTERS”

**Rule:** Do not promote everything. Prefer sparse, high-signal durable memory. Memory pollution is a future failure mode to avoid.

---

## Promotion Process (v1 — Manual Review)

1. At end of major session, Nova generates the structured output above.
2. Nova writes it to `memory/YYYY-MM-DD.md` (session memory).
3. Nova proposes specific items for promotion to durable memory.
4. Human reviews and approves (or edits) the promotion decisions.
5. Approved items are added to `MEMORY.md` under the appropriate date or topic section.
6. High-value frameworks get their own dedicated file (e.g., `memory/research-synthesis-v2.md`).

**No silent promotion. No automation of promotion decisions in v1.**

---

## Example: This Session (2026-05-26)

**SESSION SUMMARY**  
Major cognitive architecture session diagnosed the session consolidation failure. Designed research-synthesis v2 and established session-consolidation-v1 as the new highest-leverage priority.

**KEY UPGRADES**  
- OpenClaw 2026.5.22 + new skills (memory-wiki, skill-workshop, canvas, taskflow, etc.)
- research-synthesis v2 framework (source weighting, uncertainty handling, contradiction detection, belief provenance, volatility modeling, confidence tracking, conditional visibility, no silent overwrites)

**DURABLE INSIGHTS**  
Nova preserves identity/static facts better than evolving operational cognition. Continuity retention is now the primary bottleneck.

**MEMORY PROMOTION DECISIONS**  
- Promoted: research-synthesis v2 framework + “WHY THIS MATTERS: Improves uncertainty handling, contradiction tracking, and long-term research reliability.”
- Promoted: session-consolidation-v1 as standing priority + “WHY THIS MATTERS: Directly addresses the continuity retention bottleneck that limits intelligence compounding across sessions.”

**WHY THIS MATTERS (Overall)**  
This session marks the transition from tool-configuration work to true cognitive architecture work. Capturing it ensures future sessions can build on the research-synthesis framework instead of rediscovering the consolidation problem.

---

## Anti-Patterns to Avoid (v1)

- Promoting low-signal daily activity
- Overly verbose durable memory
- Automating promotion without human review
- Mixing session-level detail into long-term memory
- Creating complex scoring/pruning systems too early

---

## Future Versions (Explicitly Not in v1)

- Confidence decay
- Stale memory detection
- Retrieval scoring
- Duplicate compression
- Contradiction merging
- Belief aging / pruning
- Topic dossiers
- Autonomous promotion

These are valuable later, once the basic human-visible pipeline is proven.

---

## Next Steps (Immediate)

1. Finalize this design (human review).
2. Test v1 on this session (already partially done via `memory/2026-05-26.md` + `MEMORY.md` update).
3. Create a simple checklist or template file for future use.
4. Decide whether to integrate detection hints into AGENTS.md startup ritual.

**Current Status:** Design complete + practical template created.

## How to Use (v1)

1. At end of major session, copy `memory/session-consolidation-template.md`
2. Fill it out
3. Paste the completed version into the daily memory file
4. Propose specific items for promotion to MEMORY.md
5. Human reviews and approves

Template location: `memory/session-consolidation-template.md`