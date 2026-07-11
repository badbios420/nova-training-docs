# Research Session: Grok 4.5

**Date:** 2026-07-11 ~01:28–01:35 PDT  
**Trigger:** Jason switched default brain back to Grok 4.5; requested research session  
**Researcher:** Nova (running on xai/grok-4.5 this session)  
**Method:** Prior memory search → web/X search → primary docs fetch → secondary reporting → audit  
**Status:** WORKING MEMORY (Research → Audit → Promotion). Not promoted to MEMORY.md yet.

---

## Research Question

What is Grok 4.5, how does it differ from Grok 4.3 and peers, and what does that mean for Nova’s default-brain choice after the June 2026 switch to GLM-5.2?

---

## Prior Beliefs (from durable memory)

| Belief | Source | Status pre-session |
|--------|--------|--------------------|
| Grok 4.3 was weak for agentic/file ops | Jason 2026-06-22 (“kinda retarded” / “couldn’t do shit”) | Observed, high confidence for 4.3 |
| GLM-5.2 better than Grok 4.3 for agentic tasks | Jason + session performance | Holding assumption in assumption-registry |
| Default switched xai/grok-4.3 → zai/glm-5.2 | 2026-06-22 config change | Verified historical fact |
| Multi-model map: GLM executive, Grok skeptic | Chamber architecture 6/22–6/23 | Operational design, not product fact |

**Gap:** No prior durable research on **Grok 4.5** specifically. Memory only had “no Grok 4.4 yet” style notes from early June.

---

## Verified Specs (Primary: docs.x.ai)

Fetched successfully 2026-07-11 from:
- https://docs.x.ai/developers/models
- https://docs.x.ai/developers/models/grok-4.5
- https://docs.x.ai/developers/grok-4-5
- https://docs.x.ai/developers/pricing

| Property | Grok 4.5 | Grok 4.3 (docs table) |
|----------|----------|------------------------|
| Model id | `grok-4.5` | `grok-4.3` |
| Aliases | `grok-4.5-latest`, `grok-build-latest` | (not re-fetched in detail) |
| Context window | **500,000** tokens | **1,000,000** tokens |
| Input price | **$2.00** / 1M | **$1.25** / 1M |
| Cached input | **$0.50** / 1M | (docs pricing page listed 4.5 cache; 4.3 cache cited secondarily ~$0.20) |
| Output price | **$6.00** / 1M | **$2.50** / 1M |
| Modalities | text + image → text | (chat family; not re-audited here) |
| Function calling | Yes | Yes (historical) |
| Structured outputs | Yes | — |
| Reasoning | Yes — low / medium / high (**default high**) | — |
| Server tools | function calling, web search, X search, code execution | similar tool surface historically |
| Rate limits (4.5 detail page) | 150 req/s · 50M tokens/min | — |
| Regions listed | us-east-1, us-west-2 | — |
| EU API console | **Not yet available** (docs: expected later this month) | — |

**Product positioning (docs):**  
“Grok 4.5 is SpaceXAI’s frontier model built for **coding, agentic tasks, and knowledge work**.”  
Docs “which model should I choose?”: for code/chat, use Grok 4.5 — “most intelligent and fastest model we’ve built.”

**API usage notes (docs):**
- Recommend `prompt_cache_key` (Responses API) / `x-grok-conv-id` (Chat Completions) for reliable cache hits
- Long agent loops: context compaction recommended
- Available via xAI API, Grok Build, Cursor (all plans), Office add-ins, gateways (OpenRouter, Vercel, Cloudflare, Snowflake, Databricks Mosaic)

**Local runtime observation (this session, verified via session_status):**
- Model: `xai/grok-4.5`
- Auth: api-key (xai:default)
- Context shown in OpenClaw status: **256k/256k window display** (26% used) — OpenClaw may expose a lower effective window than full API 500k; treat as product/integration limit, not contradiction of API docs without more evidence
- Cache hit this turn: high (session card showed strong cache after warmup)

