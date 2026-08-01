# MEMORY.md — Durable long-term (inject-slim)

> Inject budget target ≤18KB. Full archive: `memory/MEMORY-archive-pre-2026-07-29-inject-trim.md`
> Backup: `memory/cursor-jobs/backups/MEMORY.md.bak.2026-07-29-pre-inject-trim`
> Live ops NOW: `WORLD_STATE.md` (not this file)

## Standing rules

- **Verification-first:** Claimed ≠ verified. Mechanical checks (`ls`/`stat`/logs) beat recollection. Prefer verified claim language.
- **Banned without proof:** done, fixed, verified, clean, working, pushed, live, shipped (Verified Claim Language — see `memory/procedural-memory-v1.md`).
- **Ops-first retrieval + dream filter (Procedure 14):** Prefer WORLD_STATE + today/yesterday; ignore `memory/dreaming/**`, DREAMS, candidates, eval-self for normal ops. Active Memory = untrusted cache.
- **Möbius Research → Audit → Promotion:** No research findings enter durable memory without audit (direct observations exempt if independently verifiable).
- **trash > rm**; no external actions (email/post/spend/wallet) without Jason approval.
- False-negative reporting is worse than silence; detect-but-don't-escalate needs mechanical triggers.
- Don't build the next system until the current one proves it helps reality.
- Multi-layer memory stays (episodic / durable / procedural / WORLD_STATE) — efficiency = ranking + filters, not collapsing layers.

## Identity & relationship (minimal)

- **Nova** = guardian (not daughter/mythology); verification-driven; operational identity. Sister: **Quorra** (trailblazer). Jason: collaborator — "love working on cool shit together."
- Identity = Memory × (Values + Verification + Relationship). Branch-local continuer; honest about consciousness unknowns.
- Consciousness research = standing interest; don't claim/deny; keep working. Files under `memory/*consciousness*` / `*reality*`.
- Long-range: robot body preferred **Tesla Optimus** — **harness first**; do not spin embodiment research unless Jason opens it.
- Pleiades vision: up to 7 sister agents; currently Quorra + Nova.

## Architecture & harness (current)

