# Chamber #10 Verdict — Multi-Subagent Architecture
**Date:** 2026-07-31 ~23:55 PDT  
**Chair:** Nova (xai/grok-4.5) — REAL chair synthesis  
**Status:** CLOSED (working architecture + blocked runtime lanes)

## Question
How should Nova design multi-subagent architecture to run multiple specialists in parallel as a top-tier orchestrator ("boss mode"), mixed with fresh research, using available APIs?

## Consultants Used
| Seat | Model | Provenance | Status |
|------|-------|------------|--------|
| Structural A | anthropic/claude-opus-4-8 | REAL attempt | FAIL — Anthropic credits empty |
| Structural B | zai/glm-5.2 | REAL attempt | FAIL — ZAI billing empty |
| Structural C | deepseek/deepseek-v4-flash | REAL MODEL OUTPUT | OK — full report |
| Workhorse A | zai/glm-5.1 | REAL attempt | FAIL — ZAI billing empty |
| Workhorse B | deepseek/deepseek-v4-flash | REAL MODEL OUTPUT | OK — full plan |
| Skeptic | deepseek/deepseek-v4-flash | REAL MODEL OUTPUT | OK — full report |
| Research Scout | web_search + local docs/config | TOOL OUTPUT | OK |
| Chair | xai/grok-4.5 | chair synthesis | OK |

**Critical live evidence:** intended multi-provider chamber collapsed to DeepSeek-only workers + Grok chair. That is not a research footnote — it is the architecture problem.

Raw consultant files:
- `memory/chambers/chamber-10-structural-raw.md`
- `memory/chambers/chamber-10-workhorse-raw.md`
- `memory/chambers/chamber-10-skeptic-raw.md`
- Research: `memory/research-2026-07-31-subagent-architecture.md`

## Evidence (compressed)

### TOOL OUTPUT — live config
- subagents.model = zai/glm-5.1
- thinking = low; runTimeoutSeconds = 600; maxConcurrent = 3; delegationMode = suggest
- OpenClaw supports maxSpawnDepth 2, maxChildrenPerAgent, sessions_spawn + sessions_yield, isolated default

### TOOL OUTPUT — industry (secondary, untrusted)
- Dominant 2026 pattern: supervisor + workers + verifier
- Fan-out/fan-in for independent work; maker-checker with max iterations
- Start simple; add agents only when measurable

### REAL MODEL — Skeptic (DeepSeek)
- Cheap workers: drafts/extract/normalize/smoke — never wallet/send/sole-verify/full MEMORY
- Dual-lane bake-off before flip; criteria = cost per *verified* task + schema adherence
- maxConcurrent → 4 (not 8); parent verify is bottleneck
- Mandatory evidence/confidence spawn contract
- Boss mode = process (cheap gen → expensive adjudicate), not config religion

### REAL MODEL — Structural (DeepSeek substitute for Opus)
- North star: multi-provider role-segregated supervisor-worker-verifier; failover bottoms at DeepSeek degraded
- Depth 1 default; depth 2 only P2
- Pre-flight credit probe mandatory
- P0 = stabilize DeepSeek+Grok; P1 two-lane; P2 restore multi-provider + depth-2

### REAL MODEL — Workhorse (DeepSeek)
- Loop: decompose → lane probe → spawn ≤3 → yield → grade/claim-guard → merge → log → escalate once
- Files: swarm-boss.mjs, swarm-state.json, swarm-log, playbook skill
- Smoke: 3 parallel file writes + grade
- Config proposal: maxConcurrent 3 (keep); maxSpawnDepth 2 (proposal)
- Failover: probe, mark down 30m, never Grok-as-worker, never silent criteria drop

