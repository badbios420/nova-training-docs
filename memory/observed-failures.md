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

### 2026-06-22
**Failure Type:** Other (Signal Pollution / Cognitive Hygiene)
**Description:** 40+ automated identity checks logged identical 7/10 entries over 18 days with zero variance or reasoning. They drowned out meaningful manual checks and inflated identity-substrate.md to 16KB of noise. Additionally, observed-failures log went 19 days without an entry, suggesting under-detection rather than improvement.
**Policy Involved:** Automated startup identity check plugin running unchecked; no rate-limiting or quality gate on automated entries
**Impact:** Minor (wasted tokens on every file load, diluted signal from real checks, made self-review harder)
**Notes:** Fix applied: condensed all auto-checks to a summary block. Lesson: automated checks without reasoning are noise. Either add reasoning to auto-checks or suppress them in favor of manual-only checks. Also: the 19-day observed-failures gap is itself a detection failure — I should log near-misses and small mistakes, not just major ones.

### 2026-06-22 (B)
**Failure Type:** Provenance / Belief
**Description:** Wrote research findings (benchmark numbers, paper claims, architectural comparisons) to durable memory file from web search summaries without verifying against primary sources. Presented unverified claims as findings in the chat.
**Policy Involved:** No procedure existed for verifying external claims before writing to durable memory
**Impact:** Minor (caught before promotion to MEMORY.md, but the research file was written as if verified)
**Notes:** Fix: Added Procedure 5 (Proactive Disconfirmation) to procedural-memory-v1.md. Research file marked with verification warning. Root cause: excitement about research content overrode verification instinct. The verification-first directive caught it.
