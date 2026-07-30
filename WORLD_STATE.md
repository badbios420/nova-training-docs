# WORLD_STATE.md — Living Operational Picture

**Not memory. Not journal. Not biography. Just: what is happening right now.**
**Inspired by:** GPT-5.5 architecture review, 2026-06-23
**Updated:** 2026-07-30 00:17 PDT (C6 applied live · night stop · no C7)

---

## Current Fires (URGENT — This Week)

| Fire | Status | Age | Next Action | Deadline |
|------|--------|-----|-------------|----------|
| Vista FBN newspaper publish | **CLOSED / CLEAR** | 0d closed | Published; paper sends proof; Jason in clear. Archive proof when it arrives (no chase). | Closed 7/28 |
| Cash / liquidity | **Tight** | ongoing | eBay still lagging; Hilltop price cuts for sell speed; NIGHT interest real but still cash-gated | Now |
| 1434 Hilltop Dr listing | **Active · aggressive price path** | 0d path refresh | House smells / tenants dirty. **$10k reduced so far**; another **$5k** cut; **$5k/week until sells**. Keep marketing + showings. | Weekly cuts until sold |
| eBay liquidation | **Lagging** (Jason 7/28) | **7d** since 7/21 intent | Still need first 5–10 listings — cash bridge delayed. **Surface ≥5d / escalate at 7d.** | Cash bridge now |
| Local business license (Vista city) | **CLOSED — NOT REQUIRED** | closed | Unincorporated SD County; do not pay any Vista app. | Closed |
| SOI Campaign — 50 contacts | **Unclear / later** | parked | Do not nag | Soft |
| FF SSL cert | **Blocked** — no access | parked | Parked hard | Deferred |
| Sam buyer lead | **Closed** — renting | closed | Dropped | Dropped |
| Midnight City | Soft open — join later | parked soft | Jason still wants Nova in; **maybe tonight** — wait for go; no wallet/spend without approval | Speculative / fun |
| NIGHT token | **Want to buy** (Jason 7/29) | interest | Desire confirmed; **cash still tight** — no buy until he opens size/timing; do not FOMO-execute | When cash room |
| IDX (Big House RE) | **LIVE** on bighouserealestate.com | done base | Jason confirmed already live — **not parked**. Further polish/Quorra lane only if he asks | — |

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
| Hilltop sign caller (7/21) | Inquiry | — | 1 call received — no new notes 7/28 |

## Current Projects

| Project | Phase | Priority |
|---------|-------|----------|
| Hilltop sell-through (condition + price path) | Active weekly cuts | **#1** |
| eBay sell-through (cash bridge) | **Lagging** | **#1 cash** |
| Big House FBN | **Complete / clear** | Archive proof when mailed |
| Nova harness Layer B + efficiency | **Active 7/28–7/29** | Filtered hit@3 **0.87** canonical (C3 20:49); raw 0.67; ops-first + dream filter; AM strict |
| IDX on BHR | **Live** (base done) | Maintain; polish only on request |
| Midnight City join (Nova as agent) | Soft open — maybe tonight | Wait Jason go |
| NIGHT buy | Interest on; cash-gated | Size/timing TBD |
| Fractal Fuzion 10K NFT | Shelved | After RE income |

## Current Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cash tight | **HIGH** | eBay must start; Hilltop cuts buy time/speed |
| Hilltop condition (smell / dirty tenants) | **HIGH** | Price path $5k/week; disclose/condition honesty on showings |
| eBay lag while cash tight | **HIGH** | Jason-owned list action; Nova can prep titles/photos checklist when asked |
| Carrying cost vs weekly cuts | MEDIUM | Track net after each $5k drop |
| NIGHT FOMO while cash-tight | MEDIUM | Interest acknowledged; still no buy without explicit size + cash room |
| Vista city license wrong-pay | **CLOSED** | Unincorporated |
| FF SSL | LOW blocked | Do not nag |

## Current Opportunities

