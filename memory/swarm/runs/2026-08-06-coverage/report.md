# Swarm protocol run — Pack 3 Coverage (authority/memory guards)

**Date:** 2026-08-06 ~19:15–19:19 PDT  
**Trigger:** Jason go after mem-health 1–4  
**Focus:** guards for superseded stubs, path existence, present-tense model claims, historical-as-current  
**Workers:** DeepSeek Flash ×3 — all PASS  
**Chair:** Nova · xai/grok-4.5  
**Mode:** read-only · nothing implemented  
**Overall:** **PASS** (gap map complete)

## Workers
| Class | Packet | Status |
|-------|--------|--------|
| superseded + live-table | `worker-superseded-guards.md` | PASS |
| path + model claims | `worker-path-model-guards.md` | PASS |
| regress map | `worker-regress-map.md` | PASS |

## Chair correction (worker lag)
Workers wrote before/during mem-health 1–4 closeout. **Already landed tonight (do not re-queue as open):**
- `priority-dashboard.md` SUPERSEDED stub (no live task tables)
- Proc 3 SUPERSEDED stub
- MEMORY glm annotate + C1–C8 header
- path microfixes (#3–4)

**Still true:** those gains have **zero automated tests**.

## Protected now (chair re-ran)
| Suite | Result | Protects |
|-------|--------|----------|
| `test-claim-guard.mjs` | **21/21 PASS** | Batch A placeholders |
| `test-session-startup.mjs` | **17/17 PASS** | identity At + RETRIEVAL_DEGRADED |
| `test-cursor-worker.sh` | structural PASS (live smoke needs agent on PATH) | auth isAuthenticated / pin |

## Unprotected (tonight’s failure classes)
| Gap | Blast | Proposed | Effort |
|-----|-------|----------|--------|
| **1** Superseded stub structural guard (dashboard + Proc 3) | HIGH | `test-superseded-stubs.mjs` — SUPERSEDED marker; no live `\| N \|` task rows; Proc 3 no commit/push checklist | **S** |
| **2** Present-tense model claims vs live config | HIGH | `test-model-claims-vs-config.mjs` — brain/swarm/cursor docs ↔ openclaw.json + cursor-worker default; historical dailies report-only if bare present-tense | **S–M** |
| **3** Canonical path existence in core docs | MED-HIGH | `test-canonical-paths.mjs` — backtick paths in MEMORY/TOOLS/AGENTS/HEARTBEAT/procedural; globs allowed; denylist dead planned paths | **M** |
| **4** claim-guard EVIDENCE path validation (optional flag) | MED | extend claim-guard `--pathcheck` | **M** |
| **5** cursor-worker `--structure-only` / PATH bootstrap in test | LOW-MED | CI without live agent auth | **S** |

**Note:** claim-guard on clean stubs false-fires on words like “live” — superseded guards must be **structural**, not banned-word.

## Minimal regress (post-Cursor nights)
```bash
node scripts/test-claim-guard.mjs
node scripts/test-session-startup.mjs
bash scripts/test-cursor-worker.sh   # structural; fix PATH for live smoke
# optional full: test-memory-health, error-doctor, retrieval-eval, swv, trajectory, …
```
`regress-v0.json` still missing (HOLD pack JSON) — command list is enough for now.

## Recommended next (Jason pick)
1. **Implement gap 1 only** (S, Cursor) — locks dashboard + Proc 3  
2. **Gaps 1+2** — adds model-claim freshness  
3. **More Flash CHI** — other harness holes  
4. **stop**

## Not done
No test code written · no config · no git
