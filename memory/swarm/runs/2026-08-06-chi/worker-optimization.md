# CHI Worker — Optimization — 2026-08-06

**Class:** optimization · **Mode:** read-only · **Worker:** deepseek/deepseek-v4-flash
**Scope:** scripts/ + docs/harness + memory probe/warmup/startup · **Hard bans honored:** no edits, no git writes, no config.

**Status:** PASS
**Confidence:** high (all time claims measured live this session, not estimated)
**scope_touched:** `scripts/retrieval-eval.mjs`, `scripts/memory-embed-warmup.mjs`, `scripts/memory-health-probe.mjs`, `scripts/lib/memory-health-lib.mjs`, `scripts/lib/retrieval-eval-lib.mjs`, `scripts/lib/session-startup-lib.mjs`, `scripts/lib/active-memory-smoke-lib.mjs`, `scripts/gmail-unsub-batch*.mjs`, `scripts/cursor-worker.sh`, `docs/harness/swarm-protocol-v0.md`, `docs/harness/retrieval-eval-set-v1.md`, `memory/procedural-memory-v1.md`, `memory/harness-scorecard.md` — all **read only**; nothing modified.

---

## Measured baseline (live, this session)

| Probe | Wall | Breakdown |
|---|---|---|
| `node scripts/memory-embed-warmup.mjs` | **5.5s** | embed 164ms + `openclaw memory search` **5.3s** (CLI spawn dominates) |
| `node scripts/memory-health-probe.mjs --quick --no-report` | **5.6s** | 8 checks pass; no search smoke |
| `node scripts/retrieval-eval.mjs --limit 3 --no-report` | **22.3s** | ~7.4s/fact; full 15-fact default run ≈ **2 min** (measured 3→extrapolated) |

Bottleneck everywhere = **`openclaw` CLI spawn (~5–7s)**, not Ollama embed (67–164ms) and not ranking.

---

## OPT-1 — retrieval-eval: parallelize fact searches (`--concurrency N`)

**Current cost:** 15-fact default run ≈ 110–125s serial (22.3s for 3 facts, incl. 150ms inter-query sleep; each search ~5–7s CLI spawn). Chair/operator pays ~2 min wall per meter refresh.
**Proposed change:** Add `--concurrency N` (default 2–3, cap 5) to `scripts/retrieval-eval.mjs`; run facts through a small pool (pattern already in `session-startup-lib.mjs` `mapPool`); keep serial order in report rows; drop `INTER_QUERY_SLEEP_MS` in concurrent mode; add `--concurrency` to `--help` + 1–2 lib tests.
**Expected gain:** full run ~110s → **~45–55s at concurrency 3** (~2.2×); ~35–40s at 5. Pure wall-time win; token cost unchanged (same searches).
**Risk:** LOW — searches are read-only; precedent already in repo: session-startup runs 2 concurrent LIGHT searches (`LIGHT_SEARCH_CONCURRENCY=2`), probe has a dual-concurrent check; no shared mutable state; report rows can be re-sorted by fact order after completion.
**Effort:** M · **Confidence:** HIGH (bottleneck measured, not guessed)

## OPT-2 — Consolidate Node PATH bootstrap into one shared module (kills 3+ copies)

**Current cost:** Node pin `v24.18.0` hardcoded in **8 files**; `buildChildEnv()` (15 lines) in `memory-health-lib.mjs` is **copied verbatim** as `childEnv()` inside `retrieval-eval.mjs`; inline PATH strings in `gmail-unsub-batch.mjs:13`, `gmail-unsub-batch2.mjs:9`, `active-memory-smoke-lib.mjs:222`; shell variants in `cursor-worker.sh` + `shared-browser-p0-check.sh`. Every Node version bump = 6–8 coordinated edits → drift risk (this exact drift was a real incident class: Cursor embeds Node v24.5.0 which breaks `openclaw` CLI; TOOLS.md documents the pin).
**Proposed change:** New `scripts/lib/node-env.mjs` exporting `buildChildEnv()` (moved from memory-health-lib, re-exported for back-compat) + `scripts/lib/node-path.sh` for the two shell scripts. Refactor `retrieval-eval.mjs` (remove local `childEnv`), memory-health-lib, active-memory-smoke-lib to import; shell scripts `source` the shared file.
**Expected gain:** single source of truth for Node pin; future bumps = 1–2 edits; removes ~20 duplicate lines from retrieval-eval; smaller token surface.
**Risk:** LOW for `.mjs` side (both consumers covered by `test-memory-health.mjs` + `test-retrieval-eval.mjs`, 17 tests); MEDIUM-low for shell side (`cursor-worker.sh` has `test-cursor-worker.sh` structural checks — run regress after).
**Effort:** S (mjs-only) / M (incl. shell) · **Confidence:** HIGH (mechanical dedupe, tests exist)