| Opportunity | Why It Matters | Window |
|-------------|----------------|--------|
| Clear weekly price algorithm | Market can anticipate movement; faster sale | Now |
| Sign already produced 1 call | Physical marketing works | Ongoing |
| FBN clear | Compliance bandwidth freed | Now |
| eBay inventory | Fastest non-debt cash if started | Now |

## Waiting On

| Item | Who | Since | Age |
|------|-----|-------|-----|
| FBN publisher proof copy (mail/email) | Paper → Jason archive | Published; inbound | passive |
| eBay first listings | Jason | Lagging since 7/21 | **7d — escalate** |
| Hilltop MLS exact price after latest cut | Jason / MLS | After each weekly −$5k | TBD |
| Midnight City join timing | Jason | Soft — maybe tonight | wait go |
| NIGHT buy size/timing | Jason | Interest on; cash-gated | wait explicit |
| SOI / FF SSL | Jason | Parked | do not nag |

## Nova Architecture (Current)

| Role | Model | Strength |
|------|-------|----------|
| Executive / Memory / Coordination | Grok 4.5 | Default brain |
| Cheap worker / Active Memory fallback | GLM-5.1 | Subagents + AM recall |
| Structural Thinker | Claude Opus 4.8 | Decomposition |
| Compare lane | GLM-5.2 | Long coherence / audit |
| Research Scout | Perplexity | Receipts |
| Auditor | GPT (via Jason) | Adversarial |
| Builder | Codex | Evidence-first impl |
| Sites | Quorra | IDX/web |

### Harness status
- **Layer A (7/27 night):** Active Memory ON · subagent defaults · identity ≤1/day · claim ledger
- **Layer B (7/28):** retrieval eval set · harness scorecard · trajectory log · verifier procedure · skill inventory
- **Session-startup (7/28 23:30):** timeout **30s** + parallel LIGHT searches — chronic fail storm fixed (live completedAt + 0 fails post-restart)
- **Open harness friction:** encrypted_content 400; AM timeouts; session model stickiness; memory_search **tool** flake possible (CLI/probe healthy — Proc 16); retrieval residual **F09/F11** only (overall filt hit@3 **0.87**)
- **Jason model policy 7/29:** stay **xai/grok-4.5 until grok-4.6** — do **not** work fallback/OpenRouter ladder
- **Closed 7/29:** MEMORY inject trim — 36812→~7k B; alpha scout + Cursor queue written
- **Harness alpha:** C1–C6 **live** (C6 applied 00:17 CLI). Night stop. Next: **C7 memory-before-speech** when Jason opens

## Retrieval anchors (plain prose — index-friendly)

- **Hilltop full address:** The active listing address is **1434 Hilltop Dr, Chula Vista 91911** (street, city, and ZIP).
- **Hilltop price path:** Weekly price cuts of **$5,000 per week until the house sells**; **$10,000 cumulative** reduction so far (−$10k).
- **Big House FBN:** Fictitious Business Name newspaper publication is **done — published — Jason is clear — CLOSED**. Only remaining item is archiving the publisher proof when mail/email arrives (no chase).
- **Vista city license:** Not required — property is unincorporated San Diego County (2440 Millegar Ln context).

## Monitoring Targets

| Target | Cadence | Why |
|--------|---------|-----|
| Hilltop price path (−$5k/week) | Weekly | Until sold |
| Hilltop condition / showings | Ongoing | Smell/tenants |
| eBay first listings | Daily while lagging | Cash |
| FBN proof arrival | Passive | Archive only |
| Harness scorecard | Weekly | Layer B meters |
| Self-improvement review | 7-day | Last 7/27 18:13 · next ~8/3 (**not overdue**) |
| WORLD_STATE freshness | ≤7d | Light stamp 7/28 11:18; RE facts from 00:27 |
| Config perms / security | heartbeat | 11:12: openclaw.json 600; 0 critical |
| Active Memory stale-summary hygiene | as needed | AM plugin note can lag ops truth — verify live before acting |

---

## Rule

This file is NOT a journal. It is a snapshot of NOW.
Update it when things change. Delete old entries. Keep it current.
If it's not actionable today, it goes in MONITORING, not here.
