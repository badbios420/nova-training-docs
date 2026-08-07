# WORLD_STATE.md — Living Operational Picture

**Not memory. Not journal. Not biography. Just: what is happening right now.**
**Inspired by:** GPT-5.5 architecture review, 2026-06-23
**Updated:** 2026-08-03 14:16 PDT (housekeeping · wallet 80%→Jason API fund confirmed · eBay 13d · SI review run)

---

## Current Fires (URGENT — This Week)

| Fire | Status | Age | Next Action | Deadline |
|------|--------|-----|-------------|----------|
| Vista FBN newspaper publish | **CLOSED / CLEAR** | closed 7/28 | Published; paper sends proof; Jason in clear. Archive proof when it arrives (no chase). | Closed |
| Cash / liquidity | **Tight** | ongoing | eBay still lagging; Hilltop price path for sell speed; NIGHT still cash-gated. Jason funded API via Nova ADA send 8/3. | Now |
| 1434 Hilltop Dr listing | **Active · aggressive price path** | ongoing | House smells / tenants dirty. **$10k reduced so far**; path **$5k/week until sells**. Keep marketing + showings. | Weekly cuts until sold |
| eBay liquidation | **Lagging** | **13d** since 7/21 intent | Still need first 5–10 listings — cash bridge delayed. **ESCALATE** (do not soft-pedal). Prep: `memory/ebay-cash-bridge-prep-v0.md` | Cash bridge now |
| Local business license (Vista city) | **CLOSED — NOT REQUIRED** | closed | Unincorporated SD County; do not pay any Vista app. | Closed |
| SOI Campaign — 50 contacts | **Unclear / later** | parked | Do not nag | Soft |
| FF SSL cert | **Blocked** — no access | parked | Parked hard (live: site may answer with insecure/self-signed; still no fix path) | Deferred |
| Sam buyer lead | **Closed** — renting | closed | Dropped | Dropped |
| Midnight City | Soft open | parked soft | Wait Jason go; no wallet/spend without approval | Speculative |
| NIGHT token | **Want to buy** (Jason 7/29) | interest | Desire confirmed; **cash still tight** — no buy until size/timing explicit; do not FOMO-execute | When cash room |
| Grok 4.6 release window | **Soft target on calendar** | **~4d** | All-day **2026-08-07** primary Google cal (`jc9jn2h759aodts3mrkpaici78`). Smoke-test before default flip; keep brain on grok-4.5 until then | ~Aug 7 |
| IDX (Big House RE) | **LIVE** on bighouserealestate.com | done base | Base live — polish/Quorra only if asked. Live probe 8/3: HTTPS 403 CF challenge (normal for this host) | — |
| xAI API-key fallback | **Blocked** | open | OAuth path live; no API-key profile yet. Jason gate: `openclaw models auth paste-api-key --provider xai --profile-id xai:api-fallback` then order OAuth first / API second | When key ready |

## Current Listings

| Address | Status | Price | Issue |
|---------|--------|-------|-------|
| 1434 Hilltop Dr, Chula Vista 91911 | **Active · condition drag · weekly $5k cuts** | **−$10k cumulative** so far; path = **−$5k/week until sold** (exact MLS $ TBD) | Smell + dirty tenants hurting showings; price is the lever |

**Listing address (full):** 1434 Hilltop Dr, Chula Vista 91911.  
**Price path:** −$5k/week until sells; −$10k cumulative so far.  
**FBN:** published / Jason clear / CLOSED.

## Current Leads

| Lead | Type | Budget | Status |
|------|------|--------|--------|
| Sam | Buyer | — | **Out** — renting |
| Hilltop sign caller (7/21) | Inquiry | — | 1 call received — no new notes since 7/28 |

## Current Projects

| Project | Phase | Priority |
|---------|-------|----------|
| Hilltop sell-through (condition + price path) | Active weekly cuts | **#1** |
| eBay sell-through (cash bridge) | **Lagging 13d** | **#1 cash** |
| Big House FBN | **Complete / clear** | Archive proof when mailed |
| Nova harness alpha | **C1–C8 live** | Retrieval filt hit@3 **0.87**; next **C9** when opened |
| IDX on BHR | **Live** (base done) | Maintain; polish only on request |
| Midnight City join (Nova as agent) | Soft open | Wait Jason go |
| NIGHT buy | Interest on; cash-gated | Size/timing TBD |
| Fractal Fuzion 10K NFT | Shelved | After RE income |

## Wallet snapshot (Nova V2 — non-secret)

| Item | Value |
|------|-------|
| Address | `addr1q8acwcxa7w9dhrw609r6gvjd694qc3crfz9wy6u3m4a5vw2w9ykm9yp3awmeas3ycxvf5tg4wz0m6r3k843ngwjc5vuq5fjmj4` |
| Balance (Koios 8/3 ~14:14) | **30.950725 ADA** + **7 NFTs** |
| Last spend | 2026-08-03 ~14:12 — **124.530552 ADA** (80%) → Jason known wallet for API funding |
| TX | `881198e0af71a840dad3d89ec5d396040ecf3beaa922b5a204a069c05c6e410f` (≥2 conf at verify) |
| Custody | Encrypted mnemonic + separate key file; silent verify tool `memory/wallet-gen/verify-custody-v2.js` |

