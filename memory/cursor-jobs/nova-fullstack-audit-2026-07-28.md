# Nova Full-Stack Audit — 2026-07-28

**Auditor:** Cursor sidecar under Nova (read-only)  
**Workspace:** `/home/mrbig3/.openclaw/workspace`  
**Scope:** operational stack inconsistencies, consolidation, harness health, shared-browser wishlist  
**Constraint honored:** only this file written; no config/governance/memory rewrites; no git commit/push  
**Method note:** Observation = filesystem/config/cli evidence. Inference = judgment labeled as such.

---

## 0. Executive summary

- Harness Layer A/B is real and useful (Active Memory, claim ledger, retrieval eval, Procedure 14) — **do not dismantle**.
- Biggest trust risk is **meter storytelling**: MEMORY top entry still markets filtered hit@3 **0.80** (manual 10-fact), while automated 15-fact runner reports filtered hit@3 **0.60** (`retrieval-eval-report-20260728-1230.md`).
- `AGENTS.md` Source-of-Truth map **omits `WORLD_STATE.md`**, while Procedure 14 / memory-efficiency skill treat it as ops-first truth — structural conflict.
- Browser plugin is enabled but **managed Chromium is not running**; doctor says start `openclaw browser start`. Shared Jason+Nova browsing is the largest capability gap for RE/dApp/ops.
- Nested `nova-training-docs/` + `quorra-training-docs/` are gitlinks + gitignored clones; live workspace *is* the `nova-training-docs` remote — high confusion risk for “which AGENTS/MEMORY is live.”
- Five overlapping browser stacks + four self-improvement / autonomy skill families create load noise; skill-diet inventory already soft-parks most — enforce diet, don’t mass-delete.
- Dream corpus (~2M dreaming + 2.5M `.dreams` + 72K `DREAMS.md`) still dominates raw retrieval; agent-side filter works when followed, engine path-exclude still unavailable.
- Security posture improved today (openclaw.json **600**, 0 critical) but blast radius remains high: `tools.exec.ask=off`, `tools.fs.workspaceOnly=false`, `gateway.controlUi.allowInsecureAuth=true`.
- Cursor PATH defaults to Cursor’s Node **v24.5.0**, which **cannot run** OpenClaw CLI (needs ≥24.15); gateway uses nvm **v24.18.0** — sidecar/CLI footgun.
- Stale/low-activity trees: `projects/kalshi-bot`, `research/steipete-agent-scripts`, `fractal-fuzion-10k` (shelved) — archive candidates, not deletes.
- **#1 shared-browser recommendation:** OpenClaw remote CDP attach to a dedicated Windows Chrome profile (Jason sees+controls UI; Nova drives via CDP) — not Browser.cash, not five Playwright skill forks.
- Next 30 days should be **small**: SoT fix, meter honesty, browser pilot, skill diet enforcement, nested-repo labeling — not embodiment, not memory-layer collapse, not mass skill deletes.

---

## 1. Stack map (what exists and what it's for)

| Layer | Path / component | Job |
|-------|------------------|-----|
| Identity | `SOUL.md`, `IDENTITY.md`, `USER.md` | Who Nova is; who Jason is |
| Startup / ops law | `AGENTS.md`, `HEARTBEAT.md`, `.cursor/rules/nova-sidecar.mdc` | Ritual, gates, worker constraints |
| Live ops picture | `WORLD_STATE.md` | Fires / listings / waiting / NOW |
| Durable memory | `MEMORY.md` (~493 lines) | Curated long-term |
| Episodic | `memory/YYYY-MM-DD.md` | Daily trail |
| Procedures | `memory/procedural-memory-v1.md` (procs 1–14; §13 after §14) | How to repeat work |
| Retrieval policy | `memory/memory-retrieval-policy-v1.md` | Ops-first + dream filter |
| Verification | `claim-ledger.md`, `observed-failures.md`, `harness-scorecard.md`, `retrieval-eval-set-v1.md` | Anti-fooling meters |
| Runtime | `~/.openclaw/openclaw.json` (mode 600), gateway `:18789` | Models, plugins, tools, browser |
| Sidecar | `scripts/cursor-worker.sh`, `TOOLS.md` Cursor section | Nova → Cursor engineering worker |
| Skills (workspace) | `skills/*` (27 SKILL.md trees) | Local capability packs |
| Skills (stock/config) | OpenClaw stock + `skills.entries` disables | Many macOS/IoT skills already disabled |
| Nested archives | `nova-training-docs/`, `quorra-training-docs/` | Reference / novel / Quorra history (not live SoT) |
| Dreaming | `memory/dreaming/**`, `memory/.dreams/**`, `DREAMS.md` | Narrative consolidation — noise for ops search |
| Projects | `projects/kalshi-bot`, `fractal-*`, `research/` | Mostly stale / shelved vs WORLD_STATE |