## OPT-3 — Fold warmup into probe: `memory-health-probe.mjs --warmup` replaces `memory-embed-warmup.mjs`

**Current cost:** two overlapping CLIs to maintain/learn — warmup (95 lines: embed ping + 1 search, 5.5s) and probe (238 lines: `--quick` = 8 checks but **no** search smoke; full = +3 search checks ~+20s). Neither mode is the other's superset; Procedure 16/20 (`procedural-memory-v1.md:510,520`) references **both**, and proc text has to explain two tools for one purpose. No dedicated warmup test exists.
**Proposed change:** Add `--warmup` flag to probe = `--quick` checks + **one** search smoke + no report + exit 0/1; keep `memory-embed-warmup.mjs` for one cycle as a thin alias wrapper (or delete + update the two procedure references). Update `memory/procedural-memory-v1.md` lines 510/520 to point at `probe --warmup`.
**Expected gain:** one CLI, one help text, one exit-code contract; startup warm path ≈ 6s (same as today); removes a 95-line duplicate surface and doc ambiguity.
**Risk:** LOW — lib functions (`pingOllamaEmbed`, `timedMemorySearch`, `buildChildEnv`) already shared; covered by `test-memory-health.mjs`.
**Effort:** S · **Confidence:** HIGH

---

## Rejected / noted (not recommended)

- **Session-startup same-day LIGHT-search cache** — would cut ~6–8s on later same-day sessions, but AGENTS.md mandates aggressive startup retrieval and cached summaries risk staleness (index refreshes intra-day). Confidence MED → not worth it.
- **Probe default report off** — 17 report files / 3.7MB in `memory/cursor-jobs/` is acceptable; `--no-report` exists for automation.
- **`--max-results 24` default in retrieval-eval** — justified by C3 (dream-noise filter headroom); search time is spawn-dominated, not N-dominated, so lowering N buys nothing.

## Evidence

- `time node scripts/memory-embed-warmup.mjs` → real **5.549s**; `embed_ms=164 search_ms=5311`
- `time node scripts/memory-health-probe.mjs --quick --no-report --json` → real **5.561s**; overall pass; 8 checks; search checks skipped
- `time node scripts/retrieval-eval.mjs --limit 3 --no-report` → real **22.320s**; F01–F03 scored; filtered hit@3 3/3 (meter healthy, time is the problem)
- `grep -rn "v24.18.0" scripts/` → 8 files: `lib/active-memory-smoke-lib.mjs`, `lib/memory-health-lib.mjs`, `test-memory-health.mjs`, `shared-browser-p0-check.sh`, `gmail-unsub-batch.mjs`, `gmail-unsub-batch2.mjs`, `retrieval-eval.mjs`, `cursor-worker.sh`
- `diff` of `childEnv()` (retrieval-eval) vs `buildChildEnv()` (memory-health-lib) → functionally identical (same candidates, same PATH prepend)
- `docs/harness/retrieval-eval-set-v1.md` → 15 facts (F01–F15)
- `memory/procedural-memory-v1.md:510,520` → both warmup + probe referenced
- Precedent for concurrency: `session-startup-lib.mjs` `LIGHT_SEARCH_CONCURRENCY=2` + `mapPool`; probe `memory_search_concurrent` dual-search check

**Recommended order for Cursor brief (if approved):** OPT-3 (S) → OPT-2 mjs (S) → OPT-1 (M), then `regress` pack (test-retrieval-eval, test-memory-health, test-cursor-worker if shell touched).

---

## Independent re-verification (second worker pass, 18:1x–18:2x PDT)

Second measurement pass confirms all claims within CLI-spawn variance:

| Probe (re-run) | Wall | vs packet |
|---|---|---|
| `node scripts/memory-embed-warmup.mjs` | **7.52s** | packet 5.5s (search_ms 7349 vs 5311 — spawn variance, same conclusion) |
| `node scripts/memory-health-probe.mjs --quick --no-report --json` | **4.72s** | packet 5.6s (variance, same conclusion) |
| `node scripts/retrieval-eval.mjs --limit 3 --no-report` | **21.54s** | packet 22.3s (confirmed; filtered hit@3 3/3, meter healthy) |

Re-verified statics: `v24.18.0` in **8** script files (matches packet); `childEnv()` at `retrieval-eval.mjs:108` vs `buildChildEnv()` at `lib/memory-health-lib.mjs:100` (verbatim dup); **no** concurrency/mapPool in `retrieval-eval.mjs`; `LIGHT_SEARCH_CONCURRENCY=2` + `mapPool` precedent at `lib/session-startup-lib.mjs:32,188,424`; 15 facts F01–F15 in `docs/harness/retrieval-eval-set-v1.md`; `memory/procedural-memory-v1.md:510,520` reference both warmup + probe; warmup 95 lines, probe 238 lines.

**Verdict: packet stands as written. OPT-1/2/3 all confirmed, effort S/M, risk low.**