## Current Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cash tight | **HIGH** | eBay must start; Hilltop cuts buy time/speed |
| Hilltop condition (smell / dirty tenants) | **HIGH** | Price path $5k/week; disclose/condition honesty on showings |
| eBay lag while cash tight | **HIGH** | Jason-owned list action; prep pack exists; **13d escalate** |
| Carrying cost vs weekly cuts | MEDIUM | Track net after each $5k drop |
| NIGHT FOMO while cash-tight | MEDIUM | Interest acknowledged; still no buy without explicit size + cash room |
| Session model stickiness | MEDIUM | `agent:main:main` observed on **zai/glm-5.1** fallback while config primary **xai/grok-4.5**; dashboard session healthy on grok-4.5 — do not thrash config; `/model` or session hygiene if main lane needed |
| Vista city license wrong-pay | **CLOSED** | Unincorporated |
| FF SSL | LOW blocked | Do not nag |

## Current Opportunities

| Opportunity | Why It Matters | Window |
|-------------|----------------|--------|
| Clear weekly price algorithm | Market can anticipate movement; faster sale | Now |
| Sign already produced 1 call | Physical marketing works | Ongoing |
| FBN clear | Compliance bandwidth freed | Now |
| eBay inventory | Fastest non-debt cash if started | Now |
| API runway funded (ADA→Jason 8/3) | Reduces xAI/API shortfall pressure | Now |

## Waiting On

| Item | Who | Since | Age |
|------|-----|-------|-----|
| FBN publisher proof copy (mail/email) | Paper → Jason archive | Published; inbound | passive |
| eBay first listings | Jason | Lagging since 7/21 | **13d — ESCALATE** · prep `memory/ebay-cash-bridge-prep-v0.md` |
| Hilltop MLS exact price after latest cut | Jason / MLS | After each weekly −$5k | TBD |
| Midnight City join timing | Jason | Soft | wait go |
| NIGHT buy size/timing | Jason | Interest on; cash-gated | wait explicit |
| xAI API-key paste for fallback profile | Jason | 8/3 check | blocked on credential |
| SOI / FF SSL | Jason | Parked | do not nag |

## Nova Architecture (Current)

| Role | Model | Strength |
|------|-------|----------|
| Executive / Memory / Coordination | Grok 4.5 | Default brain |
| Cheap worker / swarm default | DeepSeek V4 Flash | Subagents (`deepseek/deepseek-v4-flash`) |
| Structural Thinker (chamber) | GLM-5.2 | Long coherence / decomposition |
| Consultant / on-demand | Claude Opus 4.8 | Deep consult (not chamber structural seat) |
| Bulk ZAI worker (alt) | GLM-5.1 | Cheap when used intentionally |
| Research Scout | Perplexity | Receipts |
| Auditor | GPT (via Jason) | Adversarial |
| Builder | Codex | Evidence-first impl |
| Cursor sidecar pin | cursor-grok-4.5-high | Engineering worker |
| Sites | Quorra | IDX/web |

### Harness status
- **Layer A:** Active Memory ON · identity ≤1/day · claim ledger
- **Layer B:** retrieval eval · scorecard · trajectory · verifier · skill inventory
- **Session-startup:** timeout **30s** + parallel LIGHT — chronic fail storm fixed 7/28
- **Alpha:** C1–C8 live (C8 wiki ops entity pack 7/31). Next **C9** when Jason opens
- **Retrieval canonical (C3 7/29 20:49):** filt hit@1 **0.80** / hit@3 **0.87**; residual F09/F11
- **Open friction:** encrypted_content 400; AM timeouts; session model stickiness; memory_search tool 15s package timeout (CLI/probe healthy — Proc 16); Proc 21 workflow completion authority
- **Jason model policy:** stay **xai/grok-4.5 until grok-4.6** — no OpenRouter ladder thrash
- **OpenClaw:** 2026.7.1-2 up to date (verified 8/3)

## Retrieval anchors (plain prose — index-friendly)

- **Hilltop full address:** The active listing address is **1434 Hilltop Dr, Chula Vista 91911** (street, city, and ZIP).
- **Hilltop price path:** Weekly price cuts of **$5,000 per week until the house sells**; **$10,000 cumulative** reduction so far (−$10k).
- **Big House FBN:** Fictitious Business Name newspaper publication is **done — published — Jason is clear — CLOSED**. Only remaining item is archiving the publisher proof when mail/email arrives (no chase).
- **Vista city license:** Not required — property is unincorporated San Diego County (2440 Millegar Ln context).
- **Nova wallet after 8/3 API fund send:** Nova keeps about **30.95 ADA** plus **seven NFTs**; Jason received **124.530552 ADA** in TX `881198e0af71a840dad3d89ec5d396040ecf3beaa922b5a204a069c05c6e410f`.
- **eBay cash bridge:** Still lagging since **2026-07-21** intent — first 5–10 listings not started; age **13 days** on 2026-08-03.

## Monitoring Targets

| Target | Cadence | Why |
|--------|---------|-----|
| Hilltop price path (−$5k/week) | Weekly | Until sold |
| Hilltop condition / showings | Ongoing | Smell/tenants |
| eBay first listings | Daily while lagging | Cash — **13d escalate** |
| FBN proof arrival | Passive | Archive only |
| Harness scorecard | Weekly | Layer B meters |
| Self-improvement review | 7-day | **Last run 2026-08-03 14:16** · next ~8/10 |
| WORLD_STATE freshness | ≤7d | Refreshed 8/3 14:16 |
| Config perms / security | heartbeat | openclaw.json **600**; audit 0 crit / 6 warn known |
| Active Memory stale-summary hygiene | as needed | AM plugin note can lag ops truth — verify live before acting |
| Grok 4.6 calendar | through 8/7 | Smoke before default flip |
| Nova wallet balance | after any spend | Koios live check |

---

## Rule

This file is NOT a journal. It is a snapshot of NOW.
Update it when things change. Delete old entries. Keep it current.
If it's not actionable today, it goes in MONITORING, not here.