**Runtime snapshot (redacted):**
- Default model: `xai/grok-4.5` (fallbacks openrouter/auto, zai/glm-5.1, anthropic/claude-opus-4-8)
- Subagents: `zai/glm-5.1`, thinking low, timeout 600s, maxConcurrent 3, delegationMode suggest
- memorySearch: ollama `nomic-embed-text`; hybrid 0.55/0.45; MMR λ0.75; temporalDecay 14d; minScore 0.38
- Plugins allowlist includes: anthropic, browser, canvas, codex, file-transfer, lossless-claw, memory-core, memory-wiki, active-memory, openai, openrouter, session-startup, telegram, xai, zai
- Browser config top-level: `headless=false`, `noSandbox=true`, `attachOnly=false`; doctor profile `openclaw` CDP port **18800**, Chromium detected at `/usr/bin/chromium-browser`, **not running**

---

## 2. Source-of-truth map & conflicts

### Declared (AGENTS.md)

1. Direct observation  
2. `AGENTS.md`  
3. `procedural-memory-v1.md`  
4. `MEMORY.md`  
5. daily notes  
6. Möbius ledgers  
7. archives  

### Declared (Procedure 14 / memory-efficiency skill)

Ops queries → **`WORLD_STATE.md` + today/yesterday first**, then search; treat AM as untrusted cache; drop dreaming/DREAMS/candidates/eval-self.

### Conflicts (observation)

| Conflict | Why it matters |
|----------|----------------|
| `WORLD_STATE.md` missing from AGENTS SoT list | Agents following only AGENTS can prefer stale MEMORY/dailies over live fires |
| Nested `nova-training-docs/AGENTS.md` vs root `AGENTS.md` | Different startup authority text; nested says “use root AGENTS” but still looks like a second home |
| Workspace git remote = `nova-training-docs` **and** nested gitlink of same name | Easy to edit/commit the wrong tree |
| MEMORY meter claims vs automated eval report | “0.80 filtered” can be repeated as current truth after stricter 15-fact run shows 0.60 |
| Active Memory vs filesystem | Already caught 7/28: AM claimed SI overdue / WORLD_STATE ~8d stale — claim-ledger **rejected** |

**Inference:** Promote `WORLD_STATE.md` to explicit SoT tier immediately under direct observation for *current ops*, without demoting AGENTS for *rules*.

---

## 3. Inconsistencies

