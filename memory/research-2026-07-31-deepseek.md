# Research Session — DeepSeek V4-Flash-0731 + Trust / Credits / Subagents

**Date:** 2026-07-31 ~22:56–23:05 PDT  
**Trigger:** Jason — DeepSeek dropped fire last night; can it be trusted with this system? Where buy API credit? Enough for cheap subagents?  
**Researcher:** Nova on `xai/grok-4.5`  
**Protocol:** Proc 4 + 10 · Research → Audit → Promotion  
**Status:** WORKING FILE. **0 MEMORY.md promotions.** No config change. No spend.

---

## 0. Prior context (found)

| Path | Relevance |
|------|-----------|
| `memory/research-2026-07-30-ai-stack-arbitrage.md` | DeepSeek V4 Flash/Pro pricing already **P-verified** 7/30; #1 arb = cheap-gen → expensive-verify |
| MEMORY / WORLD_STATE | Subagent default **`zai/glm-5.1`**; primary brain **xai/grok-4.5** until 4.6; OpenRouter 402 **parked** |
| OpenClaw docs | Native provider plugin `@openclaw/deepseek-provider` · models `deepseek/deepseek-v4-flash` + `v4-pro` |
| Live config | `openclaw.json` **deepseek_mentions = 0** tonight — not wired yet |

---

## 1. What dropped “last night” (primary)

**Source P:** https://api-docs.deepseek.com/updates/ — **Date: 2026-07-31**

### DeepSeek-V4-Flash Update (official)
- Official V4-Flash API now **public beta**
- Model id unchanged: **`deepseek-v4-flash`** → serves **DeepSeek-V4-Flash-0731**
- Same architecture/size as V4-Flash-Preview; **re-post-trained only**
- Claimed agent bench jumps (vendor harness, max effort) e.g. Terminal Bench 2.1 **82.7**, DeepSWE **54.4**, Toolathlon verified **70.3**, etc.
- Natively supports **Responses API**; adapted for **Codex**
- **Scope note (official):** this update upgrades **V4-Flash API only**. **V4-Pro API** and **APP/WEB** models **unchanged**. Pro official release “will follow soon.”

**Also P:** first-call docs note Flash already updated to 0731; keep calling `deepseek-v4-flash`.

**Legacy:** `deepseek-chat` / `deepseek-reasoner` discontinued **2026-07-24 15:59 UTC** (already past).

**X secondary:** developer chatter matches 0731 agent bump + open weights narrative — treat benches as **vendor-reported** until independent replications.

---

## 2. Pricing & capacity (primary 2026-07-31 fetch)

**Source P:** https://api-docs.deepseek.com/quick_start/pricing/

| Model | Context | Max out | In cache hit | In cache miss | Out | Concurrency |
|-------|---------|---------|--------------|---------------|-----|-------------|
| `deepseek-v4-flash` | **1M** | 384K | **$0.0028** | **$0.14** | **$0.28** | **2500** |
| `deepseek-v4-pro` | **1M** | 384K | **$0.003625** | **$0.435** | **$0.87** | **500** |

Units: **USD per 1M tokens**.

**Features (docs table):** JSON ✓ · Tool calls ✓ · Anthropic API ✓ · Thinking + non-thinking · Responses API on **Flash only** (Pro Responses “early August 2026”).

**Peak/off-peak (announced, not yet dated):** soon **2× regular** during Beijing peak **09:00–12:00** and **14:00–18:00 UTC+8** daily — applies all billing items. Effective date = future official announcement.  
→ For US Pacific: those windows are roughly **18:00–21:00** and **23:00–03:00 PDT** (watch DST). Plan heavy batch off-peak when policy lands.

**Cost ratios (inference from P prices, quality ≠ equal):**

| Compare (output $/1M) | Flash $0.28 vs | Ratio |
|------------------------|----------------|-------|
| Grok 4.5 out $6 | ~21× cheaper |
| Claude Opus-class $25 | ~89× cheaper |
| Our subagent GLM lane | unknown exact Z.ai $ tonight — Flash still “cost bomb” class |

**Rough subagent budget math (Flash, cache miss, non-thinking):**
- 1M in + 1M out ≈ **$0.42**
- 10 light subagent turns @ ~20k in / 5k out ≈ **$0.042** total  
- **$5 top-up** ≈ room for **many** cheap worker runs if prompts stay short and cache hits land  
- **$10–20** = comfortable bake-off + weeks of grunt **if** not dumping full MEMORY/WORLD_STATE every turn

