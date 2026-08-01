# CODEX BRIEF — Wire GPT-5.6 as Chamber Skeptic Seat Only

**Date:** 2026-08-01  
**Requester:** Jason (via Nova)  
**Owner of config/filesystem changes:** Codex  
**Nova role:** architecture already decided; will audit evidence after  

---

## Goal

Make **one** OpenAI GPT-5.6-class model usable as an **explicit chamber Skeptic seat** in OpenClaw.

This is **not** a swarm default change.  
This is **not** a brain/default-model change.  
GPT must **never** synthesize or chair.

---

## Locked architecture (do not renegotiate)

```
Jason
  └─ Nova Chair = xai/grok-4.5  (only synthesizer / promote-reject)
       ├─ Structural = zai/glm-5.2
       ├─ Skeptic    = openai/<VERIFIED_GPT_5_6_ID>   ← wire this
       └─ Alternative= deepseek/deepseek-v4-flash
```

Escalation:
- Tier 1: DeepSeek swarm only (already live; do not touch)
- Tier 2: Chamber seats above → Nova synthesizes
- Tier 3: extra reviewers only for high stakes

Swarm default stays: `deepseek/deepseek-v4-flash`  
Main brain stays: `xai/grok-4.5`

---

## Current observed blockers (verify, don’t assume stale)

1. `agents.defaults.models` allowlist does **not** include GPT-5.6 ids → overrides fail with:
   `Model override "openai/…" is not allowed for agent "main"`.
2. Live `models.list` currently shows no gpt-5.6\* entries.
3. `models.providers.openai` GPT catalog may be missing even though:
   - plugin `openai` is enabled
   - auth profile `openai:jasontbethurum@gmail.com` (OAuth) exists
4. Docs (OpenClaw openai provider) recognize:
   - `openai/gpt-5.6-sol` (preferred for Codex/OAuth)
   - `openai/gpt-5.6-terra`
   - `openai/gpt-5.6-luna`
   - bare `openai/gpt-5.6` (API-key Sol alias)
5. Prior doctor warning: OpenAI OAuth may be expiring — re-auth only if smoke fails for auth reasons.

---

## Required work (minimal)

### A) Discover exact usable model ID
- Run account-aware discovery, e.g.:
  - `openclaw models list --provider openai` (or equivalent that works on this install)
  - gateway `models.list` before/after allowlist
- Prefer first that is **actually available** to this account:
  1. `openai/gpt-5.6-sol`
  2. `openai/gpt-5.6-terra` / `openai/gpt-5.6-luna`
  3. `openai/gpt-5.6`
  4. Only if none: `openai/gpt-5.5` as temporary skeptic (document as fallback)

### B) Backup before any config write
```bash
cp -a ~/.openclaw/openclaw.json \
  /home/mrbig3/.openclaw/workspace/memory/cursor-jobs/backups/openclaw.json.bak.$(date +%Y-%m-%d-%H%M)-pre-gpt-skeptic
sha256sum that backup
```

### C) Minimal config changes only
1. Ensure OpenAI model is **allowlisted** under `agents.defaults.models` so main agent can override to it for chamber spawns.
2. Add a clear alias, e.g. `GPT-Skeptic` or `GPT-5.6` → exact id.
3. If provider catalog entry is required for resolution, add **only** the verified model(s) — no drive-by catalog rewrites.
4. **Do not** change:
   - `agents.defaults.model.primary` (must remain `xai/grok-4.5`)
   - `agents.defaults.subagents.model` (must remain `deepseek/deepseek-v4-flash`)
   - fallback ladder
   - plugins beyond what’s required for openai models to resolve
5. Prefer **no gateway restart** unless required; if restart, prove PID change + recover reachability.

### D) Runtime proof (mandatory — not model prose)
Spawn/run explicit model override with a one-line smoke:
- prompt: `Reply exactly: GPT_SKEPTIC_OK`
- Prove from **transcript metadata and/or provider-transport logs**:
  - requested model id
  - actual `provider` + `model`
  - HTTP 200 / success
- Fail if silent fallback to `xai/grok-4.5` or any non-OpenAI provider.

### E) Chamber seat note (docs only, small)
Update **one** working note (not a big redesign):
- `docs/chamber-protocol-v0.1.md` seat table **or**
- `memory/chambers/chamber-seat-map-v1.md` (create if cleaner)

Record:
| Seat | Model ID | Role |
| Chair | xai/grok-4.5 | synthesize only |
| Structural | zai/glm-5.2 | architecture |
| Skeptic | <verified openai id> | flaws/security/failure modes; never synthesize |
| Alternative | deepseek/deepseek-v4-flash | cheap independent path |

### F) Report
Write:
`memory/cursor-jobs/codex-report-gpt-skeptic-chamber-2026-08-01.md`

Include:
- exact model id chosen and why
- files changed
- redacted diff
- backup path + sha256
- rollback command
- runtime evidence paths (session jsonl line / gateway log)
- remaining failures (auth expiry, missing tier access, etc.)

---

## Acceptance tests (all required)

1. Config parses / validates  
2. Gateway remains reachable  
3. Main brain still `xai/grok-4.5`  
4. Swarm default still `deepseek/deepseek-v4-flash`  
5. Explicit spawn with verified GPT id returns `GPT_SKEPTIC_OK`  
6. Runtime metadata/logs show OpenAI GPT id — **no silent Grok fallback**  
7. Model appears allowlisted for agent main overrides  
8. Chamber seat map documents Skeptic = that id  
9. Rollback command mechanically valid  
10. No secrets in report  

## Out of scope
- 3-concurrent swarm retests  
- Doctor cleanup / telegram / TaskFlow  
- Making GPT swarm default or chair  
- OpenRouter ladder  
- MEMORY.md promotions  
- Broad UI audits  

## Rollback template
```bash
cp -a <BACKUP_PATH> ~/.openclaw/openclaw.json
openclaw config validate
openclaw gateway status
```

When done, stop.
