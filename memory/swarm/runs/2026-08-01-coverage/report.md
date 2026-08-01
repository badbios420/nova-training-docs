# Swarm protocol run — Pack 3 What’s not tested? (COVERAGE)

**Date:** 2026-08-01 ~02:29–02:33 PDT  
**Trigger:** Jason “Launch swarm protocol” → **3**  
**Workers:** DeepSeek Flash ×3 (read-only)  
**Chair:** Nova · xai/grok-4.5  
**Overall:** **PASS** (gap map complete; nothing auto-edited)

## Chair-ranked gaps (highest blast radius first)

| Rank | Gap | Class | Why it matters | Proposed next test/smoke |
|------|-----|-------|----------------|--------------------------|
| **1** | `session-startup.mjs` + plugin `session-startup` | Script + plugin | Every main session; past timeout storm was prod-only catch; **zero** `test-session-startup*` | `test-session-startup.mjs` — ritual file presence, LIGHT query shape, timeout defaults, no network required fixtures |
| **2** | `active-memory` plugin | Plugin | Injects every eligible turn; wrong-context risk; only partial F05 eval | Smoke: enable+status path or fixture “AM verbose status line present” when configured |
| **3** | `memory-health-probe.mjs` CLI surface | Script | Has unit lib tests but weak end-to-end CLI contract tests beyond manual --quick | Extend `test-memory-health.mjs` with CLI argv/exit contracts for --quick/--json |
| **4** | `gmail-unsub-batch*.mjs` | Script (external) | Real Gmail side effects; dual scripts (held #5 from CHI) | Mocked dry-run tests **only if** Jason opens unsub work again — not tonight |
| **5** | Proc **10** / **12** weak mechanical accept | Procedure | Research promote + retrieval scorecard not forced through one command gate | Wire claim-guard on research files; ensure retrieval-eval CLI is the P12 path (partially exists) |
| **6** | `browser` / shared-browser | Plugin + shell | P0 ops; only reachability script, no automated smoke in suite | Keep `shared-browser-p0-check.sh`; optional bats later |
| **7** | Proc **2** config change | Procedure | Verify exists; rollback/backup not mechanical | Document backup path in Proc 2 (small doc fix) |
| **8** | `sync-training-repos.sh` / Chrome launchers | Shell | External git/Chrome; lower daily frequency | Dry-run flags + bash -n already; low priority |

## Already strong (do not rebuild)
claim-guard · swv-dry-harness · trajectory-closeout · nova-task-grade · retrieval-eval units · protected-settings-guard · memory-before-speech · cursor-worker (new) · Proc 16/18/19

## Chair recommendations (no auto-implement)
1. **Highest ROI test to write next:** `scripts/test-session-startup.mjs` (fixture-based, no live gateway required if we mock exec)  
2. **Second:** active-memory smoke checklist (even manual documented smoke beats none)  
3. **Defer:** gmail tests until unsub is live again  
4. **Defer:** provider plugin tests (outages are loud)

## Workers
- cov-scripts PASS  
- cov-procs PASS  
- cov-startup-plugins PASS  
