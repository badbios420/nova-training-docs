# Worker packet — PATH EXISTENCE + MODEL-CLAIM GUARDS (coverage worker B)

status: PASS
date: 2026-08-06 ~19:15 PDT
mode: read-only (no edits, no git writes, no config changes)
role: Coverage worker B (path existence + present-tense model-claim guards)

## Answers to scope questions

### Q1) What tests ensure canonical paths cited in MEMORY/TOOLS/procedural/AGENTS actually exist?

**Existing coverage: NONE for doc-cited paths.** No test extracts backtick/canonical paths from
MEMORY.md / TOOLS.md / AGENTS.md / HEARTBEAT.md / procedural-memory-v1.md and verifies existence.

What does exist (all partial or incidental):

| Artifact | What it checks | Scope | Verdict |
|---|---|---|---|
| `scripts/test-session-startup.mjs` (13 tests) | `runStartup` fails with `missingFiles=[SOUL.md…]` when a critical file is absent — **in a tmp fixture workspace** | fixture only; never touches real citations | covers the mechanism, not the corpus |
| `scripts/session-startup.mjs` (live runtime) | Real-workspace `missingFiles` check for the ~8 startup files (SOUL/USER/MEMORY/daily/procedural/…) → STARTUP_FAILED | runtime guard, 8 paths | real but tiny subset; not a test |
| `scripts/test-swv-dry-harness.mjs` | Reads `memory/evals/swv/fixtures/sample-task.json` + `memory/evals/swv/templates/*` (would fail if missing); asserts runDir artifacts exist | incidental fixture reads | not a doc-path guard |
| `scripts/test-retrieval-eval.mjs` | Reads eval-set + fixtures from `docs/harness` / `memory/evals` | incidental | not a doc-path guard |
| `scripts/test-active-memory-smoke.mjs` (+lib) | `fs.existsSync` on live plugin install root (`dist/extensions/active-memory/{openclaw.plugin.json,index.js}`) + protected path markers | AM plugin only | closest real-path test, narrow scope |
| `scripts/test-claim-guard.mjs` | No path checks; EVIDENCE is matched as **text only** — `EVIDENCE: \`scripts/foo.mjs\`` clears a bare "done" even if `scripts/foo.mjs` does not exist | — | gap adjacent to Q1 |

**Direct evidence this gap bites:** same-day `memory/swarm/runs/2026-08-06-doc-audit/worker-dead-paths.md`
found 6+ MISS paths (`docs/tools/browser-wsl2-windows-remote-cdp-troubleshooting.md`, `scripts/swarm-pack-run.mjs`,
`memory/swarm/packs/chi-v0.json`, `regress-v0.json`, `memory/index/`, garbled daily ref) via **manual**
`grep`/`test -e`; fixes verified by chair `grep -n`/`test ! -e` commands in `implement-decision-2026-08-06.md` —
**no regression test was added**. The failure class "canonical_path_existence" recurs with zero automation.

### Q2) What tests ensure present-tense swarm/brain/cursor model claims match live architecture?

**Existing coverage: partial; nothing binds docs to live `~/.openclaw/openclaw.json`.**

| Claim (present-tense docs) | Live arch (verified today) | Test binding them? |
|---|---|---|
| Brain `xai/grok-4.5` (WORLD_STATE "Default brain", MEMORY.md:29, IDENTITY.md:8) | `agents.defaults.model.primary = xai/grok-4.5` | **NO** — `test-protected-settings-guard.mjs` only proves the *repair mechanism* on a synthetic fixture (baseline is hardcoded, not the live config); live guard runs at runtime, not as a test |
| Swarm/subagent `deepseek/deepseek-v4-flash` (WORLD_STATE:107, MEMORY.md:30) | `agents.defaults.subagents.model = deepseek/deepseek-v4-flash` | **NO** — `test-swv-dry-harness.mjs` asserts `MODEL_HINT === "deepseek/deepseek-v4-flash"` but that value comes from **fixture** `sample-task.json` `modelHints`; if fixture drifts from live config, test still passes |
| Cursor pin `cursor-grok-4.5-high` (WORLD_STATE:114, TOOLS.md, MEMORY.md:95) | `scripts/cursor-worker.sh` line 35: `CURSOR_MODEL="${CURSOR_MODEL:-cursor-grok-4.5-high}"` | **YES (best existing)** — `test-cursor-worker.sh`: structural grep (raw branch pins `--model`, log_header, isAuthenticated auth) + live smoke asserting `model=cursor-grok-4.5-high` in job log + marker reply. Requires Cursor auth; `exit 2` without it |