| ID | Severity | Finding | Evidence | Fix |
|----|----------|---------|----------|-----|
| I01 | P0 | SoT map omits WORLD_STATE; ops procedures require it first | `AGENTS.md` §Source-of-Truth; `procedural-memory-v1.md` §14; `skills/memory-efficiency-pass/SKILL.md` | Add WORLD_STATE as ops-tier #1 under observation; cross-link Procedure 14 |
| I02 | P0 | Meter drift: “filtered 0.80” vs automated filtered 0.60 | `MEMORY.md` top 7/28 entry; `harness-scorecard.md` midday vs 12:30 rows; `retrieval-eval-report-20260728-1230.md` | Label meters by **runner + N facts**; MEMORY should cite latest automated as canonical or say “manual 10-fact legacy” |
| I03 | P1 | Procedure numbering: §14 then §13 | `procedural-memory-v1.md` headings order | Renumber / reorder for scanability (no behavior change) |
| I04 | P1 | Nested training clones vs live workspace dual identity | git remote root = `badbios420/nova-training-docs`; gitlinks `160000` for nested dirs; `.gitignore` lists same paths; nested AGENTS ≠ root AGENTS | Document “root = live; nested = reference clones”; avoid reading nested for startup |
| I05 | P1 | Cursor shell Node v24.5.0 blocks `openclaw` CLI | `openclaw --version` fails on default PATH; works with nvm `v24.18.0` (gateway uses that) | Fix `cursor-worker.sh` / TOOLS.md PATH to prefer nvm 24.18+ before Cursor node |
| I06 | P1 | Browser plugin healthy, browser process down | `browser-doctor-pre-audit.txt`; live `openclaw browser doctor` → FAIL not running; CDP 18800 | Start managed browser **or** switch to Windows remote attach profile for shared use |
| I07 | P1 | Skill-diet says soft-park playwright forks; workspace still ships 5 browser skill trees | `skill-diet-inventory-2026-07-28.md`; `skills/{clawbrowser,browser-cash,playwright-mcp,browser-automation-stealth,playwright-scraper-skill}` | Keep diet as policy; optional hard-disable remaining duplicates in `skills.entries` (Jason OK) |
| I08 | P1 | Eval-set self-hits still poison scoring | 1230 report: F08/F09/F11/F14/F15 top raw often `retrieval-eval-set-v1.md` | Runner already filters; ensure agents never treat eval-set as gold memory |
| I09 | P2 | HEARTBEAT still lists Vista license-era habits in older dailies; live WORLD_STATE closed | `memory/2026-07-27.md` open issues vs `WORLD_STATE.md` closed rows | Prefer WORLD_STATE; leave historical dailies alone (no backfill) |
| I10 | P2 | IDENTITY/MEMORY wallet ADA counts may stale | `IDENTITY.md` “157 ADA”; not re-verified this audit | On next wallet touch, verify on-chain before repeating balances |
| I11 | P2 | plugins.allow includes `telegram` + `codex` while telegram channel disabled / codex-supervisor disabled in list | `openclaw.json` allow; `openclaw plugins list` | Cleanup allowlist on next explicit config pass (backup first) |

---

## 4. Consolidation candidates

| Item | Action | Rationale | Risk if wrong |
|------|--------|-----------|---------------|
| `WORLD_STATE` + AGENTS SoT | **merge (docs only)** | Single ops truth ladder | Low if text-only |
| Browser skills (5) | **keep** OpenClaw browser plugin + optionally clawbrowser; **archive/soft-park** stealth/mcp/scraper/cash | Overlap; diet already says so | Medium if a stealth path was uniquely needed |
| SI skills: `self-improvement-review` vs `recursive-self-improve` vs `ai-self-review` | **keep** SI-review as default; **soft-park** others | HEARTBEAT already points at SI-review | Low |
| Autonomy: `agent-autonomy` vs `agent-autonomy-kit` vs `agent-dev-toolkit` | **soft-park / archive** kits; don’t delete | Generic kits vs Nova-specific harness | Low |
| Nested `nova-training-docs/` | **keep as reference**; do not treat as live | Nested HEAD ≠ workspace HEAD; novel/chapter content lives there | High if deleted |
| Nested `quorra-training-docs/` (86M) | **archive-in-place** (label only) | Historical Quorra corpus; not Nova SoT | High if deleted |
| `memory/dreaming/**` + `DREAMS.md` | **keep** for consolidation; **never** ops-rank | Filter already required | High if deleted (loses narrative continuity) |
| `projects/kalshi-bot` | **archive-candidate** | Last touch ~7/7; WORLD_STATE doesn’t list as active | Low |
| `research/steipete-agent-scripts` | **archive-candidate** | Upstream research clone; not ops | Low |
| `fractal-fuzion-10k` + NFT research md | **keep shelved** | WORLD_STATE: after RE income | Medium if purged |
| Meter docs (MEMORY vs scorecard vs eval report) | **merge narrative** | One canonical latest scoreboard row | Low |
| Dead scripts? | **keep** `retrieval-eval*`, `session-startup`, `cursor-worker`, `protected-settings-guard`, `dreaming-audit`, `sync-training-repos` | All still purposeful | — |

