# Chamber #10 — Implementation Workhorse: Boss/Orchestrator Plan

## 1. Orchestration loop (per swarm run)
1. **Decompose** goal → ≤3 spawnable tasks (one per worker lane), each with verifiable acceptance criteria.
2. **Lane probe** — before spawning, check `x_search`/`web_search`-free health: try a 3-second `sessions_spawn` ping on each candidate model; record working lanes to `swarm-state.json`.
3. **Spawn** all tasks in one block (parallel, ≤3 concurrent), each with full brief (schema §2), `thinking=low`, `runTimeoutSeconds=600`.
4. **Yield** — `sessions_yield`, no busy-polling.
5. **Grade** — on return, run `nova-task-grade.mjs --id <TASK>` per task (offline suite) + `claim-guard.mjs --globs` on each worker's report (evidence gate).
6. **Merge/closeout** — `trajectory-closeout.mjs` per worker; synthesize into one final report.
7. **Log & bank** — append to `swarm-log-YYYY-MM-DD.md`, update `swarm-state.json` (lane health, costs, failures).
8. **Escalate** — any task failing grade → re-spawn once on failover lane (§10); second failure → HOLD, report to Jason.

## 2. Spawn brief schema
```
id, parentGoal, task (one sentence), deliverables (paths), acceptance (checkable list),
gradeSuite (suite+task id), runTimeoutSeconds, thinking, model, allowedTools[],
denyTools[] (wallet/secrets), evidenceRequired (file paths), outputContract (report file)
```

## 3. Files/artifacts to add
- `scripts/swarm-boss.mjs` — orchestrator CLI (spawn/yield/grade/merge)
- `scripts/lib/swarm-lib.mjs` — brief builder + lane-health state
- `scripts/test-swarm-boss.mjs` — smoke tests (§4)
- `memory/swarm/swarm-state.json` — lane health, last-credit-failure, cost tally
- `memory/swarm/swarm-log-YYYY-MM-DD.md` — per-run log (§7)
- `skills/swarm-playbook/SKILL.md` — this playbook, executable by Nova

## 4. Smoke test (3 parallel)
- Task A: write `memory/swarm/smoke-a.md`; Task B: write `smoke-b.md`; Task C: write `smoke-c.md` (no external calls, no tools beyond `write`).
- **PASS:** all 3 return within 600s; 3 files exist with correct content; all pass a `nova-task-grade` suite; no wallet/secrets touched.
- **FAIL:** any timeout, missing file, grade failure, or cross-contamination (A writing B's file). Re-run once; persistent failure → HOLD.

## 5. Config proposals (exact)
- `maxConcurrent: 3` — matches live intended default; 3 parallel DeepSeek lanes fit cash budget and one Grade/merge pass.
- `maxSpawnDepth: 2` — boss (1) → worker (2) only. No worker-spawns-workers: depth 3+ multiplies cost and defeats the cheap-fence.
- Keep `maxChildrenPerAgent` at default; boss caps fan-out at 3 by construction.

## 6. Claim-guard + verifier integration
- **Inbound:** every worker brief embeds claim-guard rules; worker must self-scan its report pre-submit (`--soft`).
- **Outbound:** boss runs `claim-guard.mjs --globs --strict` + `verifier-pass-v1` on all worker reports before merge. Any violation → task sent back once with the flagged line, else HOLD. Grade suite runs before merge; claim-guard after — evidence-first ordering.

## 7. Minimal logging (per run)
```
[swarm] id=SW-20260731-01 goal="..." lanes={glm:down,deepseek:ok} spawned=3 returned=3 passed=3 claimGuard=pass cost_est="~$0.60" duration=411s
```
Plus per-worker one-liner: `id, model, status(pass/fail/timeout), grade, claimGuard`. Append to `swarm-log-YYYY-MM-DD.md`; update `swarm-state.json`.

## 8. 48-hour sequence
- **H0–6:** swarm-lib + boss skeleton + smoke test (§4) on DeepSeek only.
- **H6–12:** brief schema → `swarm-boss.mjs` full loop; single-task end-to-end run.
- **H12–24:** 3-parallel real run (file-analysis tasks, no external writes); grade+claim-guard wiring; logging.
- **H24–36:** lane-failover logic (§10) + `swarm-state.json`; GLM lane re-test if credits return.
- **H36–48:** acceptance suite (§9); write `swarm-playbook/SKILL.md`; show Jason config diff for approval (maxConcurrent/maxSpawnDepth only).

## 9. Acceptance tests (boss mode)
1. 3/3 parallel spawns complete <600s with valid outputs.
2. One injected failing task (bad evidence) → correctly flagged, not merged.
3. One lane marked down (simulate) → tasks route to working lanes automatically.
4. Zero wallet/secret tool invocations across all workers (grep logs).
5. `claim-guard`/grade exit codes wired; merge blocked on any violation.
6. Config unchanged without Jason approval; `swarm-state.json` reflects each run.

## 10. Provider failover rules
- **Probe-before-spawn** (3s ping) every run; cache lane health in `swarm-state.json` for 15 min.
- **Credit-down detection:** spawn error / billing 429 → mark lane `down`, set `nextProbe=+30min`.
- **Routing order:** working-cost-order: DeepSeek flash (default) → GLM-5.1 (if up) → Opus (last resort, boss asks Jason first — cost).
- **All lanes down:** HOLD, no fallback to Grok-brain as worker (keeps brain fence); report to Jason.
- Never retry a lane marked down within its `nextProbe` window; never silently downgrade acceptance criteria on failover.

## 11. PROMOTE / HOLD / REJECT
- **PROMOTE:** smoke test + 3-parallel real run passing; failover proven; logging minimal; config diff = 2 keys.
- **HOLD:** GLM/Opus still credit-down → ship DeepSeek-only boss with failover scaffolding; defer multi-provider validation.
- **REJECT:** any depth>2, Grok-as-worker, or per-spawn Jason approval (kills the point — approval is on config + merge, not spawns).