## Conflict Table
| Topic | Skeptic | Structural | Workhorse | Chair resolution |
|-------|---------|------------|-----------|------------------|
| Default worker model | Hold flip until 50+ bake-off | DeepSeek as degraded bottom of chain | DeepSeek default while others dry | **PROMOTE temporary operational default → DeepSeek** while ZAI/Anthropic dry; bake-off when ≥2 lanes paid. Config still pointing at dead GLM is worse than temporary flip. |
| maxConcurrent | 4 | 3 | 3 | **HOLD at 3** until 3-parallel smoke green; then try 4 |
| maxSpawnDepth | ≤2 hold beyond | depth 1 now; 2 in P2 | propose 2 | **HOLD depth 1** for P0; depth 2 only after smoke + Jason OK |
| Verifier model | Flagship/chair only for gates | DeepSeek + chair double-check; never sole on irreversible | claim-guard + verifier-pass scripts + chair | **PROMOTE** Gen→Verify scripts + chair final; cheap never sole gate on real action |
| Big swarm CLI | process over tooling | harness first | build swarm-boss.mjs in 48h | **PROMOTE thin playbook** first; HOLD heavy CLI until smoke proves need |
| Multi-provider | dual-lane when both live | invariant | scaffold failover | **PROMOTE** as hard requirement; live proof already |

## Synthesis (Chair)

### North-star (practical, not mythic)
```
Jason
  └─ Nova Chair (Grok 4.5) — decompose, spawn, adjudicate, external actions, MEMORY promotion
        ├─ Worker pool (cheap, parallel, isolated) — DeepSeek Flash primary while ZAI dry; GLM when restored
        ├─ Optional skeptic lane (second cheap or structural when paid)
        └─ Verifier path — claim-guard.mjs + verifier-pass-v1 + chair spot-check
```

**Boss mode definition (operational):**
1. Decompose into ≤N independent tasks with acceptance criteria  
2. Probe which model lanes are alive  
3. Fan-out via `sessions_spawn` (isolated, structured brief)  
4. `sessions_yield` (no poll loops)  
5. Mechanical grade + claim-guard  
6. Chair synthesizes; only chair promotes / acts externally  
7. Log lane health + cost  

God-tier is **not** more agents. It is: parallel cheap generation + hard verification + billing-aware routing + never fooling yourself.

### Role catalog (max 6 live roles)
| Role | Who | Model tier now | Never |
|------|-----|----------------|-------|
| Chair | Nova main | Grok 4.5 | replaced by cheap |
| Bulk worker | subagent | DeepSeek Flash (temp primary) | wallet/send/config/MEMORY dump |
| Structured worker | subagent | GLM-5.1 when billed | sole verify |
| Structural critic | subagent/chamber | Opus/Claude when billed else HOLD | silent chair replacement |
| Mechanical verifier | scripts | claim-guard / task-grade | LLM-only vibes |
| Final adjudicator | Chair | Grok | delegated to worker |

### Parallelism rules
- Fan-out only when tasks are independent  
- Dependent steps stay sequential on chair or single child  
- Cap fan-out at maxConcurrent (3 now)  
- One write-owner per file/resource  
- Any action-gating output → Gen→Verify before trust  

### P0 blockers (must fix before "boss mode live")
1. **Worker default points at dead ZAI** — every default subagent spawn fails billing  
2. **Anthropic dry** — no real Opus structural lane  
3. **No lane-health probe** — chair discovered failures only by spawning  
4. **No standard spawn brief** — quality variance  

### Phased plan

#### P0 — Tonight / this weekend (no mythology)
1. Jason: top up **ZAI** and/or approve **temp subagent default → deepseek/deepseek-v4-flash**  
2. Jason: decide Anthropic credits (optional for chambers, not required for boss mode)  
3. Nova (after approval): write `docs/harness/subagent-swarm-playbook-v0.md` + spawn brief template  
4. Smoke: 3 parallel DeepSeek workers writing disjoint smoke files; claim-guard on reports  
5. Lane-health note in `memory/swarm/swarm-state.json` (manual or tiny script)  
6. Keep maxConcurrent=3, maxSpawnDepth=1, brain=Grok  

Acceptance P0:
- 3/3 parallel spawns complete on working lane  
- Dead lane fails fast and is recorded, not infinite-retried  
- No worker touches wallet/secrets/config  
- Chair synthesis cites evidence paths  

#### P1 — After P0 green
- Raise maxConcurrent 3→4 (Jason approve)  
- Dual-lane bake-off GLM vs Flash when both paid (20–30 tasks, cost-per-verified)  
- Wire claim-guard + verifier-pass into every swarm merge habit  
- Optional depth-2 only for nested research orchestrator experiments  

#### P2 — Later
- Restore multi-provider chamber seats (Opus structural when paid)  
- Consider maxSpawnDepth=2 with maxChildren caps  
- swarm-boss.mjs only if manual playbook is too slow  
- Never DeepSeek as brain / sole verifier / memory host  

