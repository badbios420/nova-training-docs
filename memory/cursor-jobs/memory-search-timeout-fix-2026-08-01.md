# memory_search reliability fix — Cursor report (2026-08-01)

**Mode:** write · **Worker:** cursor-grok-4.5-high · **Owner:** Nova chair / Cursor implement / Nova verify  
**Scope:** workspace scripts + Procedure 16 notes only. No `openclaw.json`, no npm package patch, no commit/push.

## 1. Root cause summary

Verified incident (~12:42–12:43 PDT): agent tool `memory_search` hit package hardcode **`MEMORY_SEARCH_TOOL_TIMEOUT_MS = 15e3`**, then **`MEMORY_SEARCH_TOOL_COOLDOWN_MS = 6e4`**, often wrapped as “embedding/provider error.”

Same hour: CLI `openclaw memory search` and `memory-health-probe` were healthy (~5–6s). Index/provider were fine (ollama / nomic-embed-text; Indexed full; Dirty no).

Contributing cliffs in this workspace:

| Path | Budget | Risk |
|------|--------|------|
| Agent tool (npm openclaw) | **15s hard** + 60s cooldown | Cold/contention search trips → looks “down” |
| Session-startup LIGHT CLI | was **10s**/query | Warm ~6s OK; cold/load can flake |
| False error wrapper | tools.ts | Timeout masked as embed/provider error |

**Out of Cursor scope (residual):** raising the agent tool 15s constant requires Codex/upstream npm `openclaw` change.

## 2. Files changed

| Path | Change |
|------|--------|
| `scripts/memory-embed-warmup.mjs` | **new** — embed HTTP ping + 1 CLI search; prints `embed_ms` / `search_ms`; exit 0/1 |
| `scripts/lib/memory-health-lib.mjs` | latency helpers; `pingOllamaEmbed` / `timedMemorySearch`; checks `embed_latency`, `memory_search_latency`, `memory_search_concurrent` |
| `scripts/memory-health-probe.mjs` | help text for latency checks + warmup |
| `scripts/test-memory-health.mjs` | unit tests for latency threshold helpers (offline) |
| `scripts/lib/session-startup-lib.mjs` | `LIGHT_SEARCH_TIMEOUT_MS = 20_000`; `runMemorySearch` uses it |
| `scripts/test-session-startup.mjs` | asserts 20s LIGHT timeout constant |
| `memory/evals/memory-health-recovery-v0.md` | latency cliffs + warmup + tool 15s/60s note |
| `memory/procedural-memory-v1.md` | Procedure 16 minimal tool-flake / warmup note |
| `memory/observed-failures.md` | 2026-08-01 retrieval/tool timeout entry |
| `memory/cursor-jobs/memory-search-timeout-fix-2026-08-01.md` | this report |

## 3. Test exits (completion gate)

```text
node --check scripts/memory-embed-warmup.mjs          → 0
node --check scripts/lib/memory-health-lib.mjs         → 0
node --check scripts/memory-health-probe.mjs           → 0
node --check scripts/lib/session-startup-lib.mjs       → 0
node scripts/test-memory-health.mjs                   → 0 (16 passed)
node scripts/test-session-startup.mjs                 → 0 (13 passed)
node scripts/memory-embed-warmup.mjs                  → 0
node scripts/memory-health-probe.mjs --quick          → 0 (overall PASS)
node scripts/memory-health-probe.mjs                  → 0 (overall PASS)
```

No `*.sh` touched → `bash -n` N/A.

## 4. Warmup + probe sample timings (live this run)

**Warmup** (`node scripts/memory-embed-warmup.mjs`):

- `embed_ms=58` · dims=768
- `search_ms=7134` · results=1
- exit 0

**Quick probe:** overall PASS; search checks SKIP; `embed_latency` 45ms PASS.

**Full probe:**

| Check | Status | Timing / note |
|-------|--------|----------------|
| `embed_latency` | pass | 45ms |
| `memory_search_smoke` | pass | 24 results, **6076ms** |
| `memory_search_latency` | pass | 6076ms (warn >8000ms) |
| `memory_search_concurrent` | pass | wall **5649ms** (a=5631, b=5643) |
| overall | **PASS** | exit 0 |

## 5. Residual risk

- **Agent tool timeout remains hardcoded at 15s** (+ 60s cooldown) until Codex/upstream changes npm `openclaw`. Workspace mitigations (warmup, latency warns, LIGHT 20s) reduce flake rate but cannot eliminate a slow tool call under heavy contention.
- Concurrent startup-like wall ~5.6–7s warm today; cold after idle can still approach cliffs — run warmup before main session when in doubt.
- claim-guard: do **not** claim “memory_search fixed forever”; evidence supports **workspace path hardened + cliffs detectable**; package tool budget unchanged.

## 6. How to verify

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/memory-embed-warmup.mjs
node scripts/memory-health-probe.mjs --quick
node scripts/test-memory-health.mjs
node scripts/test-session-startup.mjs
# optional: confirm LIGHT timeout constant
rg "LIGHT_SEARCH_TIMEOUT_MS" scripts/lib/session-startup-lib.mjs
```

## 7. claim-guard language

Evidence shows: unit tests green; live warmup OK; full probe PASS with latency checks; LIGHT CLI timeout raised to 20s; Procedure 16 / recovery / observed-failures updated. **Agent tool 15s hardcode not changed** (out of scope). Reliability under cold/load is **improved and measurable**, not absolute.