Cache hit input **$0.0028** is the real multiplier — repeated system/tool schemas get almost free on input.

---

## 3. Where to buy API credit

| Path | Recommendation | Notes |
|------|-----------------|-------|
| **Official platform top-up** | **#1 preferred** | https://platform.deepseek.com/ → **Top Up** https://platform.deepseek.com/top_up · keys https://platform.deepseek.com/api_keys |
| **OpenRouter / aggregators** | **Avoid for now** | Our OpenRouter path is **402 / parked**; markup + another middleman; Jason policy = no fallback ladder thrash |
| **Together / Novita / Volcengine hostings** | Optional later | OpenClaw catalogs show third-party DeepSeek ids — useful if direct blocked; not first choice |
| **Self-host open weights** | Not now | V4 open-weight story (HF) — Jason GPU ~2GB VRAM; cash-gated |

**Payment methods:** full card list is **login-gated** on platform (not fully scrapeable tonight). Docs confirm **topped-up balance** deduct model; FAQ covers top-up/refund/invoice topics. Practical: create account → top_up page → use whatever methods the UI offers for your region. If US cards fail, that’s a known class of China-API friction — then reassess aggregator **only** with eyes open.

**OpenClaw wire path (docs, not done tonight):**
```bash
# env: DEEPSEEK_API_KEY
openclaw plugins install @openclaw/deepseek-provider
# onboard --auth-choice deepseek-api-key
# models: deepseek/deepseek-v4-flash , deepseek/deepseek-v4-pro
```
Docs warn: if Gateway is daemon, key must be in process env (`~/.openclaw/.env` or shellEnv).

---

## 4. Can it be trusted with *this* system?

### Short answer
**Yes as a cheap worker lane with hard fences.  
No as custodian brain, wallet signer, family-memory vault, or sole verifier.**

### Trust matrix (Nova / Jason stack)

| Surface | Trust DeepSeek? | Why |
|---------|-----------------|-----|
| Main chat / identity (Nova) | **No** | Stay Grok 4.5 → 4.6; continuity + values |
| Subagent bulk (summarize, classify, draft, eval loops, scrape normalize) | **Yes, gated** | Price + tools + 1M ctx + high concurrency |
| Verifier / claim-guard final | **No default** | Keep Proc 11 expensive/local brain |
| WORLD_STATE / MEMORY full dumps | **No** | Minimize export of family/ops corpus to CN API |
| Wallet paths, keys, mnemonics, gog tokens | **Never** | Hard ban in prompts/tools allowlist |
| RE marketing draft copy | **Maybe** | Draft only; Jason/Nova edit before public |
| Legal / Fair Housing / DRE-sensitive | **No** | Chamber #8 human-in-loop already |
| Browser / spend / email send authority | **No** | Tool policy stays with Nova/Jason |

### Trust factors (evidence-based, not vibes)

**Positive**
- First-class OpenClaw provider + thinking/tool replay support (docs)
- Tool calls + JSON + huge context = actually usable for agents
- Absurd price enables Gen→Verify arb we already wanted (7/30 research)
- Official 0731 post-train aimed at **agent** benches
- Concurrency 2500 on Flash = swarm-friendly

**Negative / residual**
- Operator: **Hangzhou DeepSeek Artificial Intelligence Co., Ltd.** (Open Platform ToS, Apr 2026) — PRC company; prompts/completions processed on their infra
- Data governance: treat API as **untrusted third party**. Assume inputs may be logged/retained per their policies; do not send secrets or full private memory
- Vendor benches use **their harness** — inflate risk; need **our** task bake-off
- Peak 2× pricing coming — budget with headroom
- Reliability/geo: China API outages, payment friction, possible regional blocks (class risk)
- Public beta Flash — expect rough edges
- Not a substitute for **custody** or **verification-first** culture

### Alignment with standing rules
- Jason: Grok primary until 4.6 — **unchanged**
- No OpenRouter ladder project — **unchanged**
- Cash tight / eBay first — **$5–10 experiment max**, not $100 FOMO
- Research → Audit → Promotion — **no MEMORY promotion tonight**

---

## 5. Subagents: is it “enough”?

**Yes — more than enough on dollars; quality is the real gate.**

Current: subagents = `zai/glm-5.1`. DeepSeek Flash is a **candidate replacement or parallel cheap lane**, not automatic flip.

