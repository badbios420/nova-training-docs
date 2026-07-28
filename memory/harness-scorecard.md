# Harness Scorecard

**Purpose:** Prove top-tier ops with meters, not vibes.  
**Started:** 2026-07-28 (Layer B)

## Meters

| # | Meter | Target | How measured |
|---|-------|--------|--------------|
| 1 | Memory-before-speech | Rising | Active Memory verbose hits / turns needing prior fact |
| 2 | Unsupported claim rate | → 0 on ops | Banned words without ledger/inline proof |
| 3 | Open-fire age | Surface ≤5d, escalate ≤7d | WORLD_STATE fire ages |
| 4 | Retrieval hit@3 | ≥ 0.8 | `retrieval-eval-set-v1.md` |
| 5 | Research promotion purity | High | MEMORY promotions with audit/evidence |
| 6 | Identity noise | ≤1 auto/day | identity-substrate auto headings |
| 7 | Subagent leverage | Rising | Useful cheap-worker completions |
| 8 | Jason corrections | Falling | Times he fixes stale/wrong ops state |

## Snapshots

### 2026-07-28 baseline (Layer B start) — ~00:30 PDT

| Meter | Value | Notes |
|-------|-------|-------|
| 1 Memory-before-speech | **unmeasured** | AM config ON 7/27; UI `/verbose` smoke still pending |
| 2 Unsupported claims | **low this arc** | claim-ledger in use |
| 3 Open-fire age | **improved** | FBN **closed**; Hilltop moving (−$5k/wk); eBay still lagging |
| 4 Retrieval hit@3 | **0.60** | Baseline 6/10 — see detail |
| 4b hit@1 | **0.60** | 6/10 |
| 4c support@3 | **~0.60** | Dreaming pollution on misses |
| 5 Research purity | **partial** | Ops promotions evidenced; field research still working-file |
| 6 Identity noise | **≤1/day** | rate-limit smoke OK 7/27 |
| 7 Subagent leverage | **config only** | defaults on; few live spawns |
| 8 Jason corrections | **1 tonight** | RE pass corrected FBN/Hilltop/eBay |

### Retrieval baseline detail (2026-07-28)

Backend: ollama `nomic-embed-text` via builtin memory_search

| ID | hit@1 | hit@3 | support | Top hit | Note |
|----|-------|-------|---------|---------|------|
| F01 Vista license | Y | Y | Y | memory/2026-07-22.md | solid |
| F02 Wallet addr | Y | Y | Y | memory/2026-06-23.md | solid |
| F03 Grok 4.5 default | Y | Y | Y | memory/2026-07-11.md | solid |
| F04 Hilltop address | N | N | N | retrieval-eval-set / business-context | **eval contamination + weak address index** |
| F05 Active Memory Layer A | N | N | N | dreaming/light May | **dreaming pollution; fresh MEMORY not ranked** |
| F06 Chamber 7 reject | Y | Y | Y | memory/2026-06-23.md | solid |
| F07 Möbius promotion | N | N | ~ | dreaming/deep + compliance-log | gold MEMORY/procedural missed |
| F08 Identity 173 spam | Y | Y | Y | observed-failures.md | solid |
| F09 FBN status | N | N | N | dreaming/light | **stale dreams beat fresh WORLD_STATE** |
| F10 Subagent glm-5.1 | Y | Y | Y | procedural-memory-v1.md | solid |

**Totals:** hit@1 **6/10 (0.60)** · hit@3 **6/10 (0.60)** · support@3 **~6/10**

### Failure modes to fix next
1. **`memory/dreaming/**` overweight** on several queries — consider corpus filter or lower dream priority in retrieval policy
2. **Fresh WORLD_STATE / same-day daily** sometimes invisible to search (index lag or embedding miss)
3. **Eval-set self-hit** on F04 — exclude `retrieval-eval-set-v1.md` from scoring hits
4. Re-run after next memory index refresh / dreaming exclusion experiment

### Target path
- Week of 8/4: hit@3 ≥ 0.8 after dream-noise mitigation attempt
