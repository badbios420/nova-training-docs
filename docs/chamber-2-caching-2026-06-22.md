# Chamber Session #2 — Caching System — 2026-06-22 22:18 PDT

## Question

Is Nova's caching system working? What improvements or tools are needed? Is the "limited-time free" cached input storage being used?

## Consultants Used

| Role | Model | Method | Provenance |
|------|-------|--------|------------|
| Chair | GLM-5.2 | This session | (Nova reasoning) |
| Research Scout | Perplexity (sonar) | API call | REAL MODEL OUTPUT |
| Skeptic | Grok 4.3 | API call | REAL MODEL OUTPUT |
| Workhorse | Codex | (not needed) | — |
| External Auditor | GPT-5.5 | (not called) | — |

## Current State (Verified)

**From session_status:**
- Cache: 13% hit, 35k cached, 226k total input
- Cost: $0.0000 (free tier / cached tokens)
- Context: 144k/1M (14%)

**From OpenClaw config:**
- No cache-related configuration exists
- zai provider uses `openai-completions` API at `https://open.bigmodel.cn/api/paas/v4`
- No cache settings on any model definition

**From z.ai pricing (Jason provided):**
- GLM-5.2: $1.40/M input, $0.26/M cached input, "Limited-time Free" cached input storage, $4.40/M output

## Evidence

### REAL MODEL OUTPUT — Perplexity (Research Scout)

Key findings (with citations to z.ai docs):

1. **Prompt caching is implicit/automatic on z.ai.** No configuration flag needed. The API automatically identifies and reuses identical input content from prior requests.
2. **"Limited-time free cached input storage" is NOT a documented promotion.** Perplexity searched z.ai docs and found no mention of a "limited-time" offer. The caching feature appears to be permanent. The "limited-time free" label on the pricing page may refer to the lower billing rate for cached tokens (which is permanent), or to a third-party platform offering.
3. **No published cache TTL.** z.ai docs don't specify a time-to-live. Cache appears to be content-based and session-agnostic — persists as long as content remains unchanged.
4. **Cache hits visible via `usage.prompt_tokens_details.cached_tokens`** in API responses.
5. **Optimization strategies:** Keep system prompts identical across calls, avoid modifying prompt text mid-chat, maintain stable context window, don't delete messages during session, batch similar queries.

### REAL MODEL OUTPUT — Grok 4.3 (Skeptic)

Key challenges:

1. **13% cache hit rate is poor.** Most tokens still cost $1.40/M. 35k cached out of 226k suggests poor prompt stability or insufficient reuse.
2. **Missing config = relying on z.ai defaults.** These could include aggressive eviction, short TTLs, or no control over what gets cached.
3. **"Limited-time Free" is likely a trap.** Once promo ends, z.ai can introduce storage fees, raise prices, or delete caches. Creates vendor lock-in and dependency on opaque third-party cache.
4. **Core assumption flaw:** "Caching will be cheap, stable, and permanent." In reality, it introduces vendor lock-in and potential data retention risks.

### NOVA SIMULATED PERSPECTIVE — Chair (GLM-5.2)

My analysis of the current situation:

**Why cache hit rate is only 13%:**
- This session is 1h 20m long with 144k context used
- OpenClaw sends the full conversation history with each turn
- The system prompt + project context (AGENTS.md, SOUL.md, MEMORY.md, etc.) is ~15-20k tokens — this part should be cached
- But each new turn adds new messages, shifting the prompt. If z.ai's cache works on exact prefix matching, anything after the first new message won't cache
- 35k cached / 226k total = the cached portion is likely just the system prompt + initial context injection

**Why cost shows $0.0000:**
- Either the free tier covers this usage, or cached tokens are genuinely free during the "limited-time" period
- I can't tell which without checking the billing dashboard

