# CHI Fix 1–3 evidence — 2026-08-01

**Scope:** Jason CHI fixes 1–3 only. No gmail, no finding 4/5, no openclaw.json.

## Fix 1 — stale default worker docs (current state)

| File | Before | After |
|------|--------|-------|
| `memory/procedural-memory-v1.md` Proc 8 | `currently zai/glm-5.1` | `currently deepseek/deepseek-v4-flash` |
| `docs/harness/retrieval-eval-set-v1.md` F10 | query/gold glm-5.1 / zai/glm-5.1 | query/gold deepseek-v4-flash / deepseek/deepseek-v4-flash |
| `MEMORY.md` architecture bullet | Subagent defaults: `zai/glm-5.1` (as current) | `deepseek/deepseek-v4-flash` (notes Layer A was glm; flipped 8/1) |
| `WORLD_STATE.md` Nova Architecture | Cheap worker … GLM-5.1 | Cheap worker / swarm default · DeepSeek V4 Flash |

Historical left alone: MEMORY.md **7/31** “subagents still zai/glm-5.1 until bake-off”.

## Fix 2 — claim-guard empty EVIDENCE

| File | Change |
|------|--------|
| `scripts/lib/claim-guard-lib.mjs` | Marker lines (`EVIDENCE:` / `Source:` / `CHECKED:`) require non-whitespace body after colon |
| `scripts/test-claim-guard.mjs` | +4 tests: empty, whitespace, filled artifact, Source/CHECKED empty vs filled |

**Verify:**
```bash
node scripts/test-claim-guard.mjs
# → 17 passed, 0 failed
```

## Fix 3 — cursor-worker raw pin + log

| File | Before | After |
|------|--------|-------|
| `scripts/cursor-worker.sh` raw | bare `exec agent --trust "$@"`; stderr tip only; no log_header | `log_header`; inject `--model "$CURSOR_MODEL"` unless `--model`/`--model=*` already present; tee to LOG |
| `scripts/test-cursor-worker.sh` | (new) | structural + live raw smoke |
| `TOOLS.md` | raw excepted from `--model` pin | raw pinned too unless explicit `--model` override |

**Verify:**
```bash
bash scripts/test-cursor-worker.sh
# → ALL PASS
# Log: memory/cursor-jobs/20260801-022308-raw.log
#   model=cursor-grok-4.5-high
#   RAW_PIN_OK
```

## Commands run
- `node scripts/test-claim-guard.mjs` → 17/17 PASS
- `bash scripts/test-cursor-worker.sh` → ALL PASS (auth available)

## Residual risks
- F10 accept path still lists `memory/claim-ledger.md`, which retains historical glm-5.1 claim rows (not rewritten; ledger is point-in-time). Retrieval may still surface old ledger text; gold + Proc8/MEMORY/WORLD_STATE now match live Flash.
- Raw smoke depends on Cursor agent auth; structural checks still fail closed without auth.
- WORLD_STATE “Updated:” stamp still 2026-07-30 (architecture row only patched; no full ops refresh this pass).
