# Worker brief — SWV-DRY-001

**Role:** Worker  
**Parent:** C9 dry harness  
**Model hint:** deepseek/deepseek-v4-flash  
**Title:** Claim-guard fixture gap scout

## Role definition

| Does | Does not |
|------|----------|
| Implement only within scopePaths; produce evidence paths | Expand scope; touch forbidden paths; sole-verify |

## Objective

Read-only: list missing adversarial cases for claim-guard fixtures; propose test names only; no code edits.

## In scope (only these paths)

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

## Worker output format

1. What changed (paths) or explicit no-op with rationale
2. Commands run + exit codes
3. Evidence paths for Verifier
4. Residual risks / open questions
5. Do **not** self-mark verified — Verifier + Chair decide

## Paste for `sessions_spawn`

Copy this brief as the child task text. Stay inside scopePaths. Forbidden paths are hard stops.
