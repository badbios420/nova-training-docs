# Acceptance checklist — SWV-DRY-001

**Title:** Claim-guard fixture gap scout  
**Parent:** C9 dry harness  
**Objective:** Read-only: list missing adversarial cases for claim-guard fixtures; propose test names only; no code edits.

## Role gate

| Role | Does | Does not | Status (verified/pending/rejected) |
|------|------|----------|-------------------------------------|
| Scout | Read-only inventory, prior art, risks, open questions | Edit product code; claim done | pending |
| Worker | Implement only within scopePaths; produce evidence paths | Expand scope; touch forbidden paths; sole-verify | pending |
| Verifier | Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis | pending |

## Scope

**In scope:**

- scripts/claim-guard.mjs
- scripts/lib/claim-guard-lib.mjs
- memory/evals/fixtures/claim-guard/
- scripts/test-claim-guard.mjs

**Out of scope (hard):**

- openclaw.json
- wallet
- secrets
- MEMORY.md rewrite
- live send/spend
- C1-C8 mass redo

## Evidence required

- paths read
- proposed missing cases list
- no file writes claim

## Acceptance items

1. 3+ concrete missing cases OR explicit none-found with rationale
2. each case maps to a test name
3. no production money paths

## Dry-run grading

| Check | Pass? | Notes |
|-------|-------|-------|
| Task JSON validates | | |
| Scout brief rendered (no leftover required mustache vars) | | |
| Worker brief rendered (no leftover required mustache vars) | | |
| Verifier brief rendered (no leftover required mustache vars) | | |
| Evidence stubs present | | |
| Forbidden paths untouched | | |
| CLI did not auto-spawn agents | | |

## Chair note

Chair (Nova) synthesizes live runs. Verifier marks checklist only — not final promote.
