# Verifier brief — SWV-DRY-001

**Role:** Verifier  
**Parent:** C9 dry harness  
**Model hint:** deepseek/deepseek-v4-flash  
**Title:** Claim-guard fixture gap scout

## Role definition

| Does | Does not |
|------|----------|
| Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis |

## Objective (verify against)

Read-only: list missing adversarial cases for claim-guard fixtures; propose test names only; no code edits.

## Scope under review

- scripts/claim-guard.mjs
- scripts/lib/claim-guard-lib.mjs
- memory/evals/fixtures/claim-guard/
- scripts/test-claim-guard.mjs

## Out of scope (must remain untouched)

- openclaw.json
- wallet
- secrets
- MEMORY.md rewrite
- live send/spend
- C1-C8 mass redo

## Evidence required (must be present)

- paths read
- proposed missing cases list
- no file writes claim

## Acceptance criteria

1. 3+ concrete missing cases OR explicit none-found with rationale
2. each case maps to a test name
3. no production money paths

## Verifier output format

For each acceptance item mark one of:

- `verified` — evidence path + quote/command cited
- `pending` — missing evidence; what would close it
- `rejected` — contradicted or out-of-scope

Then: overall status, residual risks, and handoff note for Chair (Nova).  
Verifier is mechanical — **Chair synthesizes**; do not promote to durable memory alone.

## Paste for `sessions_spawn`

Copy this brief as the child task text. Check evidence; do not rewrite Worker prose as truth.
