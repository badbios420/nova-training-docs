# Codex Repair Report — Model Catalog + Swarm Default

**Date:** 2026-08-01  
**Scope:** Narrowed steer: Grok 4.5 dropdown, three explicit runtime proofs, default-subagent runtime proof, report/rollback.  
**Secret handling:** No API keys, tokens, credential values, or auth-store contents are included.

## Outcome

The four narrowed blockers pass with runtime evidence.

- Control UI label root cause: **alias**, not model ID, provider catalog, or runtime fallback.
- Explicit `xai/grok-4.5`: actual transport `provider=xai model=grok-4.5`, HTTP 200.
- Explicit `zai/glm-5.2`: actual transport `provider=zai model=glm-5.2`, HTTP 200.
- Explicit `deepseek/deepseek-v4-flash`: actual transport `provider=deepseek model=deepseek-v4-flash`, HTTP 200.
- No-override subagent: actual child transport and transcript metadata are `provider=deepseek model=deepseek-v4-flash`, HTTP 200. There was no silent fallback to Grok in the current runtime.

## Root cause

### Control UI “Grok” vs “Grok 4.5”

The gateway catalog already had the correct canonical identity:

```text
provider=xai
id=grok-4.5
name=Grok 4.5
alias=grok
available=true
```

The installed Control UI label function selects `alias` before `name`:

```js
function Tl(e){return e.alias?.trim()||e.name.trim()}
```

Evidence: `/home/mrbig3/.npm-global/lib/node_modules/openclaw/dist/control-ui/assets/index-Bvtt7vVx.js:1987`.

Therefore the dropdown rendered the generic alias `grok` even though the provider catalog name and canonical ID were correct. This is an **alias-label issue**. It is not a provider-catalog omission and not a model fallback.

The alias was changed to `Grok 4.5`. Live `models.list` readback then returned:

```text
provider=xai id=grok-4.5 name=Grok 4.5 alias=Grok 4.5 available=true
```

Because the UI uses the alias first, the effective dropdown label is now **Grok 4.5**. A browser with an already-open catalog may require an ordinary page refresh, but the live gateway catalog is updated.

### Earlier default-subagent conflict

The earlier Grok result is not reproducible in the current runtime. The current resolver, child session record, child transcript metadata, and provider transport all agree on DeepSeek Flash for a spawn with no model override. The exact earlier cause cannot be proven retrospectively from the current run; stale session/config runtime state remains plausible. No resolver or provider-catalog code change was required.

## Files changed

### Repair change

- `/home/mrbig3/.openclaw/openclaw.json`
  - Changed only the alias for `xai/grok-4.5` from `grok` to `Grok 4.5`.
  - Main model remains `xai/grok-4.5`.
  - Default subagent remains `deepseek/deepseek-v4-flash`.
  - DeepSeek and GLM-5.2 catalogs/aliases were preserved.

### Report

- `memory/cursor-jobs/codex-repair-report-2026-08-01-model-swarm.md`

No gateway restart, auth change, provider removal, plugin change, catalog rewrite, or fallback-ladder change was performed.

## Redacted exact diff

```diff
 "xai/grok-4.5": {
-  "alias": "grok"
+  "alias": "Grok 4.5"
 }
```

No secret-bearing lines are adjacent to or included in the diff.

## Runtime proof matrix

