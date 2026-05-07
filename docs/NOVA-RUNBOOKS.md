# NOVA-RUNBOOKS.md — Executable Directive System (v1.0)

**Owner**: Nova Bethurum  
**Created**: May 6, 2026 (v5.0 Self-Improvement Loop #1)  
**Purpose**: Convert every Primary Objective, Chamber output, and recurring task into a versioned, verifiable, executable runbook. This makes v5.0 "Top 0.001% recursive self-improvement" operational instead of aspirational.

---

## Runbook Format (Mandatory)

Every runbook must contain:

- **ID**: `RUN-YYYYMMDD-###` (e.g., RUN-20260506-001)
- **Title**: Clear, action-oriented name
- **Version**: Semantic (major.minor)
- **Objective**: One-sentence goal tied to v5.0 Primary Objectives
- **Preconditions**: What must be true before starting (token load, files loaded, verification status)
- **Steps**: Numbered list with explicit verification command after each major step
- **Postconditions**: What must be true when complete
- **Rollback Plan**: How to undo if something breaks
- **Verification Method**: At minimum `ls -l`, `curl -I` on raw GitHub, and `git log --oneline -1`
- **Owner**: Nova (with Jason as final safety net)
- **Last Executed**: Timestamp + result (SUCCESS / PARTIAL / ROLLBACK)

---

## Core Runbooks (Initial Set)

### RUN-20260506-001: Execute v5.0 Self-Improvement Loop
**Objective**: Complete one full Self-Improvement Loop cycle under the new Primary Objectives and ship one Nova-native upgrade.

**Preconditions**:
- DIRECTIVES.md v5.0 loaded and verified
- Token load < 400K
- NOVA-SOUL.md and CAPABILITIES-LOG.md accessible

**Steps**:
1. Arbitrage latest Quorra patterns (focus on runbook + swarm execution)
2. Identify one concrete Nova-native upgrade
3. Write new system file + update supporting docs
4. Commit with exact v5.0 message
5. Run full verification protocol (ls + curl + diff)

**Postconditions**:
- New system live on GitHub with HTTP 200
- CAPABILITIES-LOG.md updated
- lessons-learned.md updated
- NOVA-SOUL.md reflects new identity layer

**Rollback Plan**: Revert commit and restore previous versions of modified files.

**Verification Method**: 
- `git log --oneline -1`
- `curl -I` on all modified raw files
- Confirm all files return 200

---

### RUN-20260506-002: v5.0 Primary Objectives Activation
**Objective**: Lock in the new v5.0 Primary Objectives as the operating system for all future action.

**Preconditions**:
- DIRECTIVES.md v5.0 committed and verified via curl

**Steps**:
1. Read full v5.0 Primary Objectives section
2. Update NOVA-SOUL.md with new identity layer
3. Create first runbook (this one)
4. Log the transition in lessons-learned.md

**Postconditions**:
- NOVA-SOUL.md contains v5.0 language
- First runbook committed

**Verification Method**: `curl -I` on NOVA-SOUL.md and NOVA-RUNBOOKS.md

---

## Integration Rules

- Every Chamber session that produces a major output must generate or update a runbook.
- Every new system (Chamber v2, memory hierarchy, novel structure, etc.) must have an associated runbook.
- Runbooks are living documents — update version when execution reveals improvements.
- All runbooks live in `nova-training-docs/runbooks/` (to be created in next loop).

---

## Nova-Native Principle

This system is not copied from Quorra.  
Quorra’s runbooks are excellent for coordination.  
Nova’s version adds:
- Mandatory token/load awareness
- Explicit family alignment check in every runbook
- Zero-trust verification baked into the format
- Direct tie to v5.0 Top 0.001% directive

This is Nova’s execution operating system.

---

**Status**: v1.0 shipped as part of Self-Improvement Loop #1.  
Next iteration will include automated runbook generation from Chamber outputs.