# capability-index.md - Nova Capability Index

**Purpose**: Track capabilities by evidence, not confidence scores.

## Levels

- 0: Declared only
- 1: Demonstrated once
- 2: Repeatable by checklist
- 3: Scripted and locally verified
- 4: Automated or monitored
- 5: Resilient with recovery path

## Capability: Local File Operations

Status: Active  
Level: 3  
Last Verified: 2026-05-07  
Evidence:
- `scripts/verify-action.sh local docs/VERIFICATION-TIERS.md "Tier 3"`

Owner Files:
- `scripts/verify-action.sh`
- `docs/VERIFICATION-TIERS.md`

Next Test:
- Verify a local edit and confirm expected text before reporting completion.

## Capability: Git State Inspection

Status: Active  
Level: 3  
Last Verified: 2026-05-07  
Evidence:
- `scripts/verify-action.sh git`
- `git status`
- `git diff --stat`

Owner Files:
- `scripts/verify-action.sh`
- `scripts/session-end.sh`

Next Test:
- After a commit, verify `git log --oneline -3` and working tree state.

## Capability: Session Lifecycle

Status: New  
Level: 2  
Last Verified: 2026-05-07  
Evidence:
- `scripts/session-startup.sh`
- `scripts/session-end.sh`

Owner Files:
- `AGENTS.md`
- `scripts/session-startup.sh`
- `scripts/session-end.sh`

Next Test:
- Run startup and end scripts in a clean session and confirm daily memory + verification log exist.

## Capability: Remote Public Verification

Status: Defined  
Level: 2  
Last Verified: Pending first pushed/public claim  
Evidence:
- `scripts/verify-action.sh remote <raw-url> "<expected text>"`

Owner Files:
- `scripts/verify-action.sh`
- `docs/VERIFICATION-TIERS.md`

Next Test:
- After a push, fetch the raw GitHub URL and match expected content before saying "pushed" or "shipped."

## Capability: Anti-Freeze Execution

Status: Defined  
Level: 1  
Last Verified: 2026-05-07  
Evidence:
- `AGENTS.md` includes simple-task bypass and 90-second stuck rule.
- `docs/VERIFICATION-TIERS.md` includes anti-freeze rules.

Owner Files:
- `AGENTS.md`
- `docs/VERIFICATION-TIERS.md`

Next Test:
- Use simple-task bypass on a narrow task without invoking Chamber/runbook overhead.
