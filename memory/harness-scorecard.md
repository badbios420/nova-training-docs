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

### 2026-07-29 — Nova Task Suite v0 (C1)

**Harness outcome meter #new** (not retrieval ranking — filesystem world-model outcomes).

| Item | Value |
|------|-------|
| Suite | `memory/evals/nova-task-suite-v0.json` (+ spec `nova-task-suite-v0.md`) |
| Run | `node scripts/nova-task-grade.mjs` · tests: `node scripts/test-nova-task-grade.mjs` |
| Live smoke (2026-07-29 ~20:03 PDT) | **10/10 (100%)** pass |
| Job report | `memory/cursor-jobs/c1-nova-task-suite-v0-2026-07-29.md` |

Differs from meter #4 (retrieval hit@3): this grades whether live ops/harness facts are **present and checkable** in WORLD_STATE / MEMORY / procedures / continuity artifacts.

### 2026-07-29 — Claim Guard (C2)

**Meter #2 support** (unsupported claim rate): mechanical pre-write lint for banned success words without nearby evidence.

| Item | Value |
|------|-------|
| Tool | `node scripts/claim-guard.mjs` · lib `scripts/lib/claim-guard-lib.mjs` |
| Tests | `node scripts/test-claim-guard.mjs` — **13/13 PASS** |
| Fixtures | `memory/evals/fixtures/claim-guard/{dirty,clean,policy}.md` — dirty exit 1; clean+policy exit 0 |
| Live soft sample | MEMORY.md + claim-ledger + WORLD_STATE + procedural-memory-v1 — **0 violations / 88 cleared** |
| Job report | `memory/cursor-jobs/c2-claim-guard-2026-07-29.md` |
| Procedure hook | Procedure 9 + 11 checklist: optional `node scripts/claim-guard.mjs path/to/note.md` |

### 2026-07-29 — Memory Health Probe (C4)

**Infra reliability meter** (not retrieval hit@k — that remains meter #4 / C3). Detects silent recall outages: sqlite / ollama / embed model / CLI status+search / index empty / dirty stuck.

| Item | Value |
|------|-------|
| Tool | `node scripts/memory-health-probe.mjs` · lib `scripts/lib/memory-health-lib.mjs` |
| Tests | `node scripts/test-memory-health.mjs` — **12/12 PASS** (offline) |
| Recovery | `memory/evals/memory-health-recovery-v0.md` · Procedure 16 |
| Live baseline (2026-07-29 ~20:18 PDT) | **overall `pass`** · exit 0 · search smoke 8 hits · Indexed ~356 · Dirty no |
| Auto report | `memory/cursor-jobs/memory-health-20260729-2017.md` |
| Job report | `memory/cursor-jobs/c4-memory-health-probe-2026-07-29.md` |
| Exit codes | 0 pass · 1 fail · 3 degraded · 2 probe usage/infra |

### 2026-07-29 — C3 Retrieval Residual Attack (~20:49 PDT)

**New canonical automated meter #4 row** (n=15). Prior 12:30 row kept for history.

| Mode | hit@1 | hit@3 | support@3 |
|------|-------|-------|-----------|
| raw | 8/15 (**0.53**) | 10/15 (**0.67**) | 0.67 |
| **filtered (canonical)** | 12/15 (**0.80**) | 13/15 (**0.87**) | **0.87** |
| opsPrefer (secondary) | 0.80 | 0.87 | 0.87 |

**vs 2026-07-28 12:30:** filtered hit@3 **0.60 → 0.87** (+0.27). Stretch ≥0.80 **met**.

| Item | Value |
|------|-------|
| Report | `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md` |
| Job | `memory/cursor-jobs/c3-retrieval-residual-2026-07-29.md` |
| Eval set path | `docs/harness/retrieval-eval-set-v1.md` (moved out of memory/ self-hit pollution) |
| Unit tests | `node scripts/test-retrieval-eval.mjs` — **15/15** |
| Config | `memorySearch.query.maxResults` 8→**24** (bak `openclaw.json.bak.2026-07-29-c3-retrieval`) |
| Residual misses | **F09** FBN (re-ops planning doc ranks over live WORLD_STATE) · **F11** Hilltop weekly cut (semantic drift) |
| Policy | Procedure 14 ops-first still required for F09/F11-class live ops |

### 2026-07-30 — Trajectory closeout

| Item | Value |
|------|-------|
| Title | Alpha P0 night C1-C4 + C5 CLI |
| Outcome | **win** |
| Log | `memory/trajectory-log.md` |
| Note | C5 trajectory-closeout CLI live; alpha P0 C1-C4 meters closed 7/29 |

### 2026-07-30 — C6 Verifier skill (workshop)

| Item | Value |
|------|-------|
| Skill | `verifier-pass-v1` |
| Proposal id | `verifier-pass-v1-20260730-de97704f5f` |
| Status | **pending** (not applied) |
| Job | `memory/cursor-jobs/c6-verifier-pass-skill-2026-07-30.md` |
| Implements | Procedure 11 Gen→Verify + claim-guard pairing |

### 2026-07-30 — Trajectory closeout

| Item | Value |
|------|-------|
| Title | C6 apply + night stop |
| Outcome | **win** |
| Log | `memory/trajectory-log.md` |
| Note | C6 live skill applied 00:17 via CLI |