Prefer **archive/label** over delete everywhere.

---

## 5. Harness health

| Subsystem | Status | Evidence | Gap |
|-----------|--------|----------|-----|
| Multi-layer memory | Healthy by design | Efficiency skill + 7/28 decision: do not collapse layers | Enforce ops-first mechanically in prompts |
| Retrieval meters | Mixed | Manual filtered 0.80 (10); automated filtered 0.60 (15) | Canonicalize automated runner; category ops still ~0.50 |
| Dream noise | Controlled only if filter applied | Raw still dream-heavy (F01/F02/F09 patterns) | No engine path-exclude |
| Active Memory | ON + tightened | config strict/220/12s; plugins list enabled | UI `/verbose` smoke still pending; stale-summary hygiene needed |
| Claim ledger | In use | Recent verified/rejected rows 7/28 | Continue for ops claims |
| Procedures 1–14 | Strong | Rate-limit identity, Scout→Worker→Verifier, eval cadence | Reorder 13/14; AM/subagent live smokes open |
| Identity noise | Fixed | ≤1 auto/day; 173 condensed 7/27 | Keep filesystem SoT for identity appends |
| Dreaming size | Modest disk, high retrieval weight | dreaming ~2.0M (187 files); `.dreams` 2.5M; DREAMS 72K | Policy > deletion |
| Session startup plugin | Present | `scripts/session-startup.mjs` (~340 lines); plugin allowlisted | — |
| Continuity holes | Accepted | Missing dailies 7/23, 7/25, 7/26 — no fabricated backfill | Correct policy |

**Observation:** Layer A/B delivered real controls.  
**Inference:** Next harness wins are **discipline + browser**, not more layers.

---

## 6. Skills & tooling diet

### Workspace skills (27) — 1-line purpose

| Skill | Purpose |
|-------|---------|
| agent-autonomy | Generic persistent memory / identity / network autonomy kit |
| agent-autonomy-kit | “Stop waiting; keep working” proactive kit |
| agent-dev-toolkit | Meta toolkit (builder/browser/wallet/docs) |
| agent-proxy-guardian | RPC/VPN rotation for geo/rate limits |
| ai-self-review | Broad self-improve / swarm / RAG level-up |
| browser-automation-stealth | Stealth Playwright wrapper |
| browser-cash | Hosted anti-bot browser sessions (Browser.cash) |
| cardano | ADA tx / staking / UTxO assist |
| cardano-mastery | Deeper Cardano research/build |
| clawbrowser | Playwright CLI browser control |
| github | `gh` CLI workflows |
| memory-efficiency-pass | Ops-first + dream filter + honest meters |
| mia-twitter-stealth | X/Twitter stealth automation |
| playwright-mcp | Playwright via MCP server |
| playwright-scraper-skill | Scrape with anti-bot tiers |
| qualia-philosophy | Consciousness/philosophy exploration |
| recursive-self-improve | Growth-loop / pattern hunt |
| self-improvement-review | Weekly SI review → proposals only |
| wallet-pilot | Browser wallet automation |
| xai-voice | xAI STT realtime voice |

### Overlap clusters
1. **Browser:** OpenClaw plugin + clawbrowser + playwright-mcp + stealth + scraper + browser-cash (+ wallet-pilot for dApps)  
2. **Self-improve:** SI-review + recursive + ai-self-review  
3. **Autonomy kits:** agent-autonomy + kit + agent-dev-toolkit  

### Config diet already done
Many stock skills disabled in `skills.entries` (apple-*, sonos, hue, notion, trello, playwright-mcp, etc.). Workspace clones of soft-parked skills still sit on disk — fine if not loaded.

### Scripts inventory
| Script | Purpose |
|--------|---------|
| `cursor-worker.sh` | Nova → Cursor agent launcher |
| `session-startup.mjs` | Startup ritual + identity rate-limit |
| `retrieval-eval.mjs` + `lib/` + tests | Live retrieval meters |
| `protected-settings-guard.mjs` (+ test) | Guard protected settings |
| `dreaming-audit.py` | Read-only dream metrics |
| `sync-training-repos.sh` | Non-destructive sync of nested training clones |

