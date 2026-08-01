# Cursor brief — memory_search reliability fix (2026-08-01)

**Mode:** `write` (implement)  
**Model pin:** `cursor-grok-4.5-high` (worker default)  
**Owner:** Nova chair · Cursor implement · Nova verify  
**Do not:** touch `~/.openclaw/openclaw.json`, wallet/secrets, git commit/push, npm openclaw package under `~/.npm-global`

## Problem (verified)

At main-session startup ~12:42–12:43 PDT 2026-08-01:

- Agent tool `memory_search` returned:
  - `memory_search timed out after 15s`
  - `Memory search is unavailable due to an embedding/provider error.`
- Later same hour: tool path recovered (~1.4s searchMs) and CLI path healthy.

### Live evidence (Nova precheck)

| Check | Result |
|-------|--------|
| `openclaw memory status` | Indexed 441–442/442 · Dirty no · FTS ready · provider ollama · nomic-embed-text |
| `node scripts/memory-health-probe.mjs` | PASS incl. search smoke (~10s full probe) |
| CLI `openclaw memory search` ×3 timed | ~5.0–5.3s each |
| Concurrent CLI ×2 (startup-like) | ~5.9–6.1s wall |
| Ollama embed latency (warm) | ~0.04–0.15s · dims 768 |
| OpenClaw agent tool hardcode | `MEMORY_SEARCH_TOOL_TIMEOUT_MS = 15e3` in `dist/tools-DXHLX8MK.js` |
| Cooldown after tool fail | `MEMORY_SEARCH_TOOL_COOLDOWN_MS = 6e4` (60s) |
| Config `agents.defaults.memorySearch` | ollama/nomic · hybrid+mmr+temporalDecay · **no tool timeout knob** |
| Session-startup LIGHT path | CLI via `scripts/lib/session-startup-lib.mjs` `runMemorySearch` with **timeout: 10_000** |

### Root-cause hypothesis (implement against this)

1. **Not a dead index / missing model** — CLI + probe PASS; embeds warm are fast.
2. **Agent tool has a hard 15s deadline** (not config-tunable in package). Slow first search after idle/contention can trip it → unavailable + **60s cooldown** (looks “broken” longer than the blip).
3. **Session-startup CLI budget is tight at 10s/search** — warm path ~6s OK; cold/load can flake LIGHT even when stack is fine.
4. False “embedding/provider error” wrapper masks timeout (OpenClaw tools.ts behavior).

**Out of Cursor scope (report only):** raising `MEMORY_SEARCH_TOOL_TIMEOUT_MS` inside npm `openclaw` (protected infra → Codex/upstream). Workspace can still make timeouts rare and detect them.

## Goal

Make memory recall **reliable under cold/load** in this workspace:

1. Detect slow/failing memory infra with latency-aware probe (not just pass/fail existence).
2. Warm embed + search path so startup/tool are less likely to hit 10s/15s cliffs.
3. Loosen session-startup CLI search timeout safely within plugin 30s budget.
4. Document Procedure 16 notes: tool 15s hardcode, 60s cooldown, CLI-vs-tool flake.
5. Tests green; completion gate satisfied.

## Implement (ordered)

### A. `scripts/memory-embed-warmup.mjs` (+ tiny lib helper if cleaner)

- Warm path only; **no DB writes / no reindex / no config edits**.
- Steps:
  1. HTTP embed ping to Ollama `nomic-embed-text` (or model from env/`DEFAULT_EMBED_MODEL`)
  2. One `openclaw memory search --json --max-results 1 "<short query>"` with Node PATH preferring nvm 24.18
- Exit: 0 warm OK · 1 fail
- Print timings (embed_ms, search_ms)
- Reuse patterns from `scripts/lib/memory-health-lib.mjs` where sensible (spawn/exec helpers)

### B. Extend memory health probe (lib + CLI + tests)

Add checks (or enrich existing) roughly:

- `embed_latency` — single embed; **warn** if >2s, **fail** if unreachable/error
- `memory_search_latency` — time CLI search smoke; **warn** if >8s, **fail** if timeout/error (keep existing smoke; add timing in summary/detail)
- `memory_search_concurrent` — optional dual concurrent searches (startup-like); **warn** if wall >12s; skip on `--quick`

Update:

- `scripts/lib/memory-health-lib.mjs`
- `scripts/memory-health-probe.mjs` (help text if any)
- `scripts/test-memory-health.mjs` — unit/fixtures for new thresholds; no live ollama required for pure threshold helpers
- Recovery doc `memory/evals/memory-health-recovery-v0.md` — short note on latency cliffs + warmup command

### C. Session-startup CLI timeout

In `scripts/lib/session-startup-lib.mjs` `runMemorySearch`:

- Raise `timeout` from `10_000` → **`20_000`** (still under plugin `timeoutMs=30000` with concurrency 2 wall-clock ≈ max(search)).
- Export constant e.g. `LIGHT_SEARCH_TIMEOUT_MS = 20_000` for tests.
- Update `scripts/test-session-startup.mjs` if it asserts 10000.

### D. Procedure 16 note (minimal)

In `memory/procedural-memory-v1.md` under Procedure 16 (memory health):

- Agent tool hard timeout **15s** + fail cooldown **60s** (package hardcode; not openclaw.json).
- If tool unavailable but `openclaw memory search` works → **tool flake / cooldown**; use CLI + files; run warmup + probe; do not flip embed provider.
- Warmup: `node scripts/memory-embed-warmup.mjs`
- Latency probe warns before hard cliffs.

Do **not** rewrite whole procedure.

### E. Observed failure log (one short entry)

Append to `memory/observed-failures.md`:

- Date 2026-08-01 · Retrieval/tool timeout · agent memory_search 15s · CLI OK · fix warmup+probe+startup timeout

## Explicit non-goals

- No `openclaw.json` edits
- No npm package patch / no gateway restart requirement
- No reindex unless probe proves index broken (it does not)
- No Active Memory config changes
- No dream/index ranking work

## Acceptance tests (must show exits)

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node --check scripts/memory-embed-warmup.mjs
node --check scripts/lib/memory-health-lib.mjs
node --check scripts/memory-health-probe.mjs
node --check scripts/lib/session-startup-lib.mjs
node scripts/test-memory-health.mjs
node scripts/test-session-startup.mjs
node scripts/memory-embed-warmup.mjs
node scripts/memory-health-probe.mjs --quick
# if time: full probe once
node scripts/memory-health-probe.mjs
bash -n scripts/*.sh  # only if you touched sh
git diff --stat
```

## Deliverable

Write report:

`memory/cursor-jobs/memory-search-timeout-fix-2026-08-01.md`

Include:

1. Root cause summary (tool 15s vs CLI OK)
2. Files changed
3. Test exits
4. Warmup + probe sample timings
5. Residual risk: agent tool timeout still hardcoded 15s until Codex/upstream
6. claim-guard clean language (no bare “fixed/done” without evidence)

## Completion gate

Per `.cursor/rules/nova-sidecar.mdc`: bash -n / node --check / targeted tests / diff readback. No completion claim if red.
