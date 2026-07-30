# C1 — Nova Task Suite v0 (2026-07-29)

**Status:** PASS  
**Worker:** Cursor (Nova task)  
**Scope:** C1 only — no C2–C9, no openclaw.json / wallets / HEARTBEAT governance

## What shipped

| Deliverable | Path |
|-------------|------|
| Suite spec | `memory/evals/nova-task-suite-v0.md` |
| Machine tasks (T01–T10) | `memory/evals/nova-task-suite-v0.json` |
| Grader library | `scripts/lib/nova-task-grade-lib.mjs` |
| CLI | `scripts/nova-task-grade.mjs` |
| Unit tests | `scripts/test-nova-task-grade.mjs` |
| Smoke fixtures | `memory/evals/fixtures/v0-smoke/` |
| Scorecard hook | `memory/harness-scorecard.md` → `### 2026-07-29 — Nova Task Suite v0 (C1)` |
| Live report sample | `memory/cursor-jobs/nova-task-suite-report-20260729-2003.md` |

## How to run

```bash
node scripts/test-nova-task-grade.mjs
node scripts/nova-task-grade.mjs --help
node scripts/nova-task-grade.mjs --json
node scripts/nova-task-grade.mjs
```

Exit: `0` all pass · `1` fail/partial · `2` usage/infra.

## Verification outputs (pasted)

### `node scripts/test-nova-task-grade.mjs`

```
nova-task-grade unit tests

  PASS  file_contains pass
  PASS  file_contains fail
  PASS  regex_in_file pass
  PASS  regex_in_file fail
  PASS  composite all requires every child
  PASS  composite any passes on one child
  PASS  json_path equals
  PASS  file_exists + file_max_bytes
  PASS  gradeTask threshold partial vs pass
  PASS  rollup math
  PASS  loadSuite live json + formatReport smoke

11 passed, 0 failed
```

Exit: **0**

### `node scripts/nova-task-grade.mjs --help`

```
Usage: node scripts/nova-task-grade.mjs [options]

Grade Nova Task Suite v0 outcomes against the live workspace filesystem
(or an optional fixture root). No LLM / network required.

Options:
  --help              Show this help
  --suite PATH        Suite JSON (default: memory/evals/nova-task-suite-v0.json)
  --id T0X            Run a single task by ID (e.g. T01)
  --limit N           Only first N tasks (after id filter)
  --json              Print machine-readable summary to stdout
  --fixture-root PATH Override workspace root for file reads (tests/fixtures)
  --report            Write markdown report (default: on)
  --no-report         Skip writing markdown report

Exit codes:
  0  all run tasks passed
  1  any fail / partial below threshold / error
  2  usage or infra error

Reports: memory/cursor-jobs/nova-task-suite-report-YYYYMMDD-HHMM.md
```

### `node scripts/nova-task-grade.mjs --json` (summary rollup)

```
passed: 10, failed: 0, partial: 0, errored: 0, total: 10, passRate: 1
byCategory: ops_status 5/5 · memory_hygiene 1/1 · claim_discipline 1/1 · harness_config 2/2 · continuity 1/1
```

Exit: **0**

### `node scripts/nova-task-grade.mjs` (full live)

```
Nova Task Suite v0: 10/10 passed (100%) · fail 0 · partial 0 · error 0
  T01 [ops_status] PASS — Vista license closed
  T02 [ops_status] PASS — FBN clear
  T03 [ops_status] PASS — Hilltop weekly cut path
  T04 [ops_status] PASS — eBay lag escalated
  T05 [ops_status] PASS — IDX live not parked
  T06 [memory_hygiene] PASS — Procedure 14 dream filter exists
  T07 [claim_discipline] PASS — Banned success words documented
  T08 [harness_config] PASS — Retrieval eval tooling exists
  T09 [harness_config] PASS — MEMORY inject slim
  T10 [continuity] PASS — Alpha scout + C1 queue present
```

Exit: **0** · Report: `memory/cursor-jobs/nova-task-suite-report-20260729-2003.md`

### `wc -c MEMORY.md` / `ls`

```
7009 MEMORY.md

memory/evals/:
  fixtures/
  nova-task-suite-v0.json
  nova-task-suite-v0.md

scripts/nova-task-grade.mjs
scripts/lib/nova-task-grade-lib.mjs
```

## Live smoke results

**10/10 (100%)** on live workspace as of 2026-07-29 ~20:03 PDT. Gold derived from current WORLD_STATE / MEMORY / procedural / claim-ledger / continuity files — no invented RE facts.

## Limitations

- v0 grades **file outcomes**, not agent transcripts (transcript grading = later wave).
- `{{today}}` is local calendar date; timezone edge around midnight can miss yesterday’s daily if no today file.
- Regex gold can false-fail on wording drift even when human ops status is “same” — intentional sensitivity.
- `file_exists` / size graders are harness-shape checks, not semantic truth.
- Smoke fixtures under `memory/evals/fixtures/v0-smoke/` are minimal; live mode defaults to real workspace root.
- Extra grader types beyond the core set: `file_exists`, `file_max_bytes` (needed for T08–T10).

## Nova verify checklist

- [ ] `node scripts/test-nova-task-grade.mjs` → exit 0
- [ ] `node scripts/nova-task-grade.mjs` → ≥8/10 or honest explained fails
- [ ] Spec + JSON + lib + CLI + job report + scorecard section all present
- [ ] No touches to `openclaw.json`, wallets, secrets, HEARTBEAT governance
- [ ] Confirm T01–T10 IDs stable for future delta runs

## Residual risks

- Ops file edits that soften closed/lag language will drop pass rate — desired.
- Dual report write in same minute overwrites same `HHMM` report path (idempotent stamp collision).