---

## 7. Security & blast radius (high level; no secret values)

**Good (observed):**
- `~/.openclaw/openclaw.json` mode **600** after 7/28 CRIT patch; deep audit reported 0 critical (heartbeat notes)
- Wallet secrets gitignored (`*.enc`, key paths)
- Sidecar rule forbids wallet/openclaw.json/governance unless task says so
- Telegram channel disabled; webchat-only preference noted in HEARTBEAT

**Elevated blast radius (observed):**
- `tools.exec.security=full` + `ask=off` — shell can run without interactive ask
- `tools.fs.workspaceOnly=false` — filesystem tool not confined to workspace
- `gateway.controlUi.allowInsecureAuth=true` — accepted local warn
- `browser.noSandbox=true` — Chromium sandbox off
- Credentials dir exists under `~/.openclaw/credentials` (not opened this audit)
- Multiple config backups beside live json — good for recovery, ensure perms stay tight

**Do not:** dump keys, open `*.enc`, or widen gateway bind without Jason.

---

## 8. Shared browser wishlist (Jason + Nova)

### Current state
| Path | State |
|------|-------|
| OpenClaw `browser` plugin | **Enabled**; control endpoint OK |
| Managed profile `openclaw` | CDP `127.0.0.1:18800`; Chromium detected; **not running** |
| Config | `headless=false`, `attachOnly=false`, `noSandbox=true` — local managed intent |
| clawbrowser | Playwright CLI skill present; good for agent-only scripts, weak for “Jason watches” |
| playwright-mcp | Present in workspace; **disabled** in `skills.entries` |
| browser-cash / stealth / scraper | Soft-park / high-power; Browser.cash needs API key + is remote hosted (not shared desktop) |
| wallet-pilot | dApp wallet automation — needs a real shared browser underneath |

Pre-audit capture: `memory/cursor-jobs/browser-doctor-pre-audit.txt` matches live doctor (gateway OK, browser not running, 3 profiles configured).

### Options compared (WSL2 Gateway + Windows host)

| Option | Shared visibility | Control | Fit | Notes |
|--------|-------------------|---------|-----|-------|
| **A. OpenClaw managed Chromium in WSL** | Poor (Jason on Windows doesn’t see WSL GUI easily) | Nova-strong | Weak for pair ops | Current default path; doctor suggests `openclaw browser start` |
| **B. Windows Chrome/Edge + remote CDP attachOnly** | **Excellent** (Jason sees the real window) | Both (Jason mouse + Nova CDP) | **Best** | Documented OpenClaw pattern for WSL2↔Windows |
| C. Playwright shared user-data profile | Medium | Agent-strong | OK for automation | Session files; Jason visibility unless headed on Windows |
| D. Browser.cash hosted | None shared locally | Nova-only | Scraping/anti-bot | Not a family shared desktop; approval-gated |
| E. noVNC / full remote desktop | Excellent | Both | Heavy | Extra moving parts; overkill if CDP works |
| F. Existing-session Chrome MCP driver | Good on same host | Both | Partial | Docs: Chrome MCP is host-local, **not** WSL→Windows bridge |

### Recommended architecture (#1): **Option B — OpenClaw remote CDP → dedicated Windows Chrome profile**

**Why #1:**
1. Matches Jason’s actual setup (WSL2 gateway + Windows daily browser).
2. Both can see the same tabs; Jason can take over instantly (trust + RE listing sites + wallet connect).
3. First-party OpenClaw support + troubleshooting docs for this exact topology.
4. Avoids multiplying Playwright skill stacks and avoids sending session cookies to a hosted Browser.cash fleet for everyday work.

**Target shape (conceptual — do not apply in this audit):**
- Windows: launch a **dedicated** Chrome profile (not daily personal) with `--remote-debugging-port=9222` (or chosen port).
- Ensure WSL can `curl http://<windows-reachable-ip>:9222/json/version` → 200.
- OpenClaw profile e.g. `shared` / `remote`: `cdpUrl` to that endpoint, `attachOnly: true`.
- Keep a separate `openclaw` managed profile for headless/agent-only chores.
- Jason uses normal Chrome UI; Nova uses `openclaw browser * --browser-profile shared`.

