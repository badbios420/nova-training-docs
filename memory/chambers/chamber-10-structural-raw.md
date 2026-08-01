# Chamber #10 — Structural Architecture (Nova Consultant Output)

## 1. North-Star Architecture
**Multi-provider, role-segregated supervisor-worker-verifier**, where provider redundancy is a *deployment invariant*, not an optimization. One orchestrator (Grok chair) decomposes tasks; analysis/generation fans out across providers; a verifier pass gates every promotion. Every role carries a documented failover chain, and every chain bottoms out in DeepSeek flash (degraded mode) so a billing outage *degrades, never halts*.

Hard rules: (a) no lane dispatches without a live-credit pre-flight; (b) no trusted role silently fails over to an untrusted model; (c) fan-in only at verifier/chair.

## 2. Role Catalog (model tiers + failover)
- **Chair / Supervisor** — Grok 4.5 → DeepSeek flash (degraded). Decomposition, adjudication, final gates.
- **Structural Architect** — Opus → GLM-5.1 → DeepSeek flash. Analysis-only; quality matters, trust doesn't.
- **Workhorse** — GLM-5.1 → DeepSeek flash → Grok. Bulk generation.
- **Skeptic** — DeepSeek flash (no failover; halt if dry). Red-team, contradiction hunting.
- **Verifier** — DeepSeek flash + chair double-check. Sole-verify forbidden on irreversible actions.
- **Claim-Guard / Linter** — DeepSeek flash (deterministic passes where possible).
- **Trajectory / Recorder** — DeepSeek flash or no-LLM. Append-only logs, timestamps, failure markers.
- **Retrieval Eval** — DeepSeek flash. Scores RAG/wiki recall.

## 3. Parallelism Rules
- Independent lanes run in parallel up to `maxConcurrent=3`; dependent steps serialize.
- Any critical task fans out ≥2 lanes; fan-in happens **only** at the verifier.
- Billing-aware dispatch: probe credits per provider before each batch; skip lanes whose provider is dry.
- Stagger spawns, back off on 429/Retry-After — no tight retry loops.
- No two subagents write the same resource concurrently; a write conflict is a design bug, not an incident.

## 4. Nesting Depth Recommendation
**Depth 1 default; depth 2 only in P2** for isolated, self-contained subproblems (e.g., a bounded research spike) with explicit justification in the task. Depth 2 is a hard ceiling — children never spawn grandchildren. Rationale: with GLM/Anthropic billing down, most depth-2 work would land on DeepSeek, multiplying unverified output; depth 1 keeps fan-in cheap and blame unambiguous.

## 5. Safety Fences
- **Trust zone:** DeepSeek worker verifies claims and red-teams, but never holds wallet/secrets/full memory, and never sole-verifies irreversible external actions.
- Every propagating claim must pass claim-guard + verifier-pass.
- Pre-flight billing/credit check before any multi-lane dispatch.
- External writes gated by Grok chair or Jason; no subagent auto-posts.
- Watchdog + kill switch: timeout 600, orphan sweep, one command kills all lanes; trajectory log enables post-mortem.

## 6. Phased Rollout + Acceptance Tests
- **P0 — Single-lane stabilization (now):** DeepSeek workhorse + Grok chair; verifier-pass mandatory. *Accept:* 10 tasks, 0 silent failures; verifier catches ≥1 injected error; kill switch works.
- **P1 — Two lanes:** workhorse + skeptic in parallel. *Accept:* fault-injection test — kill a provider mid-run, task completes via failover in degraded mode; chair adjudication resolves fan-in conflicts 5/5.
- **P2 — Full 3-lane + depth-2:** restore Opus structural + GLM workhorse billing; enable depth-2 for isolated spikes. *Accept:* real task with all lanes live; no provider holds >50% of critical-path dependencies.

## 7. Top 5 Failure Modes + Mitigations
1. **Provider billing outage mid-run** (live: Anthropic, ZAI) → pre-flight credit probe + failover chain + degraded-mode contract: task completes with fewer lanes or halts cleanly — never corrupts.
2. **Silent trust downgrade** (failover seats untrusted model in trusted role) → role-tier pinning: failover may reduce *quality*, never *trust*.
3. **Orphaned/hung subagents** → timeout 600 + watchdog + kill switch; trajectory post-mortem.
4. **Fan-in divergence** (contradictory verifier inputs) → chair adjudication with stated tie-break rule; majority only with 3+ lanes.
5. **Config drift / concurrency overrun** (maxConcurrent, delegation flags) → pre-dispatch quota guard; harness diffs cfg per run.

## 8. REJECT List
Depth >2 · subagent writes to wallet/secrets/openclaw.json · cron auto-spawn without credit pre-flight · parallel writes to same doc · DeepSeek sole-verification of irreversible actions · silent trust downgrade · auto-scaling beyond billing-checked quota · any single-provider assumption.

## 9. PROMOTE / HOLD / REJECT
- **PROMOTE:** claim-guard + verifier-pass harness; multi-provider redundancy as invariant; degraded-mode contract; trust-zone pinning.
- **HOLD:** depth-2, full 3-lane chamber, Opus structural role — until second-provider billing is restored and P1 acceptance passes.
- **REJECT:** single-provider architectures, untrusted-model verification, unbounded fan-out.

## Uncertainty Notes
- Credit refill timing unknown → P1/P2 dates depend on Jason's wallet action.
- GLM-5.1/Opus key validity at refill unverified; DeepSeek-as-Opus substitute quality unmeasured.
- Grok chair is a single point of failure; chair fallback designed but untested.
- Per-lane cost/quality tradeoffs lack measured data — revisit after P1.