Also: no guard on the "historical dailies must not be rewritten" rule — MEMORY.md:97 already self-annotates
("true as of 7/31 only; superseded 8/1"), i.e., supersession is handled by hand, never enforced.
`claim-guard` does not cover this (it scans for banned success words, not stale model claims).

All present-tense claims verified **true today** (config read + grep above), so this is unguarded-true, not stale.

## Coverage gaps (ranked)

1. **No canonical-path-existence test** for docs corpus (~364 backtick spans across MEMORY/TOOLS/AGENTS/HEARTBEAT/procedural; 156 alone in procedural-memory-v1.md). Same-day doc-audit found real MISSes this way manually.
2. **No doc-vs-live-config model sync test** (brain / swarm / cursor claims). Fixture-based tests give false assurance (fixture drift undetected).
3. **claim-guard EVIDENCE paths not validated** — nonexistent artifact paths clear banned words.
4. **cursor pin test is live-dependent** (Cursor auth); no offline structural assertion that the pin string matches the WORLD_STATE/TOOLS/MEMORY claims (only that the worker *has* a pin).

## Top 3 proposed tests (no implement — per scope)

### T1 — `scripts/test-canonical-paths.mjs` (path existence) — effort M (~1–2 h)
Extract backtick spans from MEMORY.md, TOOLS.md, AGENTS.md, HEARTBEAT.md, memory/procedural-memory-v1.md, memory/session-consolidation-v1.md; classify & assert.
- Case A: relative paths (contain `/` or `.`, not URL/model-id) → `fs.existsSync` (trailing `/` → dir check).
- Case B: glob patterns allowed: `memory/YYYY-MM-DD.md`, `memory/research-YYYY-MM-DD-*.md`, `memory/jason-*.md`, `memory/10k-nft-*.md`, `memory/cursor-jobs/retrieval-eval-report-*` → assert ≥1 glob match.
- Case C: regression denylist from doc-audit fixes: `docs/tools/browser-wsl2-…` must NOT appear as live citation; `scripts/swarm-pack-run.mjs` must not be cited as built (only as planned).
- Case D: skip classifier (commands like `git status`, model ids `xai/grok-4.5`, external tools `gog`, URLs).
- Offline only; runnable while GLM/Anthropic API down. Risk: span classifier false positives → keep "report-only" mode first.

### T2 — `scripts/test-model-claims-vs-config.mjs` (doc ↔ live config) — effort S–M (~1 h)
Read `~/.openclaw/openclaw.json` + grep docs. No provider calls, no API health checks.
- Case A: `agents.defaults.model.primary === "xai/grok-4.5"` AND WORLD_STATE "Default brain" row + IDENTITY `Model:` line agree (present-tense only).
- Case B: `agents.defaults.subagents.model === "deepseek/deepseek-v4-flash"` AND WORLD_STATE "Cheap worker / swarm default" row agrees.
- Case C: `cursor-worker.sh` default `CURSOR_MODEL=cursor-grok-4.5-high` AND TOOLS.md/MEMORY pin line agrees (structural grep — replaces the live part for CI; live `test-cursor-worker.sh` stays as optional auth-gated smoke).
- Case D (no-rewrite guard): scan pre-flip dailies (≤2026-08-01) for bare present-tense brain/swarm claims; PASS only if annotated `true as of …` / `superseded`; never rewrite — report-only.
- Offline; safe with GLM/Anthropic API down (config file + fs only).

### T3 — extend `claim-guard-lib` + `test-claim-guard.mjs` with EVIDENCE path validation — effort M (~1–1.5 h)
Optional flag (default off to preserve semantics).
- Case A: `EVIDENCE: \`scripts/definitely-missing-xyz.mjs\`` does NOT clear bare "done" (violation when `--pathcheck` on).
- Case B: `EVIDENCE: \`scripts/claim-guard.mjs\`` (exists) clears.
- Case C: URL evidence (`https://…`) clears without fs check.
- Case D: `--pathcheck` dir-scan reports broken EVIDENCE paths in the report.
- Note: behavior change → needs implement decision; keep default-off for compat.

