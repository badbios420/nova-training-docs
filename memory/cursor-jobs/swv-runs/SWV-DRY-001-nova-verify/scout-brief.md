# Scout brief — SWV-DRY-001

**Role:** Scout  
**Parent:** C9 dry harness  
**Model hint:** deepseek/deepseek-v4-flash  
**Title:** Claim-guard fixture gap scout

## Role definition

| Does | Does not |
|------|----------|
| Read-only inventory, prior art, risks, open questions | Edit product code; claim done |

## Objective

Read-only: list missing adversarial cases for claim-guard fixtures; propose test names only; no code edits.

## Scope (read-only)

- scripts/claim-guard.mjs
- scripts/lib/claim-guard-lib.mjs
- memory/evals/fixtures/claim-guard/
- scripts/test-claim-guard.mjs

## Out of scope (hard)

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

## Acceptance

1. 3+ concrete missing cases OR explicit none-found with rationale
2. each case maps to a test name
3. no production money paths

## Scout output format

1. Inventory of what exists in scope (paths + short notes)
2. Prior art / related tests or docs
3. Risks and open questions
4. Proposed next step for Worker (no implementation)
5. Explicit: **no file writes** this turn

## Paste for `sessions_spawn`

Copy this brief as the child task text. Do not expand scope. Do not edit product code.
