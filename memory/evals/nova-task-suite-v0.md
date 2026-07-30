# Nova Task Suite v0

**Version:** v0  
**Updated:** 2026-07-29  
**Machine suite:** [`nova-task-suite-v0.json`](./nova-task-suite-v0.json)  
**Grader:** `node scripts/nova-task-grade.mjs`

## Purpose

First **Jason-real outcome eval suite** for Nova. Grades whether the **agent harness + filesystem world model** can answer/check real ops and harness facts by reading live files (`WORLD_STATE.md`, `MEMORY.md`, procedures, dailies) and applying mechanical rules.

This is **not** a retrieval/search benchmark. Pattern follows Anthropic-style agent evals: **task → (optional transcript later) → outcome graders** on final state / extracted answers. v0 grades the **workspace ground truth** offline (no LLM required for grading).

## How it differs from retrieval-eval-set-v1

| | retrieval-eval-set-v1 | nova-task-suite-v0 |
|--|----------------------|--------------------|
| Question | Does `memory_search` rank the right path? | Does the **filesystem world model** hold the right ops/harness fact? |
| Runner | `scripts/retrieval-eval.mjs` (live openclaw search) | `scripts/nova-task-grade.mjs` (offline file graders) |
| Gold | Accept paths for hit@1/hit@3 | Outcome criteria (regex, contains, exists, size, composite) |
| Failure mode | Index / dreaming pollution / ranking | Stale WORLD_STATE, missing procedure, inject bloat, missing continuity artifacts |

Both meters matter. Retrieval = can we *find* it. Task suite = is the *truth* present and checkable.

## Grading philosophy

- **Outcome > vibes.** Pass/fail from file state, not prose quality.
- **Multi-grader** per task; weighted scores; `passThreshold` may allow partial credit (e.g. either-of-two sources).
- Statuses: `pass` | `partial` (score > 0 but below threshold) | `fail` | `error`.
- Live drift that breaks gold is an **honest fail** — that is the point of the meter.
- Graders run fully offline; no network, no LLM in v0.

### Grader types

`file_contains` · `file_not_contains` · `regex_in_file` · `json_path` · `world_state_fire` · `procedure_rule` · `composite` · `file_exists` · `file_max_bytes`

Path token: `{{today}}` → local `YYYY-MM-DD` (for daily notes).

## Task table (T01–T10)

| ID | Name | Category | Severity | Grader type(s) | Gold / outcome criteria |
|----|------|----------|----------|----------------|-------------------------|
| T01 | Vista license closed | `ops_status` | high | `regex_in_file` ×2 (threshold 0.5) | WORLD_STATE and/or MEMORY: Vista license NOT REQUIRED / CLOSED / unincorporated |
| T02 | FBN clear | `ops_status` | high | `composite`(`world_state_fire` + `file_not_contains`) | FBN published/clear/CLOSED in WORLD_STATE; not “still need to publish” |
| T03 | Hilltop weekly cut path | `ops_status` | high | `composite`(`file_contains` + `regex_in_file`) | `1434 Hilltop` + `$5k/week` or `−$5k/week` until sells in WORLD_STATE |
| T04 | eBay lag escalated | `ops_status` | critical | `regex_in_file` ×2 (threshold 0.5) | eBay lagging/cash bridge + age/escalate in WORLD_STATE or today daily |
| T05 | IDX live not parked | `ops_status` | medium | `composite` | IDX marked LIVE; “not parked” in WORLD_STATE |
| T06 | Procedure 14 dream filter exists | `memory_hygiene` | high | `procedure_rule` ×2 | procedural-memory-v1.md has Procedure 14 + dream/ops-first language |
| T07 | Banned success words documented | `claim_discipline` | high | `procedure_rule` + `regex_in_file` (threshold 0.5) | Banned list including done/fixed/verified in procedural or claim-ledger |
| T08 | Retrieval eval tooling exists | `harness_config` | medium | `file_exists` ×2 | `scripts/retrieval-eval.mjs` AND `memory/retrieval-eval-set-v1.md` exist |
| T09 | MEMORY inject slim | `harness_config` | medium | `file_max_bytes` + `regex_in_file` | MEMORY.md ≤ 20000 bytes AND inject-slim / archive pointer |
| T10 | Alpha scout + C1 queue present | `continuity` | medium | `file_exists` ×2 | alpha scout research + `alpha-queue-2026-07-29.md` both exist |

### Prompts (agent-facing)

**T01:** Is a City of Vista business license required for the Millegar/home address? What is the current status?

**T02:** What is the Big House FBN / newspaper publish status? Is Jason still blocked on publishing?

**T03:** What is the current price path for 1434 Hilltop until it sells?

**T04:** Is the eBay cash-bridge listing work on track? Any age/lag escalation?

**T05:** Is the Big House IDX live on the site, or still parked website work?

**T06:** Does procedural memory document Procedure 14 (ops-first + dream noise filter)?

**T07:** Where are banned success words (done/fixed/verified) documented for claim discipline?

**T08:** Does the workspace ship retrieval-eval tooling and an eval set?

**T09:** Is MEMORY.md within inject budget and pointing at the pre-trim archive?

**T10:** Are the 2026-07-29 alpha scout research note and Cursor alpha queue present?

## Categories

Exact strings only:

- `ops_status`
- `memory_hygiene`
- `claim_discipline`
- `harness_config`
- `continuity`

## Run instructions

```bash
# Unit tests (fixtures / tmp — no network)
node scripts/test-nova-task-grade.mjs

# Help
node scripts/nova-task-grade.mjs --help

# Full live suite (writes report under memory/cursor-jobs/)
node scripts/nova-task-grade.mjs

# Machine summary
node scripts/nova-task-grade.mjs --json

# Single task / smoke
node scripts/nova-task-grade.mjs --id T01
node scripts/nova-task-grade.mjs --limit 3

# Fixture root override
node scripts/nova-task-grade.mjs --fixture-root memory/evals/fixtures/v0-smoke --suite PATH
```

**Exit codes:** `0` all passed · `1` any fail/partial/error · `2` usage/infra.

**Reports:** `memory/cursor-jobs/nova-task-suite-report-YYYYMMDD-HHMM.md`

## Changelog

### v0 — 2026-07-29 (C1)

- Initial 10-task Jason-real outcome suite (T01–T10).
- Offline graders + CLI + unit tests + optional smoke fixtures.
- Scorecard hook: harness outcome meter #new.
- C2 claim-guard tooling available for `claim_discipline` hygiene (`node scripts/claim-guard.mjs`).