## Constraint compliance (GLM/Anthropic API down)
All three proposals are offline (fs + config parse + grep). Existing suite already avoids live providers:
`test-swv-dry-harness.mjs` (14 pass), `test-claim-guard.mjs` (21 pass) run clean here (executed, verified).
Only live-dependent test is `test-cursor-worker.sh` (Cursor auth, `exit 2` without agent/login) — unrelated to
GLM/Anthropic, but should stay auth-gated/optional in CI.

## Evidence
- Ran: `node scripts/test-swv-dry-harness.mjs` → 14 passed; `node scripts/test-claim-guard.mjs` → 21 passed (offline).
- Read: test-claim-guard.mjs, claim-guard.mjs, lib/claim-guard-lib.mjs, test-swv-dry-harness.mjs, lib/swv-dry-harness-lib.mjs, test-cursor-worker.sh, test-protected-settings-guard.mjs, protected-settings-guard.mjs, test-session-startup.mjs, lib/session-startup-lib.mjs, test-active-memory-smoke.mjs, lib/active-memory-smoke-lib.mjs, test-memory-health.mjs, test-error-doctor.mjs, test-git-lockin-inventory.mjs, git-lockin-inventory.mjs, memory/evals/swv/fixtures/sample-task.json, doc-audit run (report.md, worker-dead-paths.md, implement-decision-2026-08-06.md), scope.json.
- Greps: `existsSync` across scripts/tests; `grok-4.5|deepseek|cursor-grok|brain` in scripts+tests+docs; `openclaw.json` readers; backtick-span counts per canonical doc (MEMORY 76, TOOLS 52, AGENTS 35, procedural 156, consolidation 10, observed-failures 27, HEARTBEAT 8).
- Live config read (read-only): `/home/mrbig3/.openclaw/openclaw.json` → primary `xai/grok-4.5`, subagents `deepseek/deepseek-v4-flash` (thinking low, maxConcurrent 3); providers incl. xai/zai/anthropic/deepseek.
- Manual existence spot-check of 10 MEMORY.md backtick paths → 10/10 present (corpus currently healthy; gap is guard, not breakage).

## Findings
1. Q1: **zero automated coverage** for canonical-path existence in the docs corpus; runtime startup guard covers ~8 files only; doc-audit pack found real MISSes by hand the same day.
2. Q2: brain/swarm claims have **no doc-vs-live binding** (fixture-based tests can silently drift); cursor pin is the only guarded claim, via structural grep + auth-gated live smoke.
3. All present-tense model claims verified TRUE against live config today (grok-4.5 brain / deepseek-v4-flash swarm / cursor-grok-4.5-high pin).
4. claim-guard treats EVIDENCE as text; nonexistent artifact paths clear banned words.
5. Historical-supersession annotation exists by convention (MEMORY.md "true as of … superseded") but is unenforced.

## Confidence
high — direct inspection of all test files + live config read + same-day doc-audit evidence; executed offline tests to confirm suite health.

## Scope touched (read-only)
- scripts/test-swv-dry-harness.mjs, scripts/lib/swv-dry-harness-lib.mjs, scripts/test-cursor-worker.sh, scripts/cursor-worker.sh, scripts/test-protected-settings-guard.mjs, scripts/protected-settings-guard.mjs, scripts/test-claim-guard.mjs, scripts/lib/claim-guard-lib.mjs, scripts/test-session-startup.mjs, scripts/lib/session-startup-lib.mjs, scripts/test-active-memory-smoke.mjs, scripts/lib/active-memory-smoke-lib.mjs, scripts/test-memory-health.mjs, scripts/test-error-doctor.mjs, scripts/test-git-lockin-inventory.mjs, scripts/git-lockin-inventory.mjs, memory/evals/swv/fixtures/sample-task.json
- MEMORY.md, TOOLS.md, AGENTS.md, HEARTBEAT.md, IDENTITY.md, WORLD_STATE.md, memory/procedural-memory-v1.md (grep/read only)
- /home/mrbig3/.openclaw/openclaw.json (read only)
- memory/swarm/runs/2026-08-06-doc-audit/{report.md,worker-dead-paths.md,implement-decision-2026-08-06.md} (context)
