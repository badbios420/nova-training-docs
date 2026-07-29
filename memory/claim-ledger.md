# Claim Ledger v0

**Purpose:** Make non-trivial operational claims checkable by default.  
**Rule:** Banned words (`done`, `fixed`, `verified`, `clean`, `working`, `pushed`, `live`, `shipped`) require a ledger row **or** inline proof in the same message.

## Format
```
### YYYY-MM-DD — short title
- CLAIM: ...
- STATUS: asserted | verified | rejected | pending
- EVIDENCE: file / cmd / url / tx / plugin list
- CHECKED: ISO or local time
- NOTES: optional
```

---

### 2026-07-27 — Layer A: Active Memory enabled
- CLAIM: `active-memory` plugin is enabled for main + direct chats
- STATUS: verified
- EVIDENCE: `openclaw config validate` → valid; `openclaw plugins list` shows Active Memory **enabled**; `plugins.allow` includes `active-memory`; entry config agents=`["main"]`, allowedChatTypes=`["direct"]`, modelFallback=`zai/glm-5.1`
- CHECKED: 2026-07-27 23:01–23:05 PDT
- NOTES: Backup at `~/.openclaw/openclaw.json.bak.2026-07-27-layer-a`. Hot-reload category for plugin entries; conversational smoke still recommended via `/verbose on` in a fresh direct turn.

### 2026-07-27 — Layer A: Subagent defaults configured
- CLAIM: cheap worker defaults exist under `agents.defaults.subagents`
- STATUS: verified
- EVIDENCE: live `openclaw.json` readback: model=`zai/glm-5.1`, thinking=`low`, runTimeoutSeconds=`600`, maxConcurrent=`3`, delegationMode=`suggest`; config validate OK
- CHECKED: 2026-07-27 23:01–23:05 PDT
- NOTES: Spawn smoke not yet run this turn (optional follow-up).

### 2026-07-27 — Layer A: Identity auto-check rate-limit hardened
- CLAIM: automatic identity-substrate appends are limited to ≤1/day with filesystem as source of truth
- STATUS: verified (code path)
- EVIDENCE: `scripts/session-startup.mjs` `maybeLogIdentityCheck` now skips when (1) state date matches today OR (2) identity file already contains today's Automatic Startup heading; returns reason codes
- CHECKED: 2026-07-27 ~23:05 PDT
- NOTES: Symptom condensation of 173 spam rows was earlier same day. Source race was multi-session startups ignoring stale/incomplete state.

### 2026-07-27 — Layer A research file present
- CLAIM: top-agent harness research written
- STATUS: verified
- EVIDENCE: `memory/research-2026-07-27-top-agent-harness.md` exists (written this session)
- CHECKED: 2026-07-27 23:05 PDT

### 2026-07-28 — FBN clear (Jason)
- CLAIM: FBN already published; Jason in clear; paper sends proof
- STATUS: verified (human authority)
- EVIDENCE: Jason direct statement 2026-07-28 ~00:27 PDT; WORLD_STATE updated
- CHECKED: 2026-07-28 00:28 PDT

### 2026-07-28 — Hilltop price path (Jason)
- CLAIM: −$10k so far; another −$5k; −$5k/week until sells; smell + dirty tenants
- STATUS: verified (human authority)
- EVIDENCE: Jason direct 7/28; WORLD_STATE listing row updated (exact MLS $ still TBD)
- CHECKED: 2026-07-28 00:28 PDT

### 2026-07-28 — Retrieval baseline scored
- CLAIM: hit@1=0.60 hit@3=0.60 on 10-fact eval set
- STATUS: verified
- EVIDENCE: live memory_search runs logged in `memory/harness-scorecard.md`
- CHECKED: 2026-07-28 ~00:35 PDT

### 2026-07-28 — openclaw.json perms CRIT patched
- CLAIM: config file mode fixed 664 → 600; deep audit now 0 critical
- STATUS: verified
- EVIDENCE: heartbeat 11:12 PDT; `stat` mode 600 on `~/.openclaw/openclaw.json`; re-audit 0 critical · 7 warn
- CHECKED: 2026-07-28 11:12–11:17 PDT

### 2026-07-28 — Active Memory housekeeping note is stale
- CLAIM: AM injected summary claiming SI overdue since ~7/15 and WORLD_STATE ~8d stale is **false as of live check**
- STATUS: rejected (stale recall)
- EVIDENCE: SI last 2026-07-27 18:13 (due ~8/3); WORLD_STATE mtime 7/28 00:30 then light-stamped 11:18; FBN closed 7/28; eBay age 7d
- CHECKED: 2026-07-28 11:17 PDT
- NOTES: Prefer filesystem + heartbeat-state over AM plugin blurbs when they conflict.

### 2026-07-28 — Memory efficiency pass
- CLAIM: Retrieval efficiency improved to filtered hit@3 ≥ 0.80 without removing memory layers; raw index still dream-noisy
- STATUS: verified (filtered meter) / partial (raw index)
- EVIDENCE: backup `~/.openclaw/openclaw.json.bak.2026-07-28-memory-efficiency`; `openclaw config validate` OK; memorySearch hybrid/MMR/temporalDecay + AM strict written; live 10-query remeasure logged in harness-scorecard + retrieval-eval-set; policy Procedure 14 added
- CHECKED: 2026-07-28 ~11:40 PDT
- NOTES: OpenClaw has no memorySearch path-exclude; agent filter is enforced control. F09 FBN still fails raw search — ops-first WORLD_STATE required.
