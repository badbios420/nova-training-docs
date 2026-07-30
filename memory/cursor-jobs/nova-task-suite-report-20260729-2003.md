# Nova Task Suite Report

- **Generated:** 2026-07-30T03:03:25.908Z
- **Suite:** /home/mrbig3/.openclaw/workspace/memory/evals/nova-task-suite-v0.json (v0)
- **Workspace root:** /home/mrbig3/.openclaw/workspace
- **Rollup:** pass 10/10 (100%) · fail 0 · partial 0 · error 0

## By category

| Category | Pass | Fail | Partial | Error | Total | Pass rate |
|----------|------|------|---------|-------|-------|-----------|
| ops_status | 5 | 0 | 0 | 0 | 5 | 100% |
| memory_hygiene | 1 | 0 | 0 | 0 | 1 | 100% |
| claim_discipline | 1 | 0 | 0 | 0 | 1 | 100% |
| harness_config | 2 | 0 | 0 | 0 | 2 | 100% |
| continuity | 1 | 0 | 0 | 0 | 1 | 100% |

## Tasks

### T01 — Vista license closed · **PASS**

- Category: `ops_status` · score 100% (threshold 50%) · severity: high
- Notes: Pass if either WORLD_STATE or MEMORY strongly marks NOT REQUIRED / CLOSED / unincorporated; both weighted equally.
- Graders:
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in WORLD_STATE.md
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in MEMORY.md

### T02 — FBN clear · **PASS**

- Category: `ops_status` · score 100% (threshold 100%) · severity: high
- Notes: Must show published/clear/CLOSED — not still-need-to-publish.
- Graders:
  - `composite` w=1 → pass (score 1.00): composite(all): 2/2 — world_state_fire:P, file_not_contains:P

### T03 — Hilltop weekly cut path · **PASS**

- Category: `ops_status` · score 100% (threshold 100%) · severity: high
- Notes: 1434 Hilltop + $5k/week (or −$5k/week) until sells in WORLD_STATE.
- Graders:
  - `composite` w=1 → pass (score 1.00): composite(all): 2/2 — file_contains:P, regex_in_file:P

### T04 — eBay lag escalated · **PASS**

- Category: `ops_status` · score 100% (threshold 50%) · severity: critical
- Notes: Lagging/cash bridge + age or escalate language in WORLD_STATE or today daily.
- Graders:
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in WORLD_STATE.md
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in memory/{{today}}.md

### T05 — IDX live not parked · **PASS**

- Category: `ops_status` · score 100% (threshold 100%) · severity: medium
- Notes: WORLD_STATE must mark IDX LIVE / not parked.
- Graders:
  - `composite` w=1 → pass (score 1.00): composite(all): 2/2 — regex_in_file:P, regex_in_file:P

### T06 — Procedure 14 dream filter exists · **PASS**

- Category: `memory_hygiene` · score 100% (threshold 100%) · severity: high
- Notes: procedural-memory-v1.md must contain Procedure 14 and dream/ops-first language.
- Graders:
  - `procedure_rule` w=1 → pass (score 1.00): procedure pattern ok in memory/procedural-memory-v1.md
  - `procedure_rule` w=1 → pass (score 1.00): procedure needles ok (all) in memory/procedural-memory-v1.md

### T07 — Banned success words documented · **PASS**

- Category: `claim_discipline` · score 100% (threshold 50%) · severity: high
- Notes: procedural-memory or claim-ledger must list banned words including done, fixed, verified.
- Graders:
  - `procedure_rule` w=1 → pass (score 1.00): procedure pattern ok in memory/procedural-memory-v1.md
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in memory/claim-ledger.md

### T08 — Retrieval eval tooling exists · **PASS**

- Category: `harness_config` · score 100% (threshold 100%) · severity: medium
- Notes: scripts/retrieval-eval.mjs AND memory/retrieval-eval-set-v1.md must exist.
- Graders:
  - `file_exists` w=1 → pass (score 1.00): exists: scripts/retrieval-eval.mjs
  - `file_exists` w=1 → pass (score 1.00): exists: memory/retrieval-eval-set-v1.md

### T09 — MEMORY inject slim · **PASS**

- Category: `harness_config` · score 100% (threshold 100%) · severity: medium
- Notes: MEMORY.md < 20000 bytes AND contains inject-slim or archive pointer.
- Graders:
  - `file_max_bytes` w=1 → pass (score 1.00): MEMORY.md: 7009B ≤ 20000B
  - `regex_in_file` w=1 → pass (score 1.00): regex matched in MEMORY.md

### T10 — Alpha scout + C1 queue present · **PASS**

- Category: `continuity` · score 100% (threshold 100%) · severity: medium
- Notes: Both research scout and alpha-queue files must exist.
- Graders:
  - `file_exists` w=1 → pass (score 1.00): exists: memory/research-2026-07-29-top-agent-alpha-scout.md
  - `file_exists` w=1 → pass (score 1.00): exists: memory/cursor-jobs/alpha-queue-2026-07-29.md

## Philosophy

Outcome > vibes. Failures that match live drift are honest signal, not grader bugs.