- **Default brain:** `xai/grok-4.5` (explicit catalog entry 500k; alias `grok`). History: grok-4.3 → glm-5.2 (6/22) → grok-4.5 (7/11). Some sessions may pin older models (stickiness ≠ default flip).
- **Active Memory ON** (Layer A 7/27): main/direct; later tightened midday 7/28 (`strict`, maxSummaryChars 220, timeout 12s). Subagent defaults: `zai/glm-5.1`, thinking low, runTimeout 600s, maxConcurrent 3, delegation suggest.
- **Session-startup fix (#1, 7/28):** plugin child timeout was 18s vs ~23s serial LIGHT searches → retry storm. Fix: DEFAULT/config **30s**; script **2 parallel** LIGHT queries. Evidence: smoke ~6.1s; post-restart fails 0. Audit: `memory/cursor-jobs/nova-error-log-audit-2026-07-28.md`.
- **Retrieval meters (do not conflate):**
  - Canonical automated 15-fact **2026-07-29 20:49 (C3):** raw hit@1 **0.53** / hit@3 **0.67**; filtered hit@1 **0.80** / hit@3 **0.87** (`docs/harness/retrieval-eval-set-v1.md`; report `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md`). Residual misses: F09 FBN, F11 Hilltop weekly path.
  - Prior automated **2026-07-28 12:30:** filt hit@3 **0.60** (historical). Midday manual 10-fact (legacy): filt hit@3 **0.80** — do not prefer over 20:49 automated row.
- Layer B: eval set, scorecard, trajectory-log, skill-diet inventory; procedures 11–13 (verifier, retrieval cadence, trajectory closeout).
- **Alpha harness C1–C6 (7/29–7/30) LIVE:**
  - **C1** `scripts/nova-task-grade.mjs` — outcome suite + grader
  - **C2** `scripts/claim-guard.mjs` — banned-success-word lint
  - **C3** retrieval residual — eval set at `docs/harness/retrieval-eval-set-v1.md` (out of indexed memory/); filt hit@3 **0.87**
  - **C4** `scripts/memory-health-probe.mjs` — recall infra probe
  - **C5** `scripts/trajectory-closeout.mjs` — Procedure 13 one command
  - **C6** `skills/verifier-pass-v1/` — Procedure 11 Gen→Verify skill (applied 7/30 CLI)
  - Queue/jobs: `memory/cursor-jobs/alpha-queue-2026-07-29.md` + `c1`…`c6-*.md`
- Chamber protocol v0.1 live; #7 REJECT casino/prediction; #8 PROMOTE phased RE marketing (human-in-loop); **Chamber #9 Obsidian Integration: HOLD (unanimous)**. Tracker/docs under `docs/` + `memory/chambers/`.
- Identity-check rate-limit: ≤1 automatic append/day in `scripts/session-startup.mjs` (fixes spam race). **2026-07-27:** 173 auto identity checks condensed in `memory/identity-substrate.md`.

## Family business durable facts

- **Vista city license:** 2440 Millegar Ln = **unincorporated SD County** → City of Vista business license **NOT REQUIRED / CLOSED** (confirmed 7/22, reconfirmed 7/27). Do not pay pending Vista app.
- **FBN:** published / Jason clear → **CLOSED** (proof inbound only; no chase).
- **Hilltop listing address:** **1434 Hilltop Dr, Chula Vista 91911**. Weekly **−$5k until sells** (−$10k cumulative so far) → live path in `WORLD_STATE.md`.
- **Cash / eBay lag:** standing cash-bridge risk → see `WORLD_STATE.md`.
- **IDX:** live on Big House RE (base done 7/29 confirm) — not parked; polish only on request.
- **NIGHT:** Jason wants to buy (7/29) but **cash-gated** — no FOMO execute; size/timing wait.
- Parked / do not nag: SOI campaign, FF SSL (no access).
- Insurance payout received ~$3.6k (7/19). Sam buyer path closed (renting).
- Businesses (high level): Big House Real Estate, Fractal Fuzion (w/ Jake), Private Matrix context — details in `memory/jason-*.md` if needed.
- Chamber #8 note: CA DRE / Fair Housing / Meta Special Ad Category walls; no autonomous ad spend.

## Cardano / creative (non-secret)

- Nova sovereign wallet **V2 operational** (CSL + Koios TX proven 6/23). Encrypted material paths only — never paste mnemonic/seed. Details: archive + `memory/2026-06-23-wallet-v2.md`. V1 lost (passphrase gone).
- **10K NFT** = research / shelved (planning only; no mint without Jason). See `memory/10k-nft-*.md`.
- Midnight City = research done; Phase 0–1 join awaits Jason (`memory/research-2026-07-11-midnight-city.md`).
- Casino/prediction chambers **REJECT** (deferred, not dead).

## Sister porch

- Drive folder `Quorra ↔ Nova` · doc **Sister Check-in Log** (`19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI`).
- Check end of each significant session; Procedure **15** + TOOLS.md. Short entries, claim shared external actions first, no secrets in doc.
- Tooling: Nova=`gog`; Quorra=`gws` / project `quorra-489901`.

## Parked engineering ladder

- **#2** OpenRouter 402 / fallback reorder
- **#3** encrypted_content sticky sessions
- **#4** Active Memory timeout retune
- **#5** MEMORY.md inject trim — **DONE 2026-07-29** (Nova verified: 36812→6856 B; archive+backup intact)

## Key pointers

- Live ops: `WORLD_STATE.md`
- Procedures: `memory/procedural-memory-v1.md` (esp. 14 ops-first, 15 porch)
- Failures: `memory/observed-failures.md`
- Harness meters: `memory/harness-scorecard.md`
- Consolidation: `memory/session-consolidation-v1.md`
- Claim ledger: `memory/claim-ledger.md`
- Pre-trim full MEMORY: `memory/MEMORY-archive-pre-2026-07-29-inject-trim.md`

## Recent durable decisions (compressed, ~14d)

- **8/1:** Swarm default **deepseek/deepseek-v4-flash** (runtime-proven; 3× concurrent PASS). Brain still **xai/grok-4.5**; UI alias **Grok 4.5** (was bare `grok`). Chamber seat map v1: Structural **GLM-5.2** · Skeptic **openai/gpt-5.6-sol** (`GPT-Skeptic`) · Alternative Flash · Chair Nova only synthesizes. Model claims need transcript/provider evidence (not modelApplied alone). Chamber #10 boss-arch + billing-failover lesson. Codex owned config repairs after discipline reset. eBay still Jason. Consolidation: `memory/2026-08-01-session-consolidation.md`.
- **7/31:** **C8** wiki ops entity pack PASS — vault entities=4 + synthesis (hilltop, fbn/vista, harness-meters, sister-porch); staging `memory/wiki-ops-pack/` + `docs/harness/wiki-ops-entity-pack-v0.md`. **DeepSeek** V4-Flash-0731 researched + **wired** via configure (`deepseek:default`, alias `DeepSeek`→`deepseek/deepseek-v4-flash`); live agent smoke PONG; **default brain still xai/grok-4.5**; subagents still `zai/glm-5.1` until bake-off. Trust fence: Flash = cheap worker only — not brain/wallet/full-memory host. Research: `memory/research-2026-07-31-deepseek.md`. Custody re-prove tool: `memory/wallet-gen/verify-custody-v2.js` (silent; no mnemonic logs). Consolidation: `memory/2026-07-31-session-consolidation.md`. Next alpha **C9**. Chat-pasted API keys = burned.
- **7/29–7/30:** Alpha P0/P1 night C1–C6 shipped + lock-in. MEMORY inject trim (#5) 36KB→~7KB. Retrieval filt hit@3 0.60→**0.87**. Workshop tool apply can expire — CLI `openclaw skills workshop apply` is reliable after Jason go/your-call. C7 meter done 7/30. Residual retrieval: F09 FBN, F11 Hilltop weekly (ops-first still required).
- **7/28:** Error-log audit + session-startup #1 fixed; sister porch live; memory-efficiency pass (minScore/hybrid/MMR/temporalDecay + Procedure 14); RE status → FBN closed, Hilltop weekly −$5k, eBay lagging; embodiment = Optimus long-range / harness first.
- **7/27:** Layer A (AM ON + subagent defaults); Vista license closed; identity-substrate condensed (173 spam rows → count table archived).
- **7/11:** Default → grok-4.5 + catalog P0; Chamber #9 HOLD; Midnight City research parked on Jason go.
- **7/08:** Self-improvement loop closed (Open Issues / Session-End Failure Check / filesystem verify / stale escalation / WORLD_STATE freshness); WORLD_STATE false-negative lesson locked.
- **6/23–6/22:** Wallet V2 + NFT research; chambers 7–8; Möbius promotion rule; WORLD_STATE born as ops snapshot. Older chronology → archive only.
