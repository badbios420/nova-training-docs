# Swarm Scorecard v0 (lifetime + session)

**Purpose:** Answer “is the swarm getting more effective?” with meters, not vibes.  
**Owner:** Chair Nova · update after each pack run (not mid-worker)  
**Started:** 2026-08-06 (backfill rough from known runs)

## Lifetime (approx — refine when packing JSON lands)

| Metric | Value | Notes |
|--------|------:|-------|
| Swarm pack runs (logged) | **10+** | 8/1 CHI/coverage/regress/error-doctor×; 8/5 CHI shell; 8/6 doc-audit + CHI |
| Findings filed (worker bullets) | **~80+** | rough; not yet ledgered per-worker |
| Chair-accepted / ranked for implement | **~25** | includes Batch A picks |
| Implemented (Cursor/Codex/Nova) | **~15+** | 8/1 CHI 1–3, coverage 1–2, error-doctor precision, 8/6 authority + Batch A |
| False positives / rejected by chair | **~20+** | gmail-before-reopen, search cache, etc. |
| Regression failures after implement | **1 known** | 8/1 cursor-worker syntax (caught by gate) |
| **Rollbacks / runtime damage** | **1** | 8/6 session-startup-state git checkout |
| Emergency Nova one-liners | **2** | agent symlink ×2 (same night) |

## 2026-08-06 session

| Pack | Workers | Findings ranked | Implemented | Residual |
|------|---------|-----------------|-------------|----------|
| 4 doc-audit | Flash×3 | 13 chair rows | Authority + microfixes (Nova; process debt: should have been Cursor) | — |
| 2 CHI | Flash×5 | 12 ranked | Batch A via Cursor (5/5) | state map shrink; agent symlink |
| Batch A accept | — | — | mini-regress green | see observed-failures 8/6 |
| 9 authority | Flash×3 | ~15 ranked | SoT 1–2 done; eBay ages skipped | Proc3/WS Opus |
| 5 mem-health | Flash×3 | ~12 ranked | implement 1–4 done | dashboard stub + MEMORY + paths |
| 3 coverage (guards) | Flash×3 | 5 test gaps | pending implement | superseded/model/path tests missing |

### Worker quality (CHI 8/6 — chair view)

| Worker | Findings | Chair kept | Notes |
|--------|----------|------------|-------|
| duplicate | 3 | 2 (gmail HOLD, cursor pin/doc, startup prose) | high signal on twins |
| stale | 3 | 3 | ID-At + WORLD_STATE ages + verifier glm |
| missing-test | 3 | 2 (cursor tests, warmup; gmail HOLD) | solid matrix |
| regression-risk | 3+ | 3 critical | CG placeholder **live**, ID-At, STARTUP; auth also confirmed |
| optimization | 3 | 3 for Batch B later | measured times |

## Rules for updating
1. After chair report only — not from raw worker enthusiasm  
2. “Implemented” needs test evidence  
3. Rollbacks always +1 and observed-failures entry  
4. Prefer per-worker keep/reject over “Flash ×N PASS” alone in user summaries  

## Next meter upgrades
- Automate counts from `memory/swarm/runs/*/report.md`  
- Precision = accepted/findings per pack  
- Pack 9 first findings feed SoT debt count  
