# Cursor brief — Coverage gaps 1+2 ONLY (2026-08-06)

**Model:** cursor-grok-4.5-high  
**Mode:** implement tests only · no commit/push · no config · no gateway · no gap 3  
**Result file:** `memory/cursor-jobs/coverage-gaps-1-2-2026-08-06-result.md`

## Gap 1 — `scripts/test-superseded-stubs.mjs` (new)

Assert:

### A. `memory/priority-dashboard.md`
1. Contains explicit **SUPERSEDED** (case-insensitive ok).
2. Mentions **WORLD_STATE.md** as canonical live source.
3. Does **not** contain live task-table rows matching something like:
   - markdown table rows that look like `| <number> | **...** |` task inventories
   - OR heuristic: no multi-row URGENT/IMPORTANT task grid returning to life
4. Fail loudly if file missing.

### B. `memory/procedural-memory-v1.md` Procedure 3 section only
1. Find `## 3.` through next `## 4.`
2. Must contain SUPERSEDED (or equivalent stub status).
3. Must **not** contain an **active** commit/push checklist (e.g. bare "Commit with clear message" / "Verify push succeeded" as instructions). Mentions of commit/push only in "do not" / gated / superseded context are OK if clearly non-checklist.
4. Should reference Proc 21 and/or 15 (gate/order).

Run with `node scripts/test-superseded-stubs.mjs` → exit 0 all pass.

## Gap 2 — `scripts/test-model-claims-vs-config.mjs` (new)

### Authoritative runtime sources (read these; do not invent)
1. `~/.openclaw/openclaw.json` (or resolve via workspace if documented):
   - `agents.defaults.model.primary` → expect `xai/grok-4.5`
   - `agents.defaults.subagents.model` → expect `deepseek/deepseek-v4-flash`
2. `scripts/cursor-worker.sh` default pin:
   - `CURSOR_MODEL="${CURSOR_MODEL:-cursor-grok-4.5-high}"` or equivalent default → `cursor-grok-4.5-high`
3. Chamber seats (docs as current-architecture surfaces, not openclaw.json if seats are doc-only):
   - Structural = GLM-5.2 (or `zai/glm-5.2` / `glm-5.2` normalized)
   - Skeptic = GPT-5.6-sol / `openai/gpt-5.6-sol` / `gpt-5.6-sol`

### CURRENT-architecture surfaces to check (only these)
Present-tense claims in:
- `WORLD_STATE.md` Nova Architecture / model table region
- `MEMORY.md` architecture bullets near top (Default brain / Subagent defaults / Alpha harness) — **not** entire dated chronology dump
- `TOOLS.md` Cursor default model table
- `docs/harness/swarm-protocol-v0.md` header defaults (brain/worker/cursor)
- `IDENTITY.md` Model line if present-tense current

### HISTORICAL — must NOT fail the suite
Exclude or mark skip:
- `memory/YYYY-MM-DD.md` dailies
- `memory/research-*.md`
- `memory/chambers/**`
- session consolidations, promotion blocks that are clearly dated history
- MEMORY.md lines under "Recent durable decisions" that are dated **7/31** etc. **if** they carry "true as of" / "superseded" / are clearly past-tense chronology — do not require rewriting history
- Any line that is explicitly historical ("was", "flipped 8/1", "true as of 7/31")

### Logic
1. Load authoritative expected models from config + cursor-worker.
2. Scan CURRENT surfaces for present-tense architecture claims.
3. If a CURRENT surface asserts a **conflicting live** brain/swarm/cursor/chamber seat, FAIL.
4. If CURRENT surfaces agree with authoritative sources, PASS.
5. Do **not** fail because a historical daily says glm-5.1.
6. Offline only — no provider API calls. No GLM/Anthropic network.

Optional: if WORLD_STATE Structural still says something other than GLM-5.2 as chamber structural, FAIL (should already be GLM-5.2 after SoT #2).

## Accept commands
```bash
node scripts/test-superseded-stubs.mjs
node scripts/test-model-claims-vs-config.mjs
node scripts/test-claim-guard.mjs
node scripts/test-session-startup.mjs
bash scripts/test-cursor-worker.sh   # structural ok even if live smoke PATH fails
node --check scripts/test-superseded-stubs.mjs
node --check scripts/test-model-claims-vs-config.mjs
```

## Result md must include
- files added
- authoritative sources used
- current-doc surfaces checked
- historical exclusions
- any stale claims found (fix docs only if test requires and Jason-allowed — prefer tests that pass on current tree; if tree is wrong, report FAIL without mass rewrites)
- PASS/FAIL per suite

## Hard bans
gap 3 · commit/push · openclaw.json edits · gateway · WORLD_STATE rewrites unless a test fails and a one-line doc fix is required for truth — prefer reporting FAIL to Nova rather than expanding scope. Tests should pass on current post-mem-health tree.
