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
| 3 Open-fire age | **mixed** | FBN **closed**; Hilltop moving (−$5k/wk); eBay **7d lag** (hit escalate threshold 7/28 midday) |
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

### 2026-07-28 midday — efficiency pass (~11:25–11:40 PDT)

**Config** (backup `openclaw.json.bak.2026-07-28-memory-efficiency`):
- `memorySearch.query.minScore` 0.38; maxResults 8
- hybrid vector 0.55 / text 0.45; MMR on λ0.75; temporalDecay on halfLifeDays 14
- Active Memory: promptStyle `strict`, maxSummaryChars 220, timeoutMs 12000
- validate OK

**Policy:** ops-first order + mandatory dream/noise filter (Procedure 14); AM = untrusted cache

**No hard path-exclude** in OpenClaw memorySearch — agent-side filter is the control surface. Dreaming left enabled (consolidation still useful).

| Meter | Value | Notes |
|-------|-------|-------|
| 4 Retrieval hit@3 **raw** | **0.60** | Still dream-dominated on several queries |
| 4 Retrieval hit@3 **filtered** | **0.80** | Drop dreaming/DREAMS/eval-self; F05 accept includes procedural |
| 4b hit@1 filtered | **0.70** | 7/10 |
| 4c support@3 filtered | **~0.80** | |
| 1 Memory-before-speech | unmeasured | AM tightened; UI verbose smoke still open |
| 3 Open-fire age | mixed | eBay 7d escalate (unchanged this pass) |

**Filtered detail (post policy):**
| ID | hit@1 | hit@3 | Note |
|----|-------|-------|------|
| F01 | Y | Y | gold daily after dream drop |
| F02 | Y | Y | wallet daily/v2 after dream drop |
| F03 | Y | Y | 7/11 daily + MEMORY |
| F04 | N | N | still weak address index; ops-first WORLD_STATE covers live use |
| F05 | Y | Y | procedural-memory Layer A procedure (accept path updated) |
| F06 | Y | Y | 6/23 daily after dream drop |
| F07 | Y | Y | procedural Möbius/research protocol |
| F08 | N | Y | identity-substrate / observed-failures in top3 |
| F09 | N | N | **raw top5 all dreams**; ops-first WORLD_STATE/today required |
| F10 | Y | Y | procedural + MEMORY after dream drop |

**Verdict:** Efficiency win via **filter + ops-first**, not via magic ranking alone. Raw index still needs future hard exclude or out-of-tree dream storage for F09-class misses.

### 2026-07-28 12:30 — automated runner (Cursor job #2 + Nova full run) — **CANONICAL**
Tool: `node scripts/retrieval-eval.mjs` (live `openclaw memory search --json`)
Report: `memory/cursor-jobs/retrieval-eval-report-20260728-1230.md`

| Meter | Raw | Filtered |
|-------|-----|----------|
| hit@1 (15 facts) | **0.33** | **0.53** |
| hit@3 (15 facts) | **0.53** | **0.60** |

Filtered hit@3 by category: durable_facts **0.80** · current_ops/recent/procedures/historical **0.50**

Misses of note: F04 address; F08/F09/F11/F14/F15 often eval-self or empty after filter. Automated 15-fact set is a stricter baseline than midday manual 10-fact filtered 0.80.

**Canon rule (2026-07-28 A-fix):** Quote this automated 15-fact row as current retrieval health. Midday manual filtered 0.80 is historical/legacy only.