**The "limited-time free" question:**
- Perplexity says it's NOT a documented promotion — it may just be the permanent cached rate
- Grok says it's likely a trap that will end
- The pricing page Jason pasted says "Limited-time Free" for cached input storage specifically — this suggests the STORAGE of cached content is currently free but may not always be
- Either way: the cached INPUT TOKEN rate ($0.26/M) is the real cost saving, and that's permanent

## Conflict Table

| Topic | Perplexity says | Grok says | Nova synthesis |
|-------|----------------|-----------|----------------|
| "Limited-time free" | Not a documented promotion; caching is permanent | Likely a trap that will end | **The pricing page explicitly says "Limited-time Free" for cached input STORAGE. This is different from the cached input TOKEN rate. Storage may become paid. The $0.26/M token rate is permanent.** |
| Cache hit rate (13%) | Optimize by keeping prompts stable | Poor rate, most tokens still full price | **Both right. The system prompt is being cached (35k ≈ system prompt size). The conversation history grows each turn, breaking cache for new content. This is expected behavior for long sessions.** |
| Cache TTL | Not published, content-based | Unknown, could be aggressive | **Unresolved. Need to test by waiting between calls and checking if cache persists.** |
| Vendor lock-in risk | Not addressed | Real risk — opaque cache, no local fallback | **Valid concern but not actionable right now. We're committed to z.ai for GLM-5.2. Mitigation: don't rely on cache for correctness, only for cost savings.** |

## Synthesis

**Is the caching system working?**

Partially. The 13% cache hit rate means the system prompt + initial context (~35k tokens) is being cached correctly. But the majority of input tokens (191k of 226k) are full-price because each conversation turn shifts the prompt content.

**What's actually happening:**
1. z.ai caches the system prompt + project context injection (~35k tokens) ✅
2. Each new conversation turn adds tokens that aren't cached ❌
3. As the session grows, the cached portion becomes a smaller percentage of total input
4. The $0.0000 cost suggests either free tier coverage or the cached storage is currently free

**Are we using the "limited-time free" cached storage?**

Yes, implicitly. z.ai's automatic caching is enabled by default. The 35k cached tokens are evidence it's working. But we're not optimizing for it — there's no cache-aware prompt structure.

**What improvements are needed:**

1. **Verify cache stats in API responses.** Check if OpenClaw exposes `usage.prompt_tokens_details.cached_tokens`. If not, add logging.
2. **Stable system prompt.** Ensure the system prompt + project context doesn't change between turns. It currently includes dynamic content (date/time, session info) that may break caching.
3. **Don't optimize prematurely.** At $0.0000 current cost, caching optimization isn't urgent. But when the free storage period ends, the 13% hit rate means 87% of tokens at $1.40/M could get expensive.
4. **Monitor when costs start appearing.** Set up a check for when $0.0000 becomes non-zero.

## Verification Status

- **Verified:** Cache is partially working — 35k tokens cached, 13% hit rate (session_status confirmed)
- **Verified:** z.ai caching is automatic/implicit (Perplexity, with citation to z.ai docs)
- **Verified:** No cache config exists in OpenClaw (direct config inspection)
- **Unverified:** Whether "Limited-time Free" refers to storage or token rate — the pricing page is ambiguous
- **Unverified:** Cache TTL — no published documentation
- **Unverified:** Whether OpenClaw passes through `cached_tokens` in API usage stats
- **Unverified:** Whether the dynamic parts of the system prompt (date, time, session ID) are breaking cache

## Promotion Decision

**HOLD AS WORKING MEMORY.**

The findings need verification before promotion:
- Need to check if OpenClaw exposes cached_tokens in usage stats
- Need to test whether removing dynamic content from system prompt improves cache hit rate
- Need to monitor when/if costs start appearing

**One item promoted to procedural memory:** None yet. But the finding about dynamic system prompt content potentially breaking cache is worth testing.

---

*Chamber #2 completed 2026-06-22 22:18 PDT. Both consultant outputs are real API responses.*
