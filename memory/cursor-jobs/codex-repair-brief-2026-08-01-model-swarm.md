# CODEX REPAIR BRIEF — Model Catalog + Swarm Default
**Date:** 2026-08-01 ~00:35 PDT  
**From:** Nova (Architect / Auditor / Test Coordinator ONLY)  
**Owner of all config/filesystem changes:** Codex  
**Nova must NOT:** edit openclaw.json, restart gateway, touch auth, aliases, plugins, catalogs, defaults.

---

## 1. Observed facts (read-only inspection just now)

### Config (`~/.openclaw/openclaw.json`, 23583 bytes)
- **Brain:** `agents.defaults.model.primary` = `xai/grok-4.5`  
  fallbacks: `openrouter/auto`, `zai/glm-5.1`, `anthropic/claude-opus-4-8`
- **Subagent default:** `agents.defaults.subagents.model` = `deepseek/deepseek-v4-flash`  
  thinking=low, runTimeoutSeconds=600, maxConcurrent=3, delegationMode=suggest
- **Providers present:** xai, ollama, perplexity, zai, anthropic, **deepseek**
- **DeepSeek catalog:** PRESENT under `models.providers.deepseek` (ids include `deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-chat`, `deepseek-reasoner`)
- **Aliases:**
  - `xai/grok-4.5` → alias **`grok`** (likely why Control UI shows only “Grok” not “Grok 4.5”)
  - `deepseek/deepseek-v4-flash` → `DeepSeek`
  - `deepseek/deepseek-v4-pro` → `DeepSeek-Pro`
  - `zai/glm-5.2` → `GLM-5.2`
  - `zai/glm-5.1` → `GLM`
- **xAI catalog model names:** includes **“Grok 4.5”** for id `grok-4.5` (name exists; UI may prefer alias)
- **Auth profiles (ids only):** openrouter:default, zai:default, anthropic:default, xai:jason@…, openai:…, deepseek:default
- **Plugin:** deepseek enabled; plugins.allow includes deepseek
- **Gateway:** running (pid observed ~99037), probe ok, version 2026.7.1-2
- **Doctor:** completed; no plugin errors; notes browser headless/DISPLAY, TaskFlow blocked item (pre-existing)

### Backups (already on disk)
- `memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-pre-subagent-deepseek` (20932 B) — pre default flip to DeepSeek
- `memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-pre-deepseek-catalog` (23583 B) — around catalog add

### Runtime evidence CONFLICT (critical)
| Test | Claimed / tool meta | Actual runtime evidence |
|------|---------------------|-------------------------|
| Chamber #10 explicit `model=deepseek/deepseek-v4-flash` (earlier night) | accepted | **Worked** (real DeepSeek reports) |
| Explicit `zai/glm-5.1` / `zai/glm-5.2` after key rotate | accepted | **Worked** (ZAI_SMOKE_OK) |
| Default subagent smoke **no model override** after setting subagents.model=deepseek… | tool result said `resolvedModel=deepseek/deepseek-v4-flash`, `modelApplied=true` | **Child + logs used xai/grok-4.5** (`LINE1: provider=xai` / `LINE2: model=grok-4.5`; gateway logs model-fetch provider=xai) |

**Label:** UNVERIFIED that default swarm path actually runs DeepSeek.  
Config text + modelApplied are **insufficient**. Must prove with provider-transport logs / runtime metadata.

### Nova process failures tonight (discipline)
1. Changed `agents.defaults.subagents.model` to DeepSeek before catalog/allowlist verified.
2. Restarted gateway mid-session; smoke results conflicted.
3. Continued fix attempts while state unclear.
4. Wrote `memory/cursor-jobs/fix-deepseek-swarm-default.py` (Codex may use as **untrusted draft only**).

### Cursor GPT-5.3 architecture audit (workspace)
- **No evidence** in `memory/cursor-jobs/` of a GPT-5.3 architecture write for this swarm work tonight.
- Recent cursor-jobs are C1–C8 harness jobs (7/28–7/31), not a new swarm architecture pack.
- Architecture artifacts present are **Nova chamber/research**, not Cursor:
  - `memory/chambers/chamber-10-*.md`
  - `memory/research-2026-07-31-subagent-architecture.md`
  - `memory/cursor-jobs/fix-deepseek-swarm-default.py` (Nova draft fix script)
- Treat all of the above as **untrusted draft** until Codex reviews. Do not auto-delete.

