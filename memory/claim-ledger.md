# Claim Ledger v0

**Purpose:** Make non-trivial operational claims checkable by default.  
**Rule:** Banned words (`done`, `fixed`, `verified`, `clean`, `working`, `pushed`, `live`, `shipped`) require a ledger row **or** inline proof in the same message.

**Security note (2026-07-28):** `openclaw.json` permissions critical patch — mode **664→600**; re-audit **0 critical**.

### 2026-07-29 — C1 Nova Task Suite v0
- CLAIM: Nova Task Suite v0 shipped and grades live workspace 10/10; unit tests 11/11
- STATUS: verified
- EVIDENCE: `node scripts/test-nova-task-grade.mjs` exit 0; `node scripts/nova-task-grade.mjs --json` passRate 1; files under `memory/evals/` + `scripts/nova-task-grade.mjs`; scorecard hook; job report `memory/cursor-jobs/c1-nova-task-suite-v0-2026-07-29.md`
- CHECKED: 2026-07-29 ~20:04 PDT
- NOTES: Outcome meter (filesystem), not retrieval. Next alpha job C2 when Jason says go.

### 2026-07-29 — C2 Claim Guard
- CLAIM: claim-guard mechanical lint shipped; unit 13/13; dirty fails; clean+policy pass; live soft scan 0 violations on MEMORY+ledger+WORLD_STATE+procedural
- STATUS: verified
- EVIDENCE: `node scripts/test-claim-guard.mjs` exit 0; fixture exits dirty=1 clean=0 policy=0; `node scripts/claim-guard.mjs --soft MEMORY.md memory/claim-ledger.md WORLD_STATE.md memory/procedural-memory-v1.md` → 0 viol / 88 cleared; Procedure 9+11 hooks; scorecard C2 section; report `memory/cursor-jobs/c2-claim-guard-2026-07-29.md`
- CHECKED: 2026-07-29 ~20:11 PDT
- NOTES: Precision-first; STATUS:verified alone does not clear. Next C4 memory health when Jason says go.

### 2026-07-29 — C4 Memory Health Probe
- CLAIM: memory-health-probe shipped; unit 11/11; live overall PASS including search smoke (8 hits); Procedure 16 + recovery doc live
- STATUS: verified
- EVIDENCE: `node scripts/test-memory-health.mjs` exit 0; `node scripts/memory-health-probe.mjs` overall PASS exit 0; report `memory/cursor-jobs/memory-health-20260729-2018.md`; job `memory/cursor-jobs/c4-memory-health-probe-2026-07-29.md`; recovery `memory/evals/memory-health-recovery-v0.md`
- CHECKED: 2026-07-29 ~20:18 PDT
- NOTES: Infra meter only. Tool-path flake still possible if probe green — trust probe/CLI over empty tool error. Next C3.

### 2026-07-29 — C3 Retrieval Residual Attack
- CLAIM: filtered retrieval hit@3 raised from 0.60 → **0.87** on full 15-fact automated suite; stretch ≥0.80 met; residual F09+F11 only
- STATUS: verified
- EVIDENCE: `node scripts/test-retrieval-eval.mjs` 15/15; `node scripts/retrieval-eval.mjs` report `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md` (filt 12/15 hit@1, 13/15 hit@3); job `memory/cursor-jobs/c3-retrieval-residual-2026-07-29.md`; eval set at `docs/harness/retrieval-eval-set-v1.md`; config maxResults 24 bak `openclaw.json.bak.2026-07-29-c3-retrieval`
- CHECKED: 2026-07-29 ~20:49 PDT
- NOTES: Not score theater — F09/F11 left as honest misses. Main lever = remove eval-set self-hit pollution + depth 24 + fact cards + filter.

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

### 2026-07-30 — C5 Trajectory Closeout CLI
- CLAIM: trajectory-closeout CLI shipped; unit 10/10; Procedure 13 one-command; live append + scorecard touch
- STATUS: verified
- EVIDENCE: `node scripts/test-trajectory-closeout.mjs` exit 0; `node scripts/trajectory-closeout.mjs` append exit 0; entry in `memory/trajectory-log.md`; scorecard section 2026-07-30; job `memory/cursor-jobs/c5-trajectory-closeout-2026-07-30.md`
- CHECKED: 2026-07-30 ~00:08 PDT
- NOTES: Nova-direct by design (Jason your call). Next C6 verifier skill workshop proposal.

### 2026-07-30 — C6 Verifier Pass skill proposal
- CLAIM: Skill Workshop proposal `verifier-pass-v1` created and pending (not applied); id verifier-pass-v1-20260730-de97704f5f
- STATUS: verified
- EVIDENCE: skill_workshop create → pending; path `~/.openclaw/skill-workshop/proposals/verifier-pass-v1-20260730-de97704f5f`; job `memory/cursor-jobs/c6-verifier-pass-skill-2026-07-30.md`
- CHECKED: 2026-07-30 ~00:10 PDT
- NOTES: Superseded same night by apply row below.

### 2026-07-30 — Late session lock-in (Möbius + research + cal)
- CLAIM: Porch-first lock-in complete; consolidation written; Grok 4.6 calendar event created; research working files on disk; **no** research claims promoted to MEMORY.md; git pushed
- STATUS: verified
- EVIDENCE: porch append 01:30; `memory/session-consolidation-2026-07-30-late-lockin.md`; cal id `jc9jn2h759aodts3mrkpaici78`; research paths under `memory/research-2026-07-30-*.md`; ebay prep `memory/ebay-cash-bridge-prep-v0.md`; git `0e5cb96` == `origin/master`
- CHECKED: 2026-07-30 ~01:32 PDT
- NOTES: Excluded oauth JSON, training nested, dream bulk, cursor .log noise.

### 2026-07-30 — C6 Verifier Pass skill APPLIED
- CLAIM: `verifier-pass-v1` live at `skills/verifier-pass-v1/SKILL.md` after Jason delegated your-call
- STATUS: verified
- EVIDENCE: `openclaw skills workshop apply verifier-pass-v1-20260730-de97704f5f` exit 0; workshop list **applied**; file 8050B; skill_workshop tool path expired without decision — CLI succeeded
- CHECKED: 2026-07-30 ~00:17 PDT
- NOTES: Night stop after apply. C7 not started.
