# Codex brief — configurable memory_search tool timeout (PREPARE ONLY — DO NOT EXECUTE)

**Status:** PREPARED · **not dispatched** · Nova 2026-08-01 ~13:05 PDT  
**Owner if executed:** Codex (protected OpenClaw infra)  
**Chair:** Nova  
**Related workspace work (already landed):** warmup + latency probe + LIGHT 20s — see `memory/cursor-jobs/memory-search-timeout-fix-2026-08-01.md`

---

## Problem

Agent tool `memory_search` uses package hardcodes in OpenClaw memory-core tools:

- `MEMORY_SEARCH_TOOL_TIMEOUT_MS = 15e3` (15s)
- `MEMORY_SEARCH_TOOL_COOLDOWN_MS = 6e4` (60s after fail)

Evidence (2026-08-01 ~12:42 PDT main session):

- Tool: `memory_search timed out after 15s` → unavailable / “embedding/provider error”
- Same window: CLI `openclaw memory search` ~5–6s OK; ollama embed warm ~50–150ms; index full Dirty no
- After fail, 60s cooldown makes tool look broken longer than the blip

Location (installed):  
`~/.npm-global/lib/node_modules/openclaw/dist/tools-DXHLX8MK.js`  
region `extensions/memory-core/src/tools.ts`  
(`runMemorySearchToolWithDeadline`, `recordMemorySearchToolCooldown`)

There is **no** `openclaw.json` knob today under `agents.defaults.memorySearch`.

## Goal

Make the agent-tool memory search **timeout configurable** (and optionally cooldown), **defaulting to current behavior** (15s / 60s) so existing installs do not change unless configured.

## Non-goals

- Do not change embedding provider/model defaults
- Do not weaken security / do not disable memory search
- Do not require gateway rewrite of workspace scripts
- Do not auto-reindex
- Do not change Active Memory plugin timeouts (separate surface)

## Proposed design

### Config path (preferred)

Under existing memory search config, e.g.:

```json5
agents: {
  defaults: {
    memorySearch: {
      // existing fields unchanged...
      tool: {
        timeoutMs: 15000,   // default = current hardcode
        cooldownMs: 60000   // default = current hardcode; optional if scope allows
      }
    }
  }
}
```

Acceptable alternate if schema already has a tools namespace — but **prefer memorySearch** so it lives with provider/model/query.

### Runtime behavior

1. Resolve `timeoutMs` from config; fallback **15000** if missing/invalid
2. Resolve `cooldownMs` from config; fallback **60000** if missing/invalid (if included)
3. Clamp to sane bounds (suggest):
   - `timeoutMs`: min 3000, max 120000
   - `cooldownMs`: min 0, max 600000
4. Pass resolved values into `runMemorySearchToolWithDeadline({ timeoutMs })` and cooldown recorder
5. Preserve error strings shape or include actual timeout in message (current: `memory_search timed out after ${seconds}s`)
6. **Default-identical:** unset config ⇒ bit-identical timeouts to today

### Docs

- configuration reference: document `memorySearch.tool.timeoutMs` (+ cooldown if shipped)
- note: this is **agent tool** deadline, distinct from CLI `openclaw memory search` and session-startup script timeouts

## Acceptance tests

1. **Default preserve:** no config → effective timeout 15000, cooldown 60000 (unit/fixture)
2. **Config override:** `tool.timeoutMs: 30000` → deadline uses 30000; timeout error text shows 30s
3. **Invalid/out-of-range:** below min / non-number → clamp or fallback to default (pick one; test it)
4. **Cooldown override (if in scope):** `tool.cooldownMs: 0` disables cooldown; `120000` applies
5. **Integration/smoke (if harness exists):** mock slow search > timeout ⇒ unavailable + cooldown; fast search succeeds
6. **Schema:** config validate accepts new fields; unknown nested keys policy unchanged
7. **No regress:** existing memorySearch query/hybrid settings still parse

## Rollback

1. Pre-change backup of config if any local override added (none required for default)
2. Revert package/PR or pin previous openclaw version
3. Remove `memorySearch.tool` block if added to Jason’s openclaw.json
4. Gateway restart only if package replace requires it; document exact restart command
5. Evidence of rollback: `openclaw memory status` + one `memory_search` tool call OK

## Evidence requirements (before claim complete)

- Diff of source (`extensions/memory-core/src/tools.ts` + schema) and generated types if any
- Unit test exits green (list commands)
- Config schema lookup shows new fields
- Live proof on this host after install:
  - default path still works (`memory_search` returns hits, searchMs logged if available)
  - with temporary override 30000 (or test-only), slow-path behavior documented
- claim-guard clean language: no bare “fixed” without evidence paths
- Rollback artifact path recorded

## Constraints / safety

- Protected OpenClaw infra → **Codex only** (Proc 20). Nova does not patch npm package.
- Do not paste secrets
- Prefer upstream-quality change over local dirty patch of `dist/*.js` (dist-only hacks rot on update)
- If only local patch possible short-term: isolate, document wipe-on-upgrade risk, still keep defaults

## Suggested verify commands (post-implement)

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
# package tests as applicable
openclaw doctor
openclaw memory status
# agent tool path: one memory_search from a session or harness
node scripts/memory-health-probe.mjs --quick
```

## Out of scope follow-ups (optional later)

- Surface timeout/cooldown in `openclaw memory status`
- Align session-startup plugin budgets with tool timeout automatically
- Better error taxonomy: timeout vs true embed provider failure (stop masking)

## Disposition

**PREPARED ONLY.** Do not implement until Jason/Nova explicitly dispatches Codex with this brief.
