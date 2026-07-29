# Nova Error-Log Health Audit — 2026-07-28 (night)

**Auditor:** Cursor sidecar under Nova (READ + REPORT ONLY)  
**Workspace:** `/home/mrbig3/.openclaw/workspace`  
**Wall clock:** 2026-07-28 ~23:12–23:17 PDT  
**Constraint honored:** only this file written for the audit deliverable; no config edits, no service restarts, no git commits, no chmod, no fixes applied.  
**Secrets:** redacted (no tokens, keys, mnemonics, full auth headers).

---

## 0. Executive summary

- **Gateway is UP and usable:** systemd user unit `openclaw-gateway` active since **13:23:34 PDT** (pid 30025, NRestarts=0); `openclaw status` reachability **~89ms**; OpenClaw **2026.7.1-2** up to date.
- **Primary live pain is not “gateway down”** — it is **startup ritual timeout + model cache/format failures + thin fallback billing**, which trigger zai/glm failover on some dashboard sessions.
- **`[plugins] session-startup failed` is real and frequent (~67 today in NDJSON / ~68 journal):** root cause is **timeout mismatch** — plugin default **18s** (hard capped ≤30s) vs script doing **4 sequential `openclaw memory search`** that alone take **~23s**. State never marked complete → retries every `before_prompt_build`.
- **Active Memory** often times out (~12s config): today **timeout 24 / ok 17 / no_relevant_memory 17 / failed 4**; aborts cascade to “Request was aborted” + **embedded abort settle timed out (2s)**.
- **xAI primary mostly healthy** (411× HTTP 200 for grok-4.5 today) but **encrypted_content 400** (~12–14) forces fallbacks; **OpenRouter 402 insufficient credits** (~101 billing mentions; 16× HTTP 402 responses) makes first fallback hollow; **zai/glm-5.1** then carries sessions (status shows dashboard `c6602688…` on glm-5.1 fallback).
- **Tasks pressure is low** (0 queued / 0 running) but **2 parked issues:** dreaming-rem **orphaned subagent**; `nova-xai-oauth-diagnostic` CLI **403 Grok credits/subscription** (stale OAuth-path probe; distinct from working API-key grok-4.5 traffic).
- **Expected noise (not bugs):** `tools.profile (coding)` removes `agents_list, gateway, message, nodes, tts` (~123×); owner-only deny of `cron` (~56×); MEMORY.md bootstrap truncate **~30–37k > 20k limit** (~20×).
- **Browser path still broken for headed WSL:** not running; Playwright page enumeration timeouts; headed start fails with no `$DISPLAY` — matches midday fullstack audit.
- **`~/.openclaw/logs/stability/*.json` are STALE** (May–Jul 19 `XAI_API_KEY` missing / crash_loop). **Not current** — no new stability dumps today.
- **Overall:** ops stack is **working with friction**; highest ROI fixes are session-startup timeout/search parallelism, MEMORY trim or bootstrap limit, encrypted_content/session hygiene, and OpenRouter credits or fallback reorder — **none applied here**.

---

## 1. Method + commands run + log paths/sizes

### Commands / checks (representative)

| Check | Command / path |
|-------|----------------|
| Journal today | `journalctl --user -u openclaw-gateway --since "2026-07-28 00:00:00"` |
| Journal 48h | same `--since "2026-07-27 00:00:00"` (session-startup count) |
| Unit | `systemctl --user status/show openclaw-gateway` |
| CLI | `PATH=…/node/v24.18.0/bin:$PATH` → `openclaw status`, `openclaw tasks`, `openclaw tasks list --status failed --json`, `openclaw update status`, `openclaw memory search` |
| NDJSON parse | Python counter/signature pass over `/tmp/openclaw/openclaw-2026-07-{27,28}.log` |
| Plugin/source | Read `~/.openclaw/extensions/session-startup/{index.js,openclaw.plugin.json}`, `scripts/session-startup.mjs` |
| Safe reproduce | Skip-path `session-startup.mjs --json` on already-completed session key → exit 0 in 0.04s; timed 4× memory searches ≈ **23.07s** |
| Cross-check | `memory/cursor-jobs/nova-fullstack-audit-2026-07-28.md` (midday; not duplicated) |
| Logs dir | `~/.openclaw/logs/` + `stability/` |

