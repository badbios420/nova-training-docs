# CHI Worker Packet — MISSING-TEST (2026-08-06)

- **class:** missing-test
- **mode:** read-only (no edits made)
- **worker model:** deepseek/deepseek-v4-flash
- **method:** enumerated scripts/ + scripts/lib/ vs test files; inspected untested scripts and thin tests directly

---

## Coverage matrix (verified by inspection)

| Script | Test | Status |
|---|---|---|
| claim-guard.mjs | test-claim-guard.mjs (18 tests) | covered |
| session-startup.mjs | test-session-startup.mjs (17 tests) | covered |
| memory-health-probe.mjs | test-memory-health.mjs (21 tests, **lib-level only**) | thin — CLI parseArgs/exit codes untested, parseArgs not exported |
| memory-embed-warmup.mjs | — | **MISSING** |
| cursor-worker.sh | test-cursor-worker.sh (**raw branch only** + live auth smoke) | **thin** |
| error-doctor.mjs | test-error-doctor.mjs | covered |
| git-lockin-inventory.mjs | test-git-lockin-inventory.mjs | covered |
| protected-settings-guard.mjs | test-protected-settings-guard.mjs | covered |
| trajectory-closeout.mjs | test-trajectory-closeout.mjs | covered |
| swv-dry-harness.mjs | test-swv-dry-harness.mjs (15 tests) | covered |
| nova-task-grade.mjs / retrieval-eval.mjs / memory-before-speech-meter.mjs / active-memory-smoke.mjs | test files present | covered |
| gmail-unsub-batch.mjs (214L) | — | **MISSING** |
| gmail-unsub-batch2.mjs (199L) | — | **MISSING** |
| shared-browser-p0-check.sh, start-shared-chrome-windows.sh, cdp-bridge.ps1, Start-OpenClaw-Shared-Chrome.bat | — | missing (rejected, see below) |
| desktop-inventory.py, dreaming-audit.py, organize-onedrive-desktop.py, parse-gmail-scan.py | — | missing (out of priority scope) |

---

## Gap 1 — gmail-unsub-batch.mjs + gmail-unsub-batch2.mjs (no tests)

- **Target:** `scripts/gmail-unsub-batch.mjs`, `scripts/gmail-unsub-batch2.mjs`
- **Why blast radius high:** These are the only scripts that take **real external actions** — they drive `openclaw browser --browser-profile remote` (spawnSync) to click actual Gmail Unsubscribe buttons and append to `memory/cursor-jobs/gmail-unsub-batch1-2026-07-28.md`. A regression in queue parsing, resume/dedupe, or PATH construction = unsubscribing the wrong sender, re-spamming already-processed senders, or silently failing while logging success. The pair is already drifting (evidence below), which is exactly what duplicate unrefactored automation does.
- **Drift evidence:** batch1 PATH includes `~/.local/bin`, batch2 does not; batch1 queue entry `phildong` → `from:shared1.ccsend.com phildong`, batch2 → `from:phildongagency.com`; queue formats differ (array-of-objects vs array-of-pairs). No shared logic — fixes apply to one copy only.
- **Proposed test file:** `scripts/test-gmail-unsub.mjs` after extracting pure helpers into `scripts/lib/gmail-unsub-lib.mjs` (queue parse, resume detection from log file, PATH_ENV build, run/sh timeout-vs-error mapping). 2–4 cases:
  1. Queue parse preserves id→query→label for both batch1 (object) and batch2 (pair) formats.
  2. Resume detection skips ids already present in `memory/cursor-jobs/gmail-unsub-batch1-*.md` (no re-run).
  3. PATH_ENV prepends nvm/.local/.npm-global and dedupes existing PATH.
  4. `run()`/`sh()` maps timeout vs non-zero exit to distinct error codes.
- **Effort:** M (small extraction refactor + tests)
- **Confidence:** high (gaps and drift verified by direct read; extraction surface is small and pure)

## Gap 2 — cursor-worker.sh (thin: raw branch only)