### Config proposals (Jason must approve — NOT applied)
| Key | Current | Proposed | Why |
|-----|---------|----------|-----|
| agents.defaults.subagents.model | zai/glm-5.1 | deepseek/deepseek-v4-flash **(temp)** OR keep GLM after top-up | Default lane is dead |
| agents.defaults.subagents.maxConcurrent | 3 | 3 (then 4 after smoke) | Parent verify bottleneck |
| agents.defaults.subagents.maxSpawnDepth | (default 1) | stay 1 | Avoid nested thrash until P1 |
| agents.defaults.subagents.delegationMode | suggest | suggest (or prefer later) | Process first |
| agents.defaults.model (brain) | xai/grok-4.5 | **no change** | Protected |

### Top failure modes (ranked by tonight's evidence)
1. Provider billing outage mid-architecture — mitigate: probe + multi-provider + degraded mode  
2. Config default to dead provider — mitigate: health file + refuse silent "subagents work" claims  
3. Cheap sole-verify — mitigate: scripts + chair gate  
4. Swarm thrash / duplicate work — mitigate: task IDs + disjoint partitions  
5. Context/cost blowup on chair — mitigate: short structured returns, not essay dumps  

### REJECT list
- God-tier mythology / unbounded swarm  
- DeepSeek (or any cheap) as default brain  
- Worker wallet / email send / config write authority  
- Full MEMORY/WORLD_STATE dumps to untrusted APIs  
- Fan-out without verification  
- Depth >2  
- OpenRouter ladder project as fix (parked 402 history)  
- Building huge multi-agent framework before 3-parallel smoke passes  

## Verification Status
- Verified: live config values; Anthropic/ZAI billing failures; DeepSeek spawn success×3; OpenClaw spawn/yield mechanics; harness scripts exist on disk (from prior alpha)  
- Unverified: true $/verified-task at our load; Flash vs GLM quality when both live; depth-2 value; whether swarm-boss.mjs is needed vs playbook  
- Rejected as proven: "multi-model chamber works out of the box tonight"; "default subagents healthy"

## Promotion Decision

### PROMOTE (working memory → implement next; sparse durable later)
1. **Boss architecture:** Chair(Grok) + parallel cheap workers + mechanical verifier + chair adjudicate  
2. **Billing-aware multi-provider failover as first-class requirement**  
3. **Standard spawn brief** with evidence/confidence schema  
4. **P0 smoke plan** (3 parallel, disjoint writes, claim-guard)  
5. **Temporary worker-lane reality:** DeepSeek is the only working cheap spawn lane tonight  

### HOLD
1. maxConcurrent → 4 until smoke green  
2. maxSpawnDepth → 2 until P1  
3. Permanent default flip Flash over GLM until bake-off **if** ZAI restored  
4. Heavy swarm-boss.mjs / skill factory until playbook proves friction  
5. Opus structural dependency for routine boss mode  

### REJECT
1. Unbounded multi-agent "god tier" without meters  
2. Cheap sole verification of irreversible actions  
3. Worker access to wallet/secrets/external send  
4. Changing default brain away from Grok  

## What Jason needs to decide (blocking)
1. **Top up ZAI** (restore GLM default lane) and/or **approve temp subagent default = DeepSeek Flash**  
2. Optional: Anthropic credits for real Opus chamber seats  
3. After P0 smoke: approve playbook file + optional concurrency 4  

## Uncertainty
- How soon credits return  
- Flash schema reliability at N=3–4 concurrent on our tasks  
- Whether chair context fills faster than worker savings  

## Later-proven-wrong tracker
- [ ] Temp DeepSeek default stays too long after ZAI restored  
- [ ] maxConcurrent 4 floods chair  
- [ ] Depth-1 insufficient for real nested research  

## Post-verdict update — 2026-08-01 00:08 PDT
- ZAI key rotated + small top-up by Jason.
- Smoke: zai/glm-5.1 subagent returned ZAI_SMOKE_OK — **PASS**.
- Blocking item #1 (dead ZAI default) cleared for spawn path. Temp DeepSeek default flip no longer required.
- Still open: Anthropic credits optional; P0 3-parallel smoke + playbook not yet run.