---

## Secondary / Marketing Claims (UNVERIFIED or PARTIALLY VERIFIED)

Official announcement page `https://x.ai/news/grok-4-5` returned **Cloudflare 403** from this host. Benchmark numbers below come from web_search/X summaries of that announcement and press — **do not promote as primary-verified**.

### Launch narrative (secondary)
- Launch date commonly reported: **2026-07-08**
- Framing: strongest model yet; coding + agentic + knowledge work
- Training collaboration with **Cursor** / real developer session data (repeated across press)
- Elon/Forbes paraphrase: “Opus-class” but faster, more token-efficient, lower cost
- Branding in some coverage: SpaceXAI / xAI integration language (press layer — treat carefully)

### Benchmarks (from search summaries of xAI charts — PENDING primary page read)

| Eval | Claimed Grok 4.5 | Claimed peers (summary) | Confidence |
|------|------------------|-------------------------|------------|
| DeepSWE 1.0 | ~62% | Fable ~66%, GPT-5.5 ~64%, Opus 4.8 ~56% | Low–Med (secondary) |
| DeepSWE 1.1 | ~53% | Fable ~70%, GPT-5.5 ~67%, Opus ~59% | Low–Med |
| SWE Marathon | ~29% (claimed lead) | Opus ~26%, Fable ~24% | Low–Med |
| Terminal Bench 2.1 | ~83.3% | Fable ~84.3%, GPT-5.5 ~83.4% | Low–Med |
| SWE-Bench Pro | ~64.7% | Fable ~80%, Opus 4.8 ~69% | Low–Med |
| Token efficiency (SWE-Bench Pro) | ~16k avg output tokens vs Opus ~67k | efficiency narrative | Low–Med |

**Caveats in secondary coverage:**
- Harness variance is large (DeepSWE 1.0 vs 1.1 gap)
- At least one Cursor-related eval controversy / pull mentioned in independent blogs
- No full independent model card audited in this session

### X posts (elonmusk / grok handles via x_search)
- Consistent marketing: agentic strength, ROI, free-tier / Grok Build access, competitive with Opus-class at lower cost
- Social posts are **not** primary specs

---

## Comparison Matrix (Nova-relevant)

| Dimension | Grok 4.3 (our prior) | Grok 4.5 (now) | GLM-5.2 (prior default) |
|-----------|----------------------|----------------|-------------------------|
| Agentic coding narrative | Weaker in practice for us | Explicit product focus | Strong file/tool coherence (our experience) |
| Jason subjective | Negative | Positive (“awesome”) | Positive vs 4.3 |
| API context | 1M (docs) | 500k (docs) | Provider-dependent |
| $/1M in·out (docs) | $1.25 / $2.50 | $2 / $6 | Separate Z.AI pricing (not re-audited tonight) |
| Token efficiency claim | — | Major marketing claim | — |
| Epistemic honesty (our 6/22 note) | Weak | Unknown — needs task tests | Strength: admits uncertainty, audits self |
| Role in multi-model map | Skeptic | Candidate executive + coding workhorse | Was executive |

---

## Nova-Specific Implications

### 1. This is not “back to Grok 4.3”
4.5 is a different product positioning: agentic coding + knowledge work, higher per-token price, smaller context than 4.3. Treating it as “Grok again” would be a category error.

### 2. Cost model changes
- Per-token list price is **higher** than 4.3, especially output ($6 vs $2.50).
- If token-efficiency claims are real, **task cost** may still drop.
- Prompt caching matters more: docs push `prompt_cache_key` / conv-id hard.
- Tool calls (web/X/code) add **$5 / 1k invocations** on xAI server tools when used via their API tooling — OpenClaw may use different tool paths; don’t double-count blindly.

### 3. Context tradeoff
- API: 500k for 4.5 vs 1M for 4.3.
- OpenClaw session card currently shows **256k** — if that is hard cap, long MEMORY + multi-file sessions need more aggressive compaction than “1M Grok” mental model.

