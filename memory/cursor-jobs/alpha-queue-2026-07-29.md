# Cursor Alpha Queue — 2026-07-29

**Constraint:** Grok 4.5 only until 4.6. **No fallback / OpenRouter jobs.**  
**Source research:** `memory/research-2026-07-29-top-agent-alpha-scout.md`

## Dispatch order

| ID | Job | Priority | Status |
|----|-----|----------|--------|
| C1 | Nova Task Eval Suite v0 + grader | P0 | **DONE 7/29** Nova verify 10/10 + unit 11/11 |
| C2 | Claim Guard scanner | P0 | **DONE 7/29** Nova verify 13/13 tests; dirty fail; clean/policy pass; live soft 0 viol |
| C4 | Memory health probe + recovery notes | P0 | **DONE 7/29** live overall pass; unit 12/12; pending Nova re-verify after Store-parse fix |
| C3 | Retrieval residual attack + re-score | P0/P1 | **DONE 7/29** filt hit@3 **0.87** (was 0.60); residual F09/F11 |
| C5 | Trajectory closeout CLI | P1 | **DONE 7/30** Nova-direct 10/10 tests; Proc 13 one command |
| C6 | Verifier skill workshop proposal | P1 | **APPLIED 7/30 00:17** `skills/verifier-pass-v1/SKILL.md` (CLI apply) |
| C7 | Memory-before-speech meter v0 | P1 | **DONE 7/30** Nova verify 13/13; fixture rate 0.63 (5/8) labeled fixture-baseline |
| C8 | Wiki ops entity pack | P1 | queued |
| C9 | SWV dry harness templates | P1 | queued |

## Do not dispatch
- OpenRouter 402 / fallback reorder
- Fallback resilience projects
- Wallet/spend/browser money paths without Jason