### Security gates
- Jason approval before any login, payment, wallet connect, email send, or social post.
- **Dedicated Chrome user-data-dir** for agent-shared work — never attach to Jason’s primary profile with banking/password manager unlocked.
- No password dumping into chat/memory; prefer Jason types secrets.
- Nova narrates intent + URL before destructive clicks; screenshot/evidence after.
- Spend caps for wallet-pilot; no autonomous ad spend (already MEMORY policy).
- Keep CDP bound to host firewall / portproxy carefully; do not expose 9222 to LAN casually.
- Separate profiles: `personal` (Jason only), `shared-ops` (Jason+Nova), `automation` (ephemeral).

### Phased plan
| Phase | Goal | Exit criteria |
|-------|------|---------------|
| **P0 research spike** (≤2h) | Prove WSL→Windows CDP reachability; pick IP/portproxy; list gotchas from OpenClaw WSL2 docs | `curl /json/version` + `json/list` from WSL OK |
| **P1 pilot** | Config remote `attachOnly` profile; open example.com; Jason watches Nova navigate + fill a harmless form | doctor/status running true; mutual takeover works |
| **P2 daily driver** | Use for eBay listing assist, Hilltop MLS checks, approved dApp flows via wallet-pilot on shared profile | Checklist in TOOLS.md; skill-diet points here; other browser skills stay parked |

---

## 9. Recommended additions (full stack) — ranked, tied to pain

| Rank | Addition | Pain relieved | Effort | Risk |
|------|----------|---------------|--------|------|
| 1 | Shared Windows CDP browser profile + TOOLS.md runbook | Blind browser / pair-ops gap | M | Med (session security) |
| 2 | AGENTS SoT patch: WORLD_STATE ops tier | Stale fires / AM conflicts | S | Low |
| 3 | Meter canon: scorecard “latest automated” row only in MEMORY blurbs | Trust/metric theater | S | Low |
| 4 | `cursor-worker.sh` Node PATH pin to nvm ≥24.15 | Sidecar can’t run openclaw/doctor/eval | S | Low |
| 5 | Hard skill denies for soft-parked browser forks (optional) | Accidental stealth/cash use | S | Low |
| 6 | Live smokes: AM `/verbose` + one `sessions_spawn` | Layer A still config-only | S | Low |
| 7 | Nested-repo README banner: “REFERENCE ONLY” | Dual AGENTS confusion | S | Low |
| 8 | Eval gold hardening for F04 address / F09 FBN ops paths | hit@3 floor | S–M | Low |
| 9 | Optional dream index quarantine (if OpenClaw gains path-exclude) | Raw dream pollution | M | Med (wait for feature) |
| 10 | Archive label for kalshi/steipete trees | Cognitive clutter | S | Low |

---

## 10. 30-day improvement plan (week-by-week, small)

### Week 1 (trust + SoT)
- Patch AGENTS SoT to include WORLD_STATE ops tier (Jason OK).
- Rewrite MEMORY meter sentence to dual-report or defer to scorecard latest automated.
- Pin Node PATH for Cursor worker; verify `openclaw browser doctor` from sidecar.
- eBay escalate remains Jason-owned (cash) — Nova only prep checklist if asked.

### Week 2 (shared browser P0→P1)
- Research spike: Windows Chrome debug port + WSL curl.
- Pilot remote attachOnly profile; document in TOOLS.md.
- One harmless co-browse session (Jason present).

### Week 3 (diet + smokes)
- Enforce skill diet in practice; optional `skills.entries` disables for stealth/mcp/scraper.
- AM verbose smoke + one cheap subagent spawn; log to claim-ledger.
- Re-run `retrieval-eval.mjs` full; update scorecard only.

### Week 4 (hygiene)
- Label nested training dirs REFERENCE ONLY; confirm sync script still non-destructive.
- Archive-candidate note for kalshi-bot / steipete research (no delete).
- SI review due ~8/3 — proposals only, no governance auto-apply.
- Revisit open-fire ages (Hilltop path / eBay) from WORLD_STATE, not dreams.