| Blocker | Requested | Actual runtime evidence | Result |
|---|---|---|---|
| Grok 4.5 dropdown | Clearly named Grok 4.5 | Gateway `models.list`: `xai/grok-4.5`, `name=Grok 4.5`, `alias=Grok 4.5`, available; UI code uses `alias || name` | **PASS** |
| Explicit Grok | `xai/grok-4.5` | Child transcript metadata: `provider=xai`, `model=grok-4.5`, text `CHAMBER_GROK45_OK`; transport returned HTTP 200 | **PASS** |
| Explicit GLM-5.2 | `zai/glm-5.2` | Child transcript metadata: `provider=zai`, `model=glm-5.2`, text `CHAMBER_GLM52_OK`; transport returned HTTP 200 | **PASS** |
| Explicit DeepSeek Flash | `deepseek/deepseek-v4-flash` | Child transcript metadata: `provider=deepseek`, `model=deepseek-v4-flash`, text `CHAMBER_FLASH_OK`; transport returned HTTP 200 | **PASS** |
| Default subagent, no override | no `model` argument | Child session and transcript: `provider=deepseek`, `model=deepseek-v4-flash`, text `DEFAULT_CHILD_OK`; DeepSeek transport returned HTTP 200 | **PASS** |
| Silent fallback check | Requested must equal actual | All explicit child transcript provider/model pairs match requests; default child matches configured DeepSeek default | **PASS** |

## Evidence paths

### Provider transport log

`/tmp/openclaw/openclaw-2026-08-01.log`

- Default no-override child: lines 539–546. Lines 540/542 and 545/546 show DeepSeek Flash request/response transport with status 200. The xAI line in the same trace is the Grok parent/chair, not the child; the child session key at line 539 is explicitly bound to DeepSeek.
- Explicit chamber seats: lines 652–690.
  - DeepSeek: lines 659–660 and 669–671.
  - GLM-5.2: lines 662–664 and 679/690.
  - Grok 4.5: lines 667–668 and subsequent xAI request/response lines.

### Child transcript runtime metadata

Each cited assistant record is line 6 and records the API, provider, model, and exact smoke response:

- Default no-override child: `/home/mrbig3/.openclaw/agents/main/sessions/7a30da57-2261-481f-9817-7931f557677b.jsonl:6`
- Explicit DeepSeek: `/home/mrbig3/.openclaw/agents/main/sessions/49102dc0-49b9-4b06-8c60-d3e82b2fbee6.jsonl:6`
- Explicit Grok 4.5: `/home/mrbig3/.openclaw/agents/main/sessions/abc2b493-a1f9-47dd-8a2b-8295260477b5.jsonl:6`
- Explicit GLM-5.2: `/home/mrbig3/.openclaw/agents/main/sessions/df2caa29-0924-4e19-82ff-08b3d046af4d.jsonl:6`

### Parsed config/runtime readback

```text
agents.defaults.model.primary = xai/grok-4.5
agents.defaults.subagents.model = deepseek/deepseek-v4-flash
agents.defaults.models[xai/grok-4.5].alias = Grok 4.5
config validation = valid
gateway runtime = running, PID 99037
gateway connectivity probe = ok
```

The gateway PID was 99037 before and after the change, proving no restart occurred.

## Backup and rollback

Fresh pre-repair backup:

```text
memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-0039-codex-pre-repair
SHA-256: 6c2ec3070a2f1517b532f23bc481442221af8082a2c3a8bc520cba4c1656a4fc
mode: 600
```

Exact rollback of the Codex alias change:

```bash
cp -a /home/mrbig3/.openclaw/workspace/memory/cursor-jobs/backups/openclaw.json.bak.2026-08-01-0039-codex-pre-repair /home/mrbig3/.openclaw/openclaw.json
openclaw config validate
openclaw gateway status
```

Mechanical validation: the backup parses as JSON, contains main `xai/grok-4.5`, default subagent `deepseek/deepseek-v4-flash`, and prior alias `grok`; its hash matches the recorded baseline. It is also byte-identical to `openclaw.json.bak.2026-08-01-pre-deepseek-catalog` as found during this run.

## Remaining failures / limitations

- The historical reason the earlier no-override child ran Grok is not conclusively recoverable. Current direct runtime proof shows the configured default path executing DeepSeek Flash.
- An already-open browser may retain old catalog state until refresh; the live gateway `models.list` response is correct.
- Per the narrowed steer, unrelated warnings and nonessential audits were not pursued.

## Final disposition

All four narrowed blockers are complete with provider/runtime evidence. No optional work remains in scope for this run.