### Log paths / sizes

| Path | Size / note |
|------|-------------|
| `/tmp/openclaw/openclaw-2026-07-28.log` | **4.3M** (~2500–2550 NDJSON lines at audit time) |
| `/tmp/openclaw/openclaw-2026-07-27.log` | **623K** (~454 lines) |
| `~/.openclaw/logs/commands.log` | 139B (stale Apr 2) |
| `~/.openclaw/logs/config-audit.jsonl` | 386K (last writes ~Jul 22–23) |
| `~/.openclaw/logs/gateway-restart.log` | 1.1K (last update restart **Jul 19**) |
| `~/.openclaw/logs/stability/*` | 20 files; newest **Jul 19** |
| `MEMORY.md` | **37121** bytes (~37k chars; inject limit 20k) |

**Note:** Full cold `session-startup.mjs` was not re-forced (writes identity/state). Failure mode inferred from plugin timeout + timed searches + repeated fails without `completedAt` for tonight’s dashboard session keys.

---

## 2. Health snapshot (gateway, update, tasks pressure)

| Item | Value | Evidence |
|------|-------|----------|
| Gateway service | **active/running** pid **30025** | `systemctl --user show` ActiveEnterTimestamp=Tue 2026-07-28 **13:23:34** PDT; NRestarts=**0** |
| Prior pid today | pid **7638** until restart ~13:23 | journal Stopped/Started at 13:23:34 |
| Reachability | local ws `127.0.0.1:18789` · **89ms** · auth token configured | `openclaw status` |
| Version / update | **2026.7.1-2 (0790d9f)** · npm · **up to date** · deps ok | `openclaw status` / `openclaw update status` |
| Agents / sessions | 1 agent · **42** sessions · default main active minutes ago | status |
| Heartbeat | 30m (main) | status |
| Tasks | **0** active · **0** queued · **0** running · **2 issues** · audit clean · 26 tracked | status / tasks |
| Memory plugin | enabled (memory-core); not deep-checked | status |
| Channel | telegram ON but SETUP / fast-status unavailable (channel historically disabled at plugin level per prior audits) | status |
| Model notes | Some dashboard sessions on **zai/glm-5.1 (auto fallback)**; one pinned openai/gpt-5.6-sol; fresh sessions on **xai/grok-4.5** | status |
| Memory pressure | WARN×2 today (heap_threshold ~11:13; rss_growth ~21:16) | NDJSON |
| Stability dumps | **stale** (no 2026-07-28 files) | `logs/stability/` |

**Verdict:** Control plane healthy. Application-layer reliability is mixed (startup timeout, AM timeouts, provider format/billing), but chat continues via failover.

---

## 3. Error taxonomy table

