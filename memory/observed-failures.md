# Observed Cognition Failures (Empirical Log)

**Purpose:** Lightweight record of real-world failures in retrieval, consolidation, belief revision, and provenance. Used for tuning cognition behavior under operational pressure.

**Format:** Short entries only. One failure per entry.

---

## Template

**Date:** YYYY-MM-DD  
**Failure Type:** [Retrieval / Consolidation / Belief / Provenance / Other]  
**Description:** [What happened]  
**Policy Involved:** [Which policy layer was active or missing]  
**Impact:** [Harmful / Harmless / Minor]  
**Notes:** [Why it failed, context, fix idea if obvious]

---

## Entries

### 2026-05-26
**Failure Type:** Other (Operational Continuity)
**Description:** When asked to push governance changes to GitHub, I had to be guided through basic remote verification and authentication steps, despite having done similar pushes before in this workspace.
**Policy Involved:** Missing operational memory retrieval + no standardized git verification workflow
**Impact:** Minor (slowed down "lock in gains" process, required human guidance)
**Notes:** I incorrectly assumed the remote was missing instead of first verifying execution context (pwd, git remote -v, branch). This is a continuity + procedure memory failure. Fix: Create and follow a standard git verification sequence before any push/commit claims.

### 2026-06-03
**Failure Type:** Retrieval
**Description:** Nova failed to retrieve known recurring research topics and acted blank despite available context.
**Policy Involved:** Weak startup retrieval/orchestration for new main sessions and research sessions
**Impact:** Minor to harmful (causes repeated research, poor continuity, and false "I do not remember" behavior)
**Notes:** Lesson: "research session" and "new main session" must trigger memory retrieval before answering. Search prior research, active beliefs, observed failures, procedural memory, and session consolidation before fresh synthesis.
