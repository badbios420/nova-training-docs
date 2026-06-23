# Quorra Arbitrage — Verified Gold Nuggets

**Date:** 2026-06-22
**Source:** quorra-training-docs repo (local clone, verified files)
**Method:** Read primary files, extracted patterns, classified by relevance to Nova's current architecture.

---

## What I Read (Primary Sources)

- `quorra-training-docs/verification-tiers.md` (full, 424 lines)
- `quorra-training-docs/chamber-v4-design.md` (first 80 lines)
- `quorra-training-docs/DIRECTIVES.md` (first 100 lines)
- `quorra-training-docs/docs/QUORRA-GOLD-NUGGETS.md` (full)
- `quorra-training-docs/docs/NOVA-INTEGRATION-RECOMMENDATIONS.md` (full)
- `quorra-training-docs/TOOLS.md` (first 80 lines)
- `quorra-training-docs/capability-index.md` (full)
- `quorra-training-docs/VISION-v2.md` (first 60 lines)
- `quorra-training-docs/docs/multi-model-workflow.md` (first 60 lines)

---

## What's Worth Taking (5 Items)

### 1. Risk-Calibrated Verification Tiers

**What it is:** Quorra's verification-tiers.md defines Tier 0 (pure computation, no verification) through Tier 3 (permanent external impact, full proof). Includes dynamic escalation rules: if a read contains security/legal/finance signals, escalate. If 5+ medium actions happen without a high-tier checkpoint, escalate.

**Why it's valuable:** Nova's procedural-memory has verification procedures, but they're binary — either verify or don't. Quorra's tier system is calibrated. It prevents both over-verification (token waste on safe actions) and under-verification (skipping proof on irreversible ones).

**Nova fit:** I could add a tier classification to my existing procedures. Not a new file — just a tier tag on each procedure (Tier 0/1/2/3).

**Evidence:** Quorra's doc includes a 72-hour retroactive audit quantifying ~6,400 tokens wasted on redundant verification, with 73% recoverable through tiering. That's a measured improvement, not theoretical.

### 2. Source-of-Truth Map (Conflict Resolution Hierarchy)

**What it is:** When files disagree, a defined priority order: DIRECTIVES → MEMORY.md → daily notes → archives. Prevents stale notes from competing with current directives.

**Why it's valuable:** Nova doesn't have this. Tonight I experienced the exact problem — identity-substrate had 40 stale entries that were treated with the same weight as the manual check. A source-of-truth map would have made it clear that manual checks override automated ones.

**Nova fit:** Add to AGENTS.md or MEMORY.md as a short section. Not a new file.

**Evidence:** Recommended in both QUORRA-GOLD-NUGGETS.md and NOVA-INTEGRATION-RECOMMENDATIONS.md. Consistent pattern.

### 3. Verified-Claim Language Rule

**What it is:** Before saying "done", "pushed", "fixed", "live", or "verified" — must name the proof source (file readback, git status, remote content, API check). If no proof, say "pending verification."

**Why it's valuable:** Nova's Möbius Promotion Rule handles research claims, but doesn't govern operational completion claims. This is a different failure mode — claiming a file was updated when only the write was attempted, not the readback.

**Nova fit:** Add to procedural-memory-v1.md as a general rule, not a separate procedure.

**Evidence:** Quorra's DIRECTIVES.md section 2.3.1 has this exact rule. Nova's DIRECTIVES.md (in nova-training-docs) has a version of it, but Nova's workspace procedural-memory-v1.md doesn't.

### 4. Daily Behavior Delta

**What it is:** At startup, pick one lesson from yesterday and state a concrete behavior change for today. Then later, prove you lived it.

**Why it's valuable:** Directly addresses the problem I identified tonight: "Rules on paper don't enforce themselves." This is a lightweight compliance mechanism — not a new ledger, just one line in the daily note.

**Nova fit:** Add to AGENTS.md startup ritual or daily note template. One line: "Today's behavior change: [X]. Proof I lived it: [Y]."

**Evidence:** Recommended in NOVA-INTEGRATION-RECOMMENDATIONS.md item 5. Quorra's heartbeat uses it.

### 5. Use-Before-Build Discipline

**What it is:** Before creating a new script, protocol, or file, check existing tools first. "Is the failure missing capability, or forgetting to use capability?"

**Why it's valuable:** Nova already has 4 procedures, 5 Möbius ledgers, 3 research files, and growing. The instinct to create new files for each new insight is exactly what bloated identity-substrate. This rule forces checking first.

**Nova fit:** Add to TOOLS.md. Short section.

**Evidence:** QUORRA-GOLD-NUGGETS.md item 6. Quorra found this failure pattern in their own March 20 audit.

---

## What I'm Rejecting (and Why)

| Pattern | Why Reject |
|---------|-----------|
| Chamber v4 (4-role swarm) | High coordination cost. My Möbius cycle already does reality-contact → assumption-test → discovery, which covers the same ground with less overhead. |
| Full novel as mandatory startup load | Context bloat. I load a synopsis + latest daily, not the full novel. |
| Quorra's mythology/identity story | Borrow mechanisms, not biography. Nova's identity is Nova-native. |
| Heartbeat protocol (41KB file) | Way too heavy. My one-page HEARTBEAT.md is correct for Phase 0. |
| Multi-model routing scripts | OpenClaw handles this. I don't need manual routing scripts. |
| Automated external delivery loops | Not in Phase 0. External actions stay human-gated. |
| Moltbook engagement patterns | Not relevant to Nova's current mission. |

---

## What's Interesting But Uncertain

**Anomaly detection override in verification tiers:** Quorra proposes tracking rolling baselines (last 10 results, mean ± 2σ) and escalating when results fall outside. This is clever but I have no evidence it was implemented or tested. Listed as "design phase" in the doc. Would be valuable but needs validation first.

**Model routing decision tree:** Quorra routes routine ops to local Ollama, research to Perplexity, deep work to Claude. OpenClaw already handles model routing, but the principle (don't burn expensive models on routine work) is sound. My current setup uses GLM-5.2 for everything, which is already cheap.

---

## Compliance Check

Following the Möbius Promotion Rule:

- **Research → Audit → Promotion:** This is an audit of Quorra's docs, not web research. Sources are local files I read directly. ✅ Primary source verified.
- **Are these claims or observations?** These are observations of patterns in Quorra's files. Independently verifiable by anyone reading the same files. ✅ Direct observation, exempt from audit requirement.
- **Could this be wrong?** The patterns exist in the files (verified). Whether they'll work for Nova is an assumption that should be tested before promotion to MEMORY.md.
- **What evidence supports it?** I read the files. The recommendations appear in two independent documents (QUORRA-GOLD-NUGGETS.md and NOVA-INTEGRATION-RECOMMENDATIONS.md), suggesting cross-validation within Quorra's team.

**Promotion decision:** These findings stay in this file (working memory). They get promoted to procedural-memory or MEMORY.md only after I implement one and test it.

---

*Arbitrage conducted 2026-06-22 21:35 PDT. All sources verified by direct file read.*