- **Target:** `scripts/cursor-worker.sh`
- **Why blast radius high:** This is the production sidecar dispatch for all Cursor C-jobs (per TOOLS.md: pinned `cursor-grok-4.5-high`, never run bare Auto). Existing test only structurally greps the `raw` branch and requires live Cursor auth (`agent login`/`CURSOR_API_KEY`, exits 2 without). Regressions in read/plan/write dispatch, `CURSOR_MODEL` override, `--force` gating, or PATH prepend (embedded Node v24.5 breaks `openclaw` CLI) ship silently to real jobs.
- **Proposed test file:** extend `scripts/test-cursor-worker.sh` or add `scripts/test-cursor-worker-dispatch.sh` using a fake `agent` shim placed first on PATH (no auth required). 2–4 cases:
  1. read/plan dispatch passes `--mode plan|ask` and never `--force`.
  2. write refuses without explicit implement intent (no unconstrained `--force`).
  3. `CURSOR_MODEL=…` override reaches agent args; default stays pinned model.
  4. PATH prepend puts nvm 24.18 first; missing `agent` binary → clean non-zero exit + message (no hang).
- **Effort:** M
- **Confidence:** med (existing grep-based structural checks are brittle; fake-agent shim is standard but worker uses tee/log-header details that need care in bash test)

## Gap 3 — memory-embed-warmup.mjs + probe CLI wrapper (untested thin layer)

- **Target:** `scripts/memory-embed-warmup.mjs` (60L wrapper over tested `lib/memory-health-lib.mjs`); note `memory-health-probe.mjs` `parseArgs()` is unexported and its CLI exit paths (2/0/2 at lines 151–176) untested.
- **Why blast radius high (med-high):** Memory-health is a named critical path (referenced in `procedural-memory-v1.md`, evals, observed-failures). The lib is well tested, but the CLI contract — exit 0/1, `embed_ms=`/`search_ms=` output consumed by cron/heartbeat — is unverified. A regression = false FAIL alarms or silent missed degradation.
- **Proposed test file:** `scripts/test-memory-embed-warmup.mjs` using `node:test` `mock.module` to stub `pingOllamaEmbed`/`timedMemorySearch` (Node v24.18 supports it). 2–4 cases:
  1. `--help` prints usage, exits 0, pings nothing.
  2. Embed failure → stderr `FAIL embed:`, exit 1, `embed_ms=` printed.
  3. Search failure → exit 1 with `search_ms=`; both OK → exit 0.
  4. `OLLAMA_HOST` trailing slash stripped; `DEFAULT_EMBED_MODEL` override propagated.
  - Optional add: export `parseArgs` from probe + 2 cases (unknown flag → exit 2, `--json`/`--quick` set flags).
- **Effort:** S
- **Confidence:** high (clear spec from code; pure CLI orchestration, easily mocked)

---

## Rejected candidates (why not top-3)
- `shared-browser-p0-check.sh` / `start-shared-chrome-windows.sh` / `cdp-bridge.ps1` / `.bat`: shared-browser is an in-flight P0 project (TOOLS.md status 2026-07-28), scripts are read-only/diagnostic — lower ROI than the three above.
- Python scripts (desktop-inventory, dreaming-audit, etc.): outside the listed harness priority classes; would need a separate pytest pass.

---

## Status
`status: complete` — packet written, no code touched (read-only per scope.json hard_bans).

## Evidence
- `scripts/` listing: 12 `test-*.mjs` + `test-cursor-worker.sh`; 11 `lib/*.mjs` all have tests.
- Untested verified by absence in `ls scripts/test-*` and `grep` of test files: gmail-unsub-batch(.mjs pair), memory-embed-warmup.mjs, browser shell/ps1/bat scripts.
- `test-cursor-worker.sh`: raw-branch grep + live auth smoke only (read in full).
- `test-memory-health.mjs`: 21 tests, all lib-level (`parseMemoryStatus`, `classify*`, `rollup*`); `grep parseArgs` → no match; `memory-health-probe.mjs` `parseArgs` not exported.
- Drift: `diff` of queue/PATH between gmail-unsub-batch.mjs and gmail-unsub-batch2.mjs (PATH env, phildong query, queue shape).

## Findings
1. Two external-action scripts (gmail unsub) have zero tests and are already drifting from each other — highest-risk gap.
2. cursor-worker.sh — the only harness with thin coverage — is tested only on its `raw` branch and only with live auth.
3. memory-embed-warmup.mjs CLI wrapper (and probe `parseArgs`) untested despite well-tested lib.

## Confidence
`high` — all gaps confirmed by direct file inspection; no ambiguity about which scripts lack tests. Per-gap conf: G1 high, G2 med, G3 high.

## Scope touched
`none` — read-only inspection only; single packet file written (`memory/swarm/runs/2026-08-06-chi/worker-missing-test.md`). No scripts, configs, or memory promoted. Implementation deferred to Cursor per pack context.
