# Swarm protocol run — Pack 2 Find today’s best improvements (CHI)

**Date:** 2026-08-01 ~02:17–02:20 PDT  
**Trigger:** Jason “Launch swarm protocol” → **2**  
**Workers:** DeepSeek Flash ×3 (read-only)  
**Chair:** Nova · xai/grok-4.5  
**Overall:** **PASS** (findings gathered; nothing auto-edited)

## Ranked improvements (highest ROI first)

| Rank | ID | Finding | ROI | Effort | Chair verify |
|------|-----|---------|-----|--------|--------------|
| **1** | S1 | Proc 8 still says subagent default `zai/glm-5.1`; live is `deepseek/deepseek-v4-flash`. F10 in retrieval-eval-set still golds glm-5.1 | **High** — wrong ops memory + corrupts meter #4 gold | S | **CONFIRMED** config + procedural L288 + F10 |
| **2** | T1 | claim-guard empty/whitespace `EVIDENCE:` clears banned words; no unit test | **High** — known SWV-DRY-001 hole; false “clean” claims | S | **CONFIRMED** earlier + worker live probes |
| **3** | R1 | `cursor-worker.sh` **raw** mode skips `--model` pin + skips model= log header | **Med-High** — pin policy bypass path | S | **CONFIRMED** lines 97–99 |
| **4** | O1 | Default heartbeat memory check → `memory-health-probe --quick`; full probe on schedule | **Med** — faster catch of recall outages | S | **CONFIRMED** `--quick` exists in help |
| **5** | D1 | `gmail-unsub-batch.mjs` vs `batch2.mjs` dual SoT (12 min drift, different sender lists) | **Med-Low** for harness; **Med** if you run unsub again | S | **CONFIRMED** both files exist |
| — | B1 | “Procedure 18 missing” | **Reject false positive** | — | Proc **18 exists** at L533 (`## 18. SWV…`). Worker grepped literal `Procedure 18` string only |

## Do not auto-implement
All HOLD until Jason picks numbers to fix.

## Suggested implement order if Jason says go
1. Patch Proc 8 + F10 gold + any MEMORY one-liner to Flash default  
2. Add claim-guard empty-EVIDENCE unit test (+ minimal lib fix if test should fail-then-fix)  
3. raw mode: either force `--model` unless `CURSOR_RAW_UNPINNED=1`, or always log effective model  
4. HEARTBEAT note: prefer probe --quick  
5. Mark gmail batch1 deprecated or delete after Jason confirms which list is canonical  

## Workers
- chi-dup-stale PASS  
- chi-test-risk PASS  
- chi-opt PASS (B1 overruled by chair)