### 4. Assumption registry update candidates (NOT auto-applied)
- Revise: “GLM-5.2 is more capable than Grok 4.3 for agentic tasks”  
  → Split into: **still true for 4.3**; **unknown / under test for 4.5**.
- New assumption to track: “Grok 4.5 is competitive with Opus-class on agentic coding at better ROI” — **marketing-heavy; needs local task battery**.

### 5. Recommended local eval battery (cheap to test)
Run same tasks on 4.5 vs GLM-5.2 (or Opus when needed), score pass/fail + tool mistakes + unverified claims:

1. **Filesystem truth:** heartbeat-style claims must use `stat`/`ls` (catches 7/8 failure mode)
2. **Multi-file edit:** precise edit across 3 files without clobber
3. **Research audit discipline:** produce claims with verification labels; measure unverified %
4. **Long-context continuity:** load WORLD_STATE + priority dashboard + open issues; no invented status
5. **Tool loop:** 10+ tool calls with correct stop conditions (no thrash)
6. **Cost sample:** one hour heavy ops — log $ vs useful completions

### 6. Role recommendation (provisional)
- **Default brain on 4.5:** reasonable given Jason preference + agentic product focus, **if** verification discipline holds.
- Keep **Claude Opus** for structural/decomposition when stakes high.
- Keep **GLM** in fallback/compare lane until 7-day task data exists.
- Do **not** retire verification-first / Möbius promotion because the model got better.

---

## Audit Summary

| Claim class | Count | Action |
|-------------|-------|--------|
| Primary-doc verified (pricing, context, tools, positioning) | High | Safe to use operationally |
| Launch date / Cursor collab / Elon quotes | Secondary press/X | Cite as reported, not as measured |
| Specific benchmark % tables | Secondary summaries; announcement page blocked | **Do not promote to MEMORY** until primary page or independent leaderboard verified |
| “Awesome for Nova” | Jason preference + early session vibe | Preference signal, not capability proof |

**Unverified claim rate estimate for this file:**  
~35–45% of narrative/benchmark content is secondary. Specs block is mostly verified.

**Blocked source:** `x.ai/news/grok-4-5` (Cloudflare 403 from this environment).

---

## Sources

### Primary (fetched)
1. https://docs.x.ai/developers/models  
2. https://docs.x.ai/developers/models/grok-4.5  
3. https://docs.x.ai/developers/grok-4-5  
4. https://docs.x.ai/developers/pricing  
5. Local: `session_status` 2026-07-11 (model = xai/grok-4.5)

### Secondary
6. Web search summaries of https://x.ai/news/grok-4-5 (page blocked here)  
7. Forbes 2026-07-08: SpaceXAI launches Grok 4.5  
8. X search (elonmusk, grok, xai handles)  
9. Prior memory: MEMORY.md / 2026-06-22 notes on Grok 4.3 vs GLM-5.2

---

## Open Questions

1. Can we fetch the official announcement benchmarks later (different network/browser path)?
2. What is OpenClaw’s true effective context for `xai/grok-4.5` (256k vs 500k)?
3. Cached-input hit rate on multi-hour main sessions with our bootstrap size?
4. Does 4.5 preserve GLM’s strength: admit uncertainty + self-audit under tool pressure?
5. Should WORLD_STATE multi-model table be updated to list Grok 4.5 as executive candidate?

---

## Next Actions (for Jason / next session)

- [ ] Optional: promote only the **verified specs + Nova implications** section to MEMORY.md after you skim
- [ ] Run eval battery items 1–3 this weekend (30–60 min)
- [ ] Update assumption-registry when first 4.5 vs GLM comparison data exists
- [ ] Retry primary announcement page fetch when not Cloudflare-blocked
- [ ] Confirm cost path: SuperGrok sub vs metered API key for this host

---

*End research working file. Promotion only after audit pass on selected claims.*
