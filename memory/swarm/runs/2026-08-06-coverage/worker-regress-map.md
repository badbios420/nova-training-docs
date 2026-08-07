# Worker C — Harness Regress Map (2026-08-06)

**status:** complete
**mode:** read-only (no files modified; hard_bans honored)
**date:** 2026-08-06 19:15 PDT
**scope:** map existing tests → tonight's gains; dry-run/run core suites; recommend regress pack; rank missing tests.

## Evidence

- Enumerated `scripts/test-*.mjs` → **12 suites** exist (listed in pack below).
- Ran `node scripts/test-claim-guard.mjs` → **exit 0, 21 passed, 0 failed**.
- Ran `node scripts/test-session-startup.mjs` → **exit 0, 17 passed, 0 failed**.
- Read `scripts/test-cursor-worker.sh` (structural + live smoke), `scripts/cursor-worker.sh` (auth helper lines 45–79).
- Read `scripts/lib/claim-guard-lib.mjs` (EVIDENCE_PLACEHOLDER_WORDS = 13 words + empty-bracket/dash rules, `isPlaceholderEvidenceBody`).
- Read `scripts/lib/session-startup-lib.mjs` (`maybeLogIdentityCheck` At-refresh, `STARTUP_RETRIEVAL_DEGRADED` marker + daily note append).
- grep: zero test/script references to priority-dashboard, Proc3 supersede, or MEMORY model/C-stage claims.
- `memory/swarm/packs/` contains only `error-doctor-v0.json`, `git-lockin-inventory-v0.json` — **`regress-v0.json` referenced by docs/harness/swarm-protocol-v0.md:208 does not exist**.
- `memory/priority-dashboard.md` exists, frozen 6/23; supersede → WORLD_STATE/archive **pending** (mem-health run finding #1, MED, Jason gate).
- MEMORY.md:95 "subagents still glm-5.1 until bake-off" supersede **pending** (mem-health finding #2, MED).
- git: no commits tonight; working tree dirty (MEMORY.md, identity-substrate.md, claim-ledger.md, docs/harness/swarm-protocol-v0.md, etc.).

## Protected now (test → gain)

| Gain | Test suite | Coverage |
|---|---|---|
| claim-guard placeholders (Batch A) | `node scripts/test-claim-guard.mjs` (21 tests, PASS) | `EVIDENCE: [] placeholder does not clear done`, `EVIDENCE: - placeholder`, `EVIDENCE: N/A / none`, `EVIDENCE: tbd/todo/pending/placeholder/later`, empty `EVIDENCE:` alone, whitespace-only `EVIDENCE:` — all assert placeholder bodies do NOT clear banned words |
| cursor-worker auth isAuthenticated | `bash scripts/test-cursor-worker.sh` | Structural: `isAuthenticated` JSON check present; `cursor_agent_authenticated` helper exists; explicit rejection of `not logged in` in text fallback; **no** naive `grep -qi 'logged in'` gate. Live smoke: pins `cursor-grok-4.5-high`, verifies `model=` in log + marker reply (exit 2 w/o auth) |
| session-startup identity At | `node scripts/test-session-startup.mjs` (17 tests, PASS) | `maybeLogIdentityCheck append updates lastIdentityCheckAt` (asserts At === nowIso), `file_already_has_today_entry refreshes At` (At must refresh, date synced) |
| session-startup RETRIEVAL_DEGRADED | same suite | `memory-search unavailable fallback` (retrievalDegraded === true, `STARTUP_RETRIEVAL_DEGRADED` marker, daily note appended), `buildInternalContext degraded marker is first line`, `happy path retrieval not degraded` |

## Unprotected tonight gains

1. **priority-dashboard / Proc3 supersede** — no script, no test. `memory/priority-dashboard.md` frozen 6/23 still opens Vista/Sam/IDX/insurance/SOI/CV as live tasks; supersede banner pending Jason gate. Failure class `superseded_files_retaining_live_task_tables` = **zero automated coverage**.
2. **MEMORY model/C-stage** — no test asserts MEMORY.md/daily model claims match live arch or carry stage/supersede markers. MEMORY.md:95 glm-5.1 claim pending. Failure classes `present_tense_model_claims_vs_live_arch` and `historical_model_statements_rewritten_as_current` = **zero automated coverage**.
3. **canonical path existence / dead paths** — doc-audit worker-dead-paths findings; no automated audit test (`existsSync` hits in tests are fixture-scoped only).
4. **regress pack artifact** — `regress-v0.json` referenced by swarm protocol but missing; nothing materializes the post-Cursor regress command list.

## Recommended minimal regress pack (post-Cursor nights)

Core trio (tonight's gains — always):
```bash
cd /home/mrbig3/.openclaw/workspace
node scripts/test-claim-guard.mjs        # claim-guard placeholders
node scripts/test-session-startup.mjs    # identity At + RETRIEVAL_DEGRADED
bash scripts/test-cursor-worker.sh       # auth structural (live smoke needs agent auth; exit 2 otherwise)
```

Full sweep (pack 2, all offline suites):
```bash
node scripts/test-memory-health.mjs          # mem-health base
node scripts/test-error-doctor.mjs           # error-doctor precision
node scripts/test-retrieval-eval.mjs         # retrieval eval set
node scripts/test-protected-settings-guard.mjs
node scripts/test-git-lockin-inventory.mjs
node scripts/test-swv-dry-harness.mjs
node scripts/test-trajectory-closeout.mjs
node scripts/test-active-memory-smoke.mjs
node scripts/test-memory-before-speech.mjs
node scripts/test-nova-task-grade.mjs
```
(Recommend materializing this as `memory/swarm/packs/regress-v0.json` — currently missing.)

## Top 5 missing tests ranked by blast radius

1. **MEMORY.md/durable-doc model-claim freshness audit** — present-tense claims vs live arch, stage markers required. Loaded every main session; wrong claims propagate indefinitely. Tonight's core failure class.
2. **Superseded-file live-task-table scan** (priority-dashboard pattern) — stale task tables misroute ops retrieval (Procedure 14 ops-first); MED flagged, Jason-gated.
3. **Canonical path existence / dead-path audit** — stale doc paths mislead future sessions/workers; doc-audit findings currently unguarded.
4. **Cursor-worker auth structural-only mode** — test-cursor-worker.sh live section exits 2 without auth; a `--structure-only` flag would make tonight's auth gain verifiable in CI regardless of auth state.
5. **RETRIEVAL_DEGRADED daily-note idempotency + state file sync** — no test for dup-marker branch or `session-startup-state.json` (modified tonight) `lastRunAt` write-back.

## Findings

- Tonight's three implemented gains (claim-guard placeholders, cursor auth, startup identity/RETRIEVAL_DEGRADED) are all regression-protected and green (21+17 pass, cursor structural checks in place).
- Both planned-but-pending gains (priority-dashboard supersede, MEMORY model-claim supersede) are exactly the scope's failure classes with **no coverage** — the regress gap is on the pending side, not the implemented side.
- `regress-v0.json` pack artifact is missing despite being referenced by swarm protocol.

## Confidence

- Protected/unprotected mapping: **high** (ran 2 suites to exit, read all relevant sources).
- Blast-radius ordering: **medium** (subjective ranking; no cross-run frequency data).

## Scope touched

- `memory/swarm/runs/2026-08-06-coverage/worker-regress-map.md` (this packet, written).
- No source, config, or memory files modified.
