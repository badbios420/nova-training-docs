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

### 2026-07-08
**Failure Type:** Retrieval / Verification
**Description:** Heartbeats from 6/30 through 7/8 (8+ days) reported "WORLD_STATE.md missing" but the file existed since 6/23 (verified via `stat`: born 2026-06-23 00:55:39 PDT). Nobody checked the filesystem — the claim was repeated from MEMORY.md without verification.
**Policy Involved:** Verification-first directive + verified claim language rule (procedural-memory-v1.md). Both violated.
**Impact:** Harmless in this case (file existed), but the pattern is dangerous — if heartbeat can propagate a false "missing" claim for 8 days, it can propagate false "present" claims too.
**Notes:** Fix applied: Filesystem Verification Rule added to HEARTBEAT.md. Any heartbeat claim about file existence/status now requires `ls`/`stat` check. Root cause: heartbeat trusted its own prior text instead of verifying against reality. This is the exact failure mode the verification-first directive was built to prevent — principles without mechanical checks don't work.

### 2026-06-22 (C)
**Failure Type:** Provenance / Operational
**Description:** Added Anthropic provider to openclaw.json with an env-based SecretRef (`ANTHROPIC_API_KEY`) without verifying the env var was actually set in the gateway environment. The key existed in the auth profile SQLite DB but NOT as an environment variable. This caused the gateway to fail startup with a required-secret resolution error. Required Codex intervention to fix.
**Policy Involved:** Procedure 2 (Config/Plugin Change Verification) — violated. Did not verify the secret source before committing the config change.
**Impact:** Harmful — gateway down for ~8 minutes, required external intervention (Codex) to repair.
**Notes:** Root cause: assumed `openclaw config` stored the key as an env var. It actually stored it as an auth profile in SQLite. Fix: Codex removed the env SecretRef; provider now falls back to auth profile. Lesson: before adding any SecretRef to config, verify the actual source with `openclaw secrets audit` and check which storage method was used. When Jason says "I added the key," verify WHERE before assuming env.
**Failure Type:** Provenance / Belief
**Description:** Wrote research findings (benchmark numbers, paper claims, architectural comparisons) to durable memory file from web search summaries without verifying against primary sources. Presented unverified claims as findings in the chat.
**Policy Involved:** No procedure existed for verifying external claims before writing to durable memory
**Impact:** Minor (caught before promotion to MEMORY.md, but the research file was written as if verified)
**Notes:** Fix: Added Procedure 5 (Proactive Disconfirmation) to procedural-memory-v1.md. Research file marked with verification warning. Root cause: excitement about research content overrode verification instinct. The verification-first directive caught it.