---

## 2. Target architecture (Jason-locked)

### Main / Chair
- Nova main = **xai/grok-4.5** (exact valid ID from catalog)
- Only boss that synthesizes + promotes

### Swarm workers
- Default subagent model = **newest working DeepSeek Flash**  
  Candidate ID: `deepseek/deepseek-v4-flash` (verify before keeping)
- Isolated context; **no** email/send, spend, wallet, secrets, protected config, gateway restart, self-promotion

### Chamber (explicit per-spawn; not default)
1. DeepSeek Flash (`deepseek/deepseek-v4-flash` if proven)
2. GLM-5.2 (`zai/glm-5.2`)
3. Grok 4.5 (`xai/grok-4.5`)
- Chair Nova synthesizes three independent reports

### UI
- Control UI must show a clearly named **Grok 4.5** entry (not only generic “Grok” if that hides identity)
- Investigate alias `grok` on `xai/grok-4.5` as primary hypothesis for dropdown label

---

## 3. Hypotheses (ordered)

**H1 (primary):** Default subagent model resolution still falls back to parent/caller (Grok) despite config string; need runtime path fix (allowlist shape, session stickiness, invalid resolution, or gateway not loading expected fields).

**H2:** Alias `grok` causes Control UI to display “Grok” instead of “Grok 4.5” even though catalog name is correct.

**H3:** DeepSeek works on **explicit** spawn but fails on **default** path (different code paths).

**H4:** Stale session/UI catalog cache after config edits.

**H5:** Duplicate/conflicting xAI entries or model list ordering.

Do **not** remove providers/auth/models unless proven stale, duplicated, invalid, **and** safe.

---

## 4. Codex objectives

1. Restore/confirm Grok 4.5 as valid explicitly named model in OpenClaw + Control UI.
2. Explain UI “Grok” vs “Grok 4.5” with evidence.
3. Properly register newest working DeepSeek Flash (if anything still missing).
4. Make DeepSeek Flash **default swarm/subagent** only after **direct execution proof**.
5. Preserve GLM-5.2 for chamber.
6. Audit Cursor GPT-5.3 / Nova draft artifacts listed above (review, don’t auto-delete).
7. Backup + exact rollback for every modification.
8. No secrets in any report.

### Acceptance tests (all required; runtime evidence not prose)
1. Config parses successfully  
2. `openclaw doctor` no **new** blocking error  
3. Gateway remains running/reachable  
4. Control UI catalog contains clearly named **Grok 4.5**  
5. Explicit Grok 4.5 test: requested vs actual from runtime evidence  
6. Explicit GLM-5.2 test: requested vs actual  
7. Explicit DeepSeek Flash test: requested vs actual  
8. **Default** subagent spawn (no model override) actually runs DeepSeek Flash  
9. **Three concurrent** default swarm workers actually run DeepSeek Flash  
10. Chamber can launch Flash + GLM-5.2 + Grok 4.5 seats explicitly  
11. No silent fallback to main Grok on those tests  
12. Evidence from logs/provider metadata, not model self-report alone  
13. Final diff of exactly what changed  
14. Rollback procedure tested or mechanically validated  
15. No secrets leaked  

### Evidence sources to prefer
- Gateway logs: `provider-transport-fetch` lines with provider= and model=
- Tool spawn result fields only as secondary; must match logs
- `openclaw config get` / parsed json readback
- Doctor output

### Rollback baselines
```bash
# Prefer most recent known-good before tonight's thrash if DeepSeek default must be undone:
cp -a memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-pre-subagent-deepseek ~/.openclaw/openclaw.json
# Catalog-era backup:
# cp -a memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-pre-deepseek-catalog ~/.openclaw/openclaw.json
```
Codex must refine rollback after its own backup.

### Constraints
- Do not spend money / wallet
- Do not print API keys
- Minimize gateway restarts; if restart required, document why + verify up
- Nova will run final auditor pass after Codex report

---

## 5. Deliverables from Codex
Write to:
- `memory/cursor-jobs/codex-repair-report-2026-08-01-model-swarm.md`

Include: facts, changes, diff summary, test matrix with PASS/FAIL + evidence paths, remaining failures, rollback command.

---

## 6. Out of scope
- Building full swarm-boss.mjs playbook
- MEMORY.md promotions
- Chamber content beyond model seating smoke
- OpenRouter ladder work