---

## 11. Explicit non-goals / do-not-do list

- Do **not** collapse memory layers into one megafile.
- Do **not** delete dreaming corpus or DREAMS.md to “fix retrieval.”
- Do **not** mass-delete skills; soft-park / disable only.
- Do **not** delete nested `quorra-training-docs` / `nova-training-docs` clones.
- Do **not** rewrite `openclaw.json` in drive-by audits (backup + Jason intent required).
- Do **not** touch wallet secrets, `*.enc`, `credentials/`, mnemonics.
- Do **not** fabricate gap-day dailies (7/23, 7/25, 7/26).
- Do **not** chase parked items (FF SSL, SOI, NIGHT buy) against Jason’s do-not-nag.
- Do **not** start embodiment / Optimus work (MEMORY: harness first).
- Do **not** treat Browser.cash as the default shared desktop.
- Do **not** attach CDP to Jason’s primary Chrome profile with password manager unlocked.
- Do **not** git commit/push from sidecar unless Jason explicitly asks.
- Do **not** claim retrieval “fixed” when only filtered routing improved.

---

## 12. Appendix

### Commands / checks run (representative)
- `git status`, `git log -5`, `git remote -v`, `git ls-files -s` on nested training paths
- `du -sh` on memory, skills, dreaming, training clones, fractal, projects, research
- `rg` for SoT / browser / hit@3 claims
- Python redacted parse of `~/.openclaw/openclaw.json`
- `openclaw --version` / `plugins list` / `browser doctor` / `browser status` via **nvm Node v24.18.0**
- Read of core ops files, skill SKILL.md heads, eval report 1230, browser-doctor-pre-audit
- Web/docs check: OpenClaw WSL2 + Windows remote CDP troubleshooting

### File sizes (approx)
| Path | Size |
|------|------|
| workspace total | ~145M |
| `memory/` | ~13M |
| `skills/` | ~16M |
| `memory/dreaming` | ~2.0M (187 files) |
| `memory/.dreams` | ~2.5M |
| `DREAMS.md` | ~72K |
| `MEMORY.md` | ~36K |
| `quorra-training-docs/` | ~86M |
| `nova-training-docs/` (nested) | ~1.5M |
| `fractal-fuzion-10k/` | ~6.7M |
| `research/` | ~3.1M |
| `projects/` | ~52K |
| `openclaw.json` | ~19.5K, mode 600 |

### Plugins (enabled subset; redacted)
From `openclaw plugins list` (14/72 enabled), including: **active-memory**, **anthropic**, **browser**, **canvas**, **file-transfer**, plus providers/memory-core/memory-wiki/lossless-claw/session-startup/xai/zai/openai/openrouter as allowlisted. **telegram** channel disabled. Codex supervisor appears disabled in list despite allowlist entry named `codex`.

### Browser doctor (live)
```
OK gateway: browser control endpoint reachable
OK plugin: enabled
OK profile: openclaw (cdp)
FAIL browser: not running; run `openclaw browser start`
OK profiles: 3 configured
profile openclaw: cdpPort 18800, detected chromium /usr/bin/chromium-browser, running false
```

### Retrieval health citation
- Canonical automated: `memory/cursor-jobs/retrieval-eval-report-20260728-1230.md`  
  - raw hit@3 **0.53** · filtered hit@3 **0.60** (15 facts)
- Legacy manual midday: filtered hit@3 **0.80** (10 facts) — keep as historical experiment, not sole headline

### Git
- HEAD: `e538a64` (stamp on lock-in `e18f1a1`)
- Remote: `https://github.com/badbios420/nova-training-docs.git`
- Nested gitlinks present; dirty tree pre-existed this job (many memory/harness edits + untracked cursor-jobs)

### Observation vs inference (meta)
- **Observation-heavy:** config, doctor, sizes, meter files, skill list, SoT omission, Node mismatch  
- **Inference-heavy:** shared-browser #1 ranking; 30-day sequencing; archive candidates for kalshi/steipete  

---

*End of audit. No other files modified by design.*