| ID | Severity | Category | Count/freq (2026-07-28) | First / Last seen | Symptom | Likely cause | Fixability |
|----|----------|----------|-------------------------|-------------------|---------|--------------|------------|
| E01 | **P1** | Plugin / startup | ~**67** NDJSON / ~**68** journal; ~**87** in 48h | 00:27 → 23:11 | `[plugins] session-startup failed: Command failed: …session-startup.mjs … --json` | Plugin `timeoutMs` default **18000** (max 30000); script runs 4× serial memory search (~**23s** alone) → child killed; state not completed → retry storm | **config + code** (raise timeout + parallel/cache searches; or slim ritual) |
| E02 | **P1** | Provider / xAI format | ~**12–14** decrypt 400; drives failover storms | 11:11 → 22:35 | `400 "Could not decrypt the provided encrypted_content…"` | Stale/corrupt reasoning/`encrypted_content` replay in Responses API session state | **code/human** (new session / clear broken cache; upstream payload hygiene) |
| E03 | **P1** | Provider / fallback billing | ~**16** HTTP 402; ~**44–101** billing mentions | 11:12 → 23:13 | OpenRouter `402 Insufficient credits` / FailoverError billing | First fallback `openrouter/auto` unpaid/exhausted | **human** (top up **or** reorder fallbacks) |
| E04 | **P1** | Active Memory | **timeout 24**, timeout_partial 1, failed 4 (vs ok 17) | 00:27 → 23:10 | `active-memory … status=timeout` elapsed ~11–16s; recall timed out 13500ms×3 | `timeoutMs=12000` too tight under load; aborts mid-flight | **config** (slightly higher timeout / smaller prompts) + accept as soft-fail |
| E05 | **P2** | Embedded abort | **aborted ~13**; settle timeout **~9–12** | 11:30 → 23:10 | `Request was aborted`; `embedded abort settle timed out … timeoutMs=2000` | AM/run abort after timeout; settle window short | **code/config** (align settle vs AM timeout) |
| E06 | **P2** | Bootstrap context | truncate **~20**; sizes 30437–**36823** > **20000** | 00:27 → 23:05 | MEMORY.md truncated in injected context | MEMORY grew past inject cap | **human/config** (trim MEMORY **or** raise bootstrap limit intentionally) |
| E07 | **P2** | DNS / network blip | EAI_AGAIN **14**; network FailoverError **6**; all-models-failed **3** | 13:17–15:37 (cluster) | `getaddrinfo EAI_AGAIN`; connection timeouts across providers | Transient WSL/DNS outage mid-afternoon | **ignore/park** unless recurring; monitor |
| E08 | **P2** | Browser | not-running **~11**; Playwright enum timeout **~16**; no display **~6** | 12:38–20:18 | browser doctor FAIL; headed start needs display | WSL headed Chromium not running; no DISPLAY | **human/config** (shared Windows CDP — fullstack #1) |
| E09 | **P2** | Tasks residue | **2** failed tracked | dreaming: morning; oauth diag: ~Jul 22 | dreaming-rem `orphaned subagent run (missing-session-entry)`; oauth CLI 403 credits | Dreaming cleanup orphan; OAuth/Grok sub probe ≠ API key path | **ignore/park** (or task cleanup) |
| E10 | **P2** | Auth / OAuth | xAI OAuth 403 once 17:13; cli task still failed | 17:13 / task dated older | `403 "The OAuth2 access token could not be validated."` / Grok subscription 403 | OAuth token/subscription path fragile; API key path still serving 200s | **human** (refresh OAuth if needed; don’t confuse with API-key primary) |
| E11 | **P3** | Policy noise | coding profile **123**; cron deny **56** | all day | tools removed via profile/deny | Expected `tools.profile=coding` + owner-only cron deny | **ignore** (expected) |
| E12 | **P3** | Tool UX | edit failed **4**; skill_workshop **2** | 11:18–22:37 | exact-text mismatch; description >160 bytes | Agent edit races / skill meta limit | **ignore/agent skill** |
| E13 | **P3** | Diagnostics | long-running session **~23**; memory pressure **2** | scattered | queue behind tool/model work; heap/RSS warnings | Heavy tool loops; expected under Cursor/exec load | **monitor** |
| E14 | **P3** | Historical | stability startup_failed × many | May 28 / Jun 23 / **Jul 19** | `XAI_API_KEY` missing at boot | Old secret-resolution failures | **ignore** (stale) |
| E15 | **P2** | Model fallback | fallback decisions **~49**; embedded failover **~62** | mostly post-11:11 | candidate_failed → openrouter → zai | Driven by E02+E03 | depends on E02/E03 |

Severity guide: **P0** outage/data loss now · **P1** recurring user-visible degradation · **P2** intermittent / capability gap · **P3** noise or historical.

**No P0 outage found** at audit time (gateway reachable; primary model still producing 200s on recent dashboard sessions).

---

## 4. Working well (with evidence)

1. **Gateway process longevity after 13:23 restart** — active, NRestarts=0, listening with 10 plugins including `active-memory`, `browser`, `memory-core`, `session-startup`, `xai` (journal 13:23:41).
2. **CLI control plane** — `openclaw status` / `tasks` / `update status` / `memory search` succeed on Node **v24.18.0**.
3. **xAI primary throughput** — **411** `[model-fetch] response … provider=xai … status=200` today; tonight dashboard sessions show grok-4.5 with cache hits (status table).
4. **zai/glm fallback actually works** — **157** zai HTTP 200; status documents auto-fallback selection (degraded but functional).
5. **Dreaming pipeline mostly succeeds** — light/deep narratives succeeded; promotion `applied=4, failed=0` (journal ~11:12); only rem orphan remains as task issue.
6. **Cron heartbeats** — update/security reminder crons `succeeded` in `openclaw tasks` list.
7. **Failover machinery** — format/billing failures **surface and cascade** rather than hard-locking the gateway (by design).
8. **Security posture from midday** — `openclaw.json` mode 600 / 0 critical still assumed intact (not re-audited deeply here; no config writes).
9. **Stability directory quiet** — no new `startup_failed` since Jul 19; today’s “errors” are runtime/application, not boot loops.

---

## 5. Needs fixing now (P0/P1 only) — concrete next actions

### P0
- **None.** Gateway is up; no current crash loop; no secret-loss event in today’s logs.

### P1 — do these next (recommendations only)

1. **Session-startup timeout (E01)**  
   - Evidence: `~/.openclaw/extensions/session-startup/index.js` `DEFAULT_TIMEOUT_MS=18000`; hook `timeoutMs: DEFAULT+2000`; 4× memory search timed **23.07s**; **67** fails today; tonight’s dashboard keys **absent** from `.openclaw/session-startup-state.json` completions.  
   - Next actions (pick one stack):  
     a. Raise plugin `timeoutMs` toward **30000** (schema max) **and** slim script (parallel searches / fewer queries / skip search if recent).  
     b. Or make ritual **non-blocking** / fire-and-forget with cached LIGHT summary.  
     c. Capture stderr/stdout on failure in plugin log (today only “Command failed: …argv”).

2. **encrypted_content 400 (E02)**  
   - Evidence: journal 11:11:58 + NDJSON ~12–14; drives “All models failed” when coupled with OR 402.  
   - Next actions: for afflicted sessions use `/model` reset or new dashboard session; investigate Responses API state reuse; avoid replaying damaged encrypted blocks.

3. **OpenRouter billing hole in fallback chain (E03)**  
   - Evidence: `openrouter … status=402` ×16; FailoverError billing samples from 11:12 onward; config fallbacks `openrouter/auto` then `zai/glm-5.1`.  
   - Next actions (Jason): top up OpenRouter **or** reorder fallbacks to put **zai** (or anthropic) ahead of empty OR; keep OR only if funded.

4. **Active Memory timeout rate (E04)** — if AM is relied on for ops truth  
   - Evidence: timeout **24** vs ok **17**; config `timeoutMs=12000`; abort+settle cascade.  
   - Next actions: bump AM timeout modestly (e.g. 15–20s) **or** shrink queryChars; keep Procedure 14 (“AM = untrusted cache”).

---

## 6. Noise / expected / park list

| Item | Classification | Why |
|------|----------------|-----|
| `tools.profile (coding)` removes 5 tools | **Expected policy** | Intentional coding profile |
| owner-only `tools.deny: cron` | **Expected policy** | Sender policy |
| MEMORY.md truncate warnings | **Known debt / park-or-trim** | Continuous exceedance of 20k inject cap |
| stability `startup_failed` (May–Jul 19) | **Stale park** | Historical missing `XAI_API_KEY`; not today |
| gateway-restart.log last Jul 19 | **Stale** | Informational |
| dreaming-rem orphan task | **Park / cleanup** | `orphaned subagent run (missing-session-entry)` after cleanup scrub |
| `nova-xai-oauth-diagnostic` 403 credits | **Park / human** | Old CLI probe on OAuth/Grok-sub path; primary API key path works |
| edit / skill_workshop failures | **Agent UX noise** | Exact-match edit races; 160-byte description cap |
| long-running session diagnostics | **Expected under tool load** | Cursor/exec behind queue |
| telegram SETUP in fast status | **Parked channel** | Prefer webchat; prior audits |
| openrouter 402 after intentional empty wallet | **Park until Jason funds or reorders** | Fallback design issue until then |
| FF SSL / SOI / NIGHT | **Jason do-not-nag** | Outside this audit |

---

## 7. Tool-failure deep dive

### Policy removals (not failures)

- **`tools.profile (coding)`:** removes `agents_list`, `gateway`, `message`, `nodes`, `tts` — **123×** today. Expected.
- **Owner-only deny:** removes `cron` — **56×**. Expected.

### Actual tool errors (`[tools] … failed`)

| Tool | Count | Sample / cause |
|------|-------|----------------|
| `edit` | 4 | WORLD_STATE.md / procedural-memory exact-text mismatch or non-unique match |
| `skill_workshop` | 2 | description **196 > 160** bytes on memory-efficiency-pass proposal revise |

No broad deny storms beyond coding profile. No evidence of systemic `exec`/`process` tool crashes in the sampled error set (long-running notes show tools completing under queue pressure).

### Timeouts affecting tools / browser

- **Playwright page enumeration timed out after 3000ms** (~8–16 events, afternoon ~17:21–17:38) while browser stack strained.
- **Headed browser start** rejected: no `$DISPLAY` / `$WAYLAND_DISPLAY` (~6).
- **xAI TTS** fetch timeouts (`https://api.x.ai/v1/tts`) appear in journal; `tts` already removed by coding profile for agents — often background/voice path.

### Provider-shaped “tool” failures

- Failovers recorded as lane task `FailoverError` rather than tool failures — see §8.

---

## 8. Model/provider reliability

Default chain (config): **`xai/grok-4.5` → `openrouter/auto` → `zai/glm-5.1` → `anthropic/claude-opus-4-8`**.

### Today’s HTTP response tally (model-fetch response lines)

| Provider | 200 | Non-200 notable |
|----------|-----|-----------------|
| **xai** | **411** | **400**×12 (decrypt); **403**×1 (OAuth validate fail ~17:13) |
| **zai** | **157** | **429**×2 |
| **openrouter** | (few success counted in response filter) | **402**×16 |
| **anthropic** | low volume | **400**×2 |

### Qualitative

| Provider | Reliability today | Notes |
|----------|-------------------|-------|
| **xai (API key / grok-4.5)** | **Good majority** | Primary workhorse; fails via abort (AM) or encrypted_content format |
| **xai OAuth / Grok sub** | **Fragile / parked** | Separate 403 credits on diagnostic task; OAuth validate error once |
| **openrouter** | **Broken as fallback** | Billing empty → wasted failover hop |
| **zai/glm-5.1** | **Good rescue** | Carries sessions after OR fails; some AM timeouts on zai too |
| **anthropic** | **Sparse** | Last-resort; involved in all-models-failed during DNS blip |

### Coupling failure mode (important)

When **E02 (decrypt 400)** hits, chain tries OpenRouter → immediately **E03 (402)** → lands on **zai**. User sees model switch / latency; continuity preserved if zai healthy. When DNS fails (**E07**), **all four** can die together (observed 15:37).

---

## 9. Session-startup plugin failure analysis

### What runs

Plugin `~/.openclaw/extensions/session-startup/index.js` on `before_prompt_build` for eligible **direct/webchat** main sessions executes:

```text
node scripts/session-startup.mjs --workspace … --session-key … --session-id … --agent-id main --json
```

with `execFile` **timeout = config.timeoutMs** (default **18000**, schema max **30000**). Hook itself timed at **20000** (`DEFAULT_TIMEOUT_MS + 2000`). Config entry is only `{ "enabled": true }` → defaults apply.

### Script cost

`scripts/session-startup.mjs` loads startup files, optional identity append, then **4 sequential** `openclaw memory search --json --max-results 3` (each individual search timeout 12s). Timed tonight:

- 4 searches serial ≈ **23.07s**  
- Skip path (already completed) ≈ **0.04s**, exit **0**

### Why logs show perpetual failure

1. Child killed at **~18s** → Node `execFile` error message `Command failed: …argv` (stderr of script often empty / not logged).  
2. Catch block only logs warn; **no `completedAt` written**.  
3. Next user turn → eligible again → another 18s attempt → same fail (**retry storm**).  
4. Journal samples tonight: dashboard `0147d4b2…` and `8ab83eaf…` repeatedly 22:27–23:11.

### Safe reproduce commands

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"

# A) Skip path (safe; no identity write if completedAt exists)
node ~/.openclaw/workspace/scripts/session-startup.mjs \
  --workspace ~/.openclaw/workspace \
  --session-key 'agent:main:dashboard:<KNOWN_COMPLETED>' \
  --session-id '<KNOWN_COMPLETED>' \
  --agent-id main --json
# Observed: {"skipped":true,"reason":"already_completed_for_session",…} exit 0

# B) Cost probe (read-only searches)
time openclaw memory search --json --max-results 3 "current active projects"
# …repeat 3 other LIGHT queries; sum ~23s
```

**Do not** `--force` cold runs casually during audit windows (appends identity / writes state).

### Recommended fix shape (not applied)

- Parallelize or reduce LIGHT queries; cache results for N minutes.  
- Set `plugins.entries.session-startup.config.timeoutMs` to **30000** as interim.  
- Log `error.stderr` / timed-out flag explicitly.  
- Optionally skip dreaming/subagent session keys more aggressively (some morning dreaming keys also logged fails).

---

## 10. Comparison vs midday fullstack audit

Source: `memory/cursor-jobs/nova-fullstack-audit-2026-07-28.md` (stack/SoT/browser/meters; not a journal taxonomy).

| Topic | Midday fullstack | Tonight error-log audit | Status |
|-------|------------------|-------------------------|--------|
| Gateway reachable / version | Assumed healthy | **Confirmed** active since 13:23; update ok | Still good |
| Browser not running / shared CDP wishlist | **P1** | Reconfirmed (doctor patterns, no DISPLAY, Playwright timeouts) | **Still open** |
| Cursor Node PATH footgun | **P1** | This job used nvm 24.18 explicitly; still a footgun if forgotten | **Still open** |
| SoT omits WORLD_STATE / meter 0.80 vs 0.60 | **P0 docs** | Not re-litigated; not an error-log fault | **Still open** (docs) |
| MEMORY size / bootstrap | Noted ~36K | **Live truncate events 30–37k > 20k**; file now **37121 B** | **Worse / still open** |
| Active Memory | ON; smoke pending | **High timeout rate** with abort settle | **New quantified** |
| session-startup plugin | “Present” only | **Chronic timeout failure** (~67×) | **New P1 finding** |
| OpenRouter credits | Mentioned historically | **Systematic 402 hole in fallback** | **Still open / clearer** |
| encrypted_content 400 | Not featured | **Recurring format fail → failover** | **New P1** |
| stability/*.json | Not focus | Confirmed **stale Jul 19** | Park |
| Tasks 2 issues | Seeded by Nova | Verified (orphan rem + oauth 403) | Confirmed |
| Security openclaw.json 600 | Patched midday | Not reopened | Assumed ok |

**Net new vs midday:** session-startup timeout storm, AM timeout quantification, encrypted_content format chain, OpenRouter empty-fallback cost made first-class.

---

## 11. Recommended fix order (max 7) — NO auto-apply

1. **Fix session-startup timing** — raise plugin timeout to 30s *and* cut script wall-clock (parallel/cache LIGHT searches). Verify: no new `session-startup failed` for 1h of dashboard turns; state gains `completedAt` for new session keys.
2. **Repair fallback chain** — fund OpenRouter **or** reorder to `xai → zai → anthropic` (Jason call). Verify: no 402 hop in `model fallback decision` lines.
3. **Sanitize encrypted_content sessions** — rotate/new session for stuck dashboard threads; watch decrypt 400 count drop. Verify: `rg 'encrypted_content' /tmp/openclaw/openclaw-$(date +%F).log` near-zero.
4. **Retune Active Memory** — modest timeout bump / smaller queries; keep untrusted-cache policy. Verify: timeout share &lt; ~25% of AM `done` events.
5. **Trim or re-budget MEMORY.md bootstrap** — target &lt;20k inject **or** conscious limit raise. Verify: truncate warnings stop.
6. **Browser path (from fullstack)** — Windows CDP shared profile pilot; don’t force headed WSL without display. Verify: `openclaw browser doctor` running true on chosen profile.
7. **Task hygiene** — clear/park orphan dreaming-rem + stale oauth diagnostic issue rows after human confirm. Verify: `openclaw tasks` issues → 0.

---

## 12. Appendix: top 20 raw error signatures (redacted)

Counts from `/tmp/openclaw/openclaw-2026-07-28.log` interesting-line pass (normalized; secrets stripped). Model-fetch **start** lines omitted as non-errors.

| # | ~Count | Signature (redacted) |
|---|--------|----------------------|
| 1 | 123 | `tool policy removed 5 tool(s) via tools.profile (coding): agents_list, gateway, message, nodes, tts` |
| 2 | 67 | `session-startup failed: Command failed: …/node …/scripts/session-startup.mjs … --json` |
| 3 | 62 | `embedded run failover decision` |
| 4 | 56 | `tool policy removed 1 tool(s) via gateway sender owner-only tools.deny: cron; matched cron` |
| 5 | 49 | `model fallback decision` |
| 6 | 28 | `active-memory: … done status=timeout elapsedMs=<N> summaryChars=0` (+ timeout_partial) |
| 7 | 20 | `workspace bootstrap file MEMORY.md is <N> chars (limit 20000); truncating in injected context` |
| 8 | 16 | `Playwright page enumeration timed out after 3000ms` / browser.request UNAVAILABLE |
| 9 | 14 | `400 "Could not decrypt the provided encrypted_content. Ensure the value is the unmodified encrypted_content from a previous response."` |
| 10 | 14 | `getaddrinfo EAI_AGAIN …` (xai/openrouter/zai/anthropic) |
| 11 | 13 | `[responses] error … provider=xai … message=Request was aborted` |
| 12 | 12 | `fetch timeout reached; aborting operation` (incl. TTS / SSR guard) |
| 13 | 11 | `FAIL browser: not running; run \`openclaw browser start\`` / `running: false` |
| 14 | 9 | `embedded abort settle timed out: … timeoutMs=2000` |
| 15 | ~16–44 | OpenRouter billing / `402 Insufficient credits` / FailoverError billing text |
| 16 | 6 | `Headed browser start requested … no Linux display server was detected` |
| 17 | 6 | `auth profile failure state updated` |
| 18 | 6 | `FailoverError: LLM request failed: network connection error.` |
| 19 | 4 | `[tools] edit failed: Could not find the exact text …` / non-unique match |
| 20 | 3 | `Embedded agent failed before reply: All models failed (4): …` (decrypt+402 and/or DNS) |

### Extra seed verifications

| Nova pre-scan seed | Verified? |
|--------------------|-----------|
| session-startup failed dashboard tonight | **Yes** (0147d4b2…, 8ab83eaf…) |
| active-memory ~12s timeout; xai aborted; settle timeout | **Yes** |
| tools.profile coding removes 5 tools | **Yes** (123×) |
| MEMORY truncated 36823 > 20000 | **Yes** (3× exactly 36823; other sizes also) |
| tasks: dreaming-rem failed; oauth diagnostic 403 credits | **Yes** (JSON errors captured) |
| status: glm-5.1 fallback sessions; gateway reachable | **Yes** |
| stability/*.json older May–Jul 19 | **Yes** — **stale vs current** |

### Failed task detail (redacted)

```json
{
  "taskId": "ae1652bd-622d-4641-ad56-b6229fe2e8e4",
  "runtime": "subagent",
  "childSessionKey": "agent:main:dreaming-narrative-rem-1e752300e123",
  "status": "failed",
  "error": "orphaned subagent run (missing-session-entry)"
}
```

```json
{
  "taskId": "926b6a3d-c6a0-4747-8c54-86819104298b",
  "runtime": "cli",
  "task": "Reply with exactly: NOVA_XAI_TEST_OK",
  "status": "failed",
  "error": "FailoverError: 403 \"You have run out of credits or need a Grok subscription. …\""
}
```

---

## Closing

**Working:** gateway, updates, primary xAI 200-path, zai rescue, most dreaming/cron, CLI.  
**Broken / degrading:** session-startup timeout storm, AM timeout/abort cascade, encrypted_content → empty OpenRouter hop, browser headed/CDP path, MEMORY inject truncation.  
**Park:** stale stability dumps, oauth diagnostic credit task, policy removal noise, Jason do-not-nag sites.

**NO FIXES APPLIED**