| Question | Answer |
|----------|--------|
| Can $5–10 run useful subagents? | **Yes** if tasks are short, cached, non-thinking for grunt |
| Can it replace Grok main? | **No** |
| Can it replace GLM-5.1 tomorrow? | **Only after bake-off** on our tasks |
| Recommended first roles | draft scrub, classify, extract, test-case gen, retrieval-eval helpers, RE copy drafts |
| Forbidden first roles | wallet, auth, memory rewrite, external send, sole “verified” claims |

**Bake-off checklist (when Jason opens spend):**
1. Top up **$5–10** official platform only  
2. Install deepseek provider + key in gateway env  
3. Point **one** subagent profile or manual `/model deepseek/deepseek-v4-flash` test  
4. Run: claim-guard sample · retrieval residual phrasing · RE listing blurb · tool-call smoke  
5. Compare vs GLM-5.1 on: tool reliability, instruction follow, hallucination rate, $/task  
6. Keep Grok as executive; Flash as worker only  
7. If peak pricing activates, shift batch to off-peak

---

## 6. Claims audit

| ID | Claim | Label | Status |
|----|-------|-------|--------|
| D01 | 2026-07-31 changelog: V4-Flash-0731 public beta, agent bench list, Pro/APP unchanged | P updates | **verified** (fetch 200) |
| D02 | Flash pricing $0.14/$0.28 miss/out; cache hit $0.0028; 1M ctx; conc 2500 | P pricing | **verified** |
| D03 | Pro $0.435/$0.87; cache $0.003625; conc 500; Responses not yet | P pricing | **verified** |
| D04 | Peak 2× Beijing 9–12 & 14–18 UTC+8 coming; date TBD | P pricing | **verified** (policy announced) |
| D05 | API keys + top-up via platform.deepseek.com | P docs + S search | **verified** path; payment methods login-gated |
| D06 | OpenClaw native deepseek provider + v4-flash/pro catalog | P openclaw docs | **verified** |
| D07 | Our openclaw.json has no deepseek config tonight | D local | **verified** (count 0) |
| D08 | Subagent default still zai/glm-5.1 | D MEMORY/config | **verified** |
| D09 | Vendor agent benches are ground truth vs frontier | — | **rejected** as proven; treat as marketing until our bake-off |
| D10 | Safe as sole brain / wallet / full memory host | — | **rejected** |
| D11 | $5–10 enough for cheap subagent experiments | I from P prices | **inference** (high confidence on $; medium on quality) |
| D12 | Direct top-up better than OpenRouter for us now | I + parked 402 | **holding** |

---

## 7. Verdict (Nova)

1. **The drop is real** — official 7/31 V4-Flash-0731 agent post-train, not vapor.  
2. **Trust:** worker-lane yes · system-of-record no.  
3. **Buy:** **platform.deepseek.com/top_up** + api_keys — direct. Skip OpenRouter unless direct payment fails.  
4. **Subagents:** **yes, cheap enough**; start **$5–10**, Flash only, bake-off vs GLM-5.1, never default brain.  
5. **Do not spend tonight** unless you explicitly open it — cash still tight; eBay > API FOMO.

### Recommended next (Jason go required)
- [ ] Optional $5–10 top-up  
- [ ] Wire `DEEPSEEK_API_KEY` + deepseek-provider  
- [ ] Subagent model trial `deepseek/deepseek-v4-flash`  
- [ ] 4-task bake-off log → then decide keep GLM / dual / flip worker

---

## 8. Sources

**Primary**
- https://api-docs.deepseek.com/updates/ (2026-07-31 entry)
- https://api-docs.deepseek.com/quick_start/pricing/
- https://api-docs.deepseek.com/quick_start/rate_limit/
- https://api-docs.deepseek.com/ (first API call)
- https://api-docs.deepseek.com/news/news260424/ (V4 preview context)
- https://api-docs.deepseek.com/guides/tool_calls/
- https://platform.deepseek.com/ · /top_up · /api_keys
- OpenClaw: `docs/providers/deepseek.md`
- DeepSeek Open Platform ToS (cdn, Hangzhou entity)

**Secondary**
- X chatter on 0731 benches / Ollama cloud (untrusted)
- Web search summaries (untrusted; confirmed against P changelog)

**Local**
- `memory/research-2026-07-30-ai-stack-arbitrage.md`
- `openclaw.json` (deepseek absent)
- MEMORY.md subagent defaults

**MEMORY promotions:** 0  
**External actions:** 0  
**Spend:** 0  
**Config changes:** 0  
