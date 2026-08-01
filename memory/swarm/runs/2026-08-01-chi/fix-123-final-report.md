# CHI Fixes 1–3 + Post-fix Regress — Final Report

**Date:** 2026-08-01 ~02:21–02:25 PDT  
**Implementer:** Cursor `cursor-grok-4.5-high`  
**Chair verify + regress:** Nova + DeepSeek Flash ×3  
**Held:** findings 4–5; gmail untouched; no openclaw.json

## Overall: **PASS**

---

## Files changed

| File | Fix |
|------|-----|
| `memory/procedural-memory-v1.md` | Proc 8 current worker → Flash |
| `docs/harness/retrieval-eval-set-v1.md` | F10 gold → Flash |
| `MEMORY.md` | architecture bullet current defaults → Flash (7/31 history kept) |
| `WORLD_STATE.md` | cheap worker row → DeepSeek V4 Flash |
| `scripts/lib/claim-guard-lib.mjs` | empty/whitespace markers ≠ evidence |
| `scripts/test-claim-guard.mjs` | +4 regression tests (17 total) |
| `scripts/cursor-worker.sh` | raw pins model + log_header + tee |
| `scripts/test-cursor-worker.sh` | **new** structural + live raw smoke |
| `TOOLS.md` | raw no longer unpinned exception |
| `memory/swarm/runs/2026-08-01-chi/fix-123-evidence.md` | Cursor evidence note |

## Tests added
- claim-guard: empty EVIDENCE fails; whitespace EVIDENCE fails; filled EVIDENCE clears; Source/CHECKED empty fail  
- `scripts/test-cursor-worker.sh`: raw structural pin + live `RAW_PIN_OK` + log `model=cursor-grok-4.5-high`

## Before / after

| Behavior | Before | After |
|----------|--------|-------|
| Docs default worker | glm-5.1 (stale) | `deepseek/deepseek-v4-flash` |
| `Ship is done` + `EVIDENCE:` | exit **0** (false clean) | exit **1** (violation) |
| `Ship is done` + `EVIDENCE: node … exit 0` | exit 0 | exit **0** (still OK) |
| `cursor-worker.sh raw` | no `--model`, no log header | pin + `model=` in log |

## Cursor raw-mode evidence
- Log: `memory/cursor-jobs/20260801-022440-raw.log` (also earlier `…022343-raw.log`)
- Header: `model=cursor-grok-4.5-high`
- Reply: `RAW_PIN_OK`
- `bash scripts/test-cursor-worker.sh` → **ALL PASS**

## Post-fix regress (Pack 1) — Flash ×3

| Lane | Status | Highlights |
|------|--------|------------|
| A claim/swv/traj | **PASS** | claim-guard 17/17; EMPTY_EXIT=1; REAL_EXIT=0; swv 14; traj 10 |
| B memory/docs | **PASS** | health 12; retrieval 15; task-grade 11; probe quick PASS; Proc8+F10 = Flash |
| C speech/cursor/guard | **PASS** | speech 13; guard 10; protected-settings ok; raw pin ALL PASS |

**Regress overall: PASS** — no regressions from fixes 1–3.

## Not done (held)
- #4 probe --quick heartbeat  
- #5 gmail dual scripts  
