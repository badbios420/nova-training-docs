# Swarm protocol run — Pack 5 Memory hygiene

**Date:** 2026-08-06 ~18:50–18:55 PDT  
**Trigger:** Jason go (DeepSeek burn; skip eBay ops; no GLM/Anthropic)  
**Workers:** DeepSeek Flash ×3 — all PASS  
**Chair:** Nova · xai/grok-4.5  
**Mode:** read-only · no deletes · nothing auto-edited  
**Overall:** **PASS**

## Workers
| Class | Packet | Status |
|-------|--------|--------|
| stale | `worker-stale-mem.md` | PASS |
| dup/conflict | `worker-dup-conflict.md` | PASS |
| structure | `worker-structure.md` | PASS |

## Infra (chair re-probed)
`memory-health-probe --quick --no-report` → **PASS** · Indexed **508/511** dirty=no · embed ~187ms · sqlite OK

## Chair-ranked (implement candidates)

| Rank | Item | Blast | Action | Notes |
|------|------|-------|--------|-------|
| **1** | `memory/priority-dashboard.md` frozen **6/23** — reopens Vista/Sam/IDX/insurance/SOI/CV wrong | **MED** | Supersede banner → WORLD_STATE or archive | Jason gate (whole-file) |
| **2** | MEMORY.md:95 “subagents still glm-5.1 until bake-off” | MED | L2 annotate superseded 8/1 | Cursor 1-by-1 |
| **3** | MEMORY.md:36 header C1–C6 → C1–C8 | LOW-MED | L2 header fix | was SoT #5 |
| **4** | wiki-ops harness-meters / ops-now “C1–C7” | LOW | L2 → C1–C8 | |
| **5** | Broken pointer `knowledge-inventory` → `memory/RECURSIVE-PATTERNS.md` (file at **root**) | MED | fix path | Cursor |
| **6** | `session-consolidation-v1` → nonexistent `research-synthesis-v2.md` | LOW-MED | drop/rewrite pointer | Cursor |
| **7** | Bare script paths in MEMORY/proc (warmup, cursor-worker, verify-custody, eval suite) | LOW | prefix `scripts/` / full paths | Cursor batch |
| **8** | IDENTITY avatar `.png` TBD vs `avatars/nova-galaxy.svg` | LOW | path fix | Cursor |
| **9** | time-awareness heartbeat overdue text stale post 18:38 HB | LOW | L1 refresh | Nova |
| SKIP | eBay 13d→16d ages | — | Jason: eBay not ready / no access | don’t drive eBay action |
| optional | Grok 4.6 window age in WORLD_STATE | LOW | L1 date-anchor 8/7 only | no default flip |
| leave | small orphans ~13.5KB, dream volume under Proc 14, wallet-gen node_modules gitignored | — | no auto-trash | |
| closed | Proc 3 / WS structural Opus | — | SoT #1–2 already landed | |

## Recommended 1-by-1 (DeepSeek already spent; implement = Cursor/Grok)
1. **priority-dashboard supersede** (highest retrieval risk)  
2. MEMORY glm-5.1 annotate + C1–C8 header  
3. knowledge-inventory + consolidation broken pointers  
4. path microfixes batch (7+8)  
5. optional wiki C1–C8  

## Worker quality
| Worker | Kept high/med | Notes |
|--------|---------------|-------|
| stale | #1 dashboard critical | ages noted but eBay skipped per Jason |
| dup | F1–F2 MEMORY + F6 wiki | confirmed SoT 1–2 closed |
| structure | probe PASS + pointer #1–2 | orphans healthy-small |

## Next
Reply number for implement 1-by-1, or **more Flash** (CHI/coverage), or **stop**.
