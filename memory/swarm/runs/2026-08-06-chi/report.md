# Swarm protocol run — Pack 2 CHI (Find today’s best improvements)

**Date:** 2026-08-06 ~18:09–18:17 PDT  
**Trigger:** Jason → **2** (Flash cheap window)  
**Workers:** DeepSeek Flash ×5 — all PASS  
**Chair:** Nova · xai/grok-4.5  
**Mode:** read-only · nothing auto-edited  
**Overall:** **PASS**

## Workers
| Class | Status | Packet |
|-------|--------|--------|
| duplicate | PASS | `worker-duplicate.md` |
| stale | PASS | `worker-stale.md` |
| missing-test | PASS | `worker-missing-test.md` |
| regression-risk | PASS | `worker-regression-risk.md` |
| optimization | PASS | `worker-optimization.md` |

## Chair-ranked improvements (implement candidates)

| Rank | ID | Finding | Class | Effort | Why first | Implement surface |
|------|-----|---------|-------|--------|-----------|-------------------|
| **1** | **CG-placeholder** | claim-guard clears `done` when `EVIDENCE: []` / `-` / `N/A` / `none` | regression | **S** | Chair **re-probed live** — false PASS on decorative evidence. Empty/whitespace markers already fixed 8/1; **placeholders still open**. | Cursor · `claim-guard-lib` + tests |
| **2** | **CW-auth** | `cursor-worker.sh` greps `logged in` → matches **“Not logged in”** (false clear) | regression | **S** | Chair re-probed: `echo 'Not logged in' \| grep -qi 'logged in'` matches. Use `agent status --format json` → `isAuthenticated`. | Cursor · cursor-worker.sh + test |
| **3** | **ID-At** | `lastIdentityCheckAt` frozen at first timestamp while date rolls (live: date 8/6, At 8/1) | stale+regress | **S** | Live state confirmed; untested branch; future freshness gates lie | Cursor · `session-startup-lib` + tests + one-time state repair |
| **4** | **STARTUP-degraded** | both LIGHT searches fail still `STARTUP_OK` — silent empty context | regress | **S** | Matches observed “acts blank” class; emit `STARTUP_RETRIEVAL_DEGRADED` + daily line | Cursor · `session-startup-lib` + tests |
| **5** | **OPT-3** | fold `memory-embed-warmup` → `probe --warmup` | opt | **S** | One less CLI; measured overlap | Cursor · probe + thin alias + Proc 16 refs |
| **6** | **OPT-2** | Node `v24.18.0` / `buildChildEnv` duplicated ×8 | opt+dup | **S–M** | Pin drift class (real incident) | Cursor · `scripts/lib/node-env.mjs` |
| **7** | **OPT-1** | retrieval-eval `--concurrency N` | opt | **M** | Measured 15-fact ~2min → ~45–55s @3 | Cursor · retrieval-eval |
| **8** | **CW-tests** | cursor-worker thin tests (raw only) + auth gate tests | missing-test | **M** | Pairs with #2; fake-agent shim | Cursor · extend test-cursor-worker |
| **9** | **GMAIL-merge** | batch vs batch2 twin + shared log path + query drift | dup+test | **M** | External-action risk; HOLD until unsub reopened | Cursor later / Jason gate |
| **10** | **WORLD_STATE ages** | eBay “13d” is **16d**; Grok “~4d” is ~1d | stale | **S** | Ops truth; Nova L1 WORLD_STATE refresh OK | Nova ops pass |
| **11** | **VERIFIER-glm** | skill still names `zai/glm-5.1` as worker default | stale | **S** | One-line → Flash | Cursor micro |
| **12** | **CG-bullet-window** | possible long bullet-block evidence distance (2nd regress worker) | regression | **S–M** | Chair quick repro mixed; keep as follow-up after #1 | Cursor after #1 |

## Chair rejects / demote
- Full gmail test suite **before** merge — premature  
- Session-startup same-day search cache — staleness risk  
- Browser shell tests — P0 not ready  
- Skill-diet sprawl — pack later  

## Recommended implement batch (Jason pick)

**Batch A — harness truth (highest ROI, Cursor, ~S):**  
1 CG-placeholder + 2 CW-auth + 3 ID-At + 4 STARTUP-degraded + 11 VERIFIER-glm  

**Batch B — speed/dedupe (Cursor, after A + regress):**  
5 OPT-3 + 6 OPT-2 + 7 OPT-1  

**Batch C — later / Jason gate:**  
8 CW-tests expand · 9 gmail · 10 WORLD_STATE ages (Nova L1 OK) · 12 CG-bullet follow-up  

**After any Cursor batch → pack 1 REGRESS** (Flash).

## Verified consistent (don’t thrash)
Brain grok-4.5 · swarm Flash · Cursor pin · IDENTITY no ADA · Proc 23 landed · most harness scripts already have tests

## Next
Reply: **`A`** · **`A+B`** · subset IDs · **`your call`** · continue swarm **`9`** / **`5`** · **`stop`**
