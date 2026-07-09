# Grok 4.3 Consultation — Kalshi Trading Bot

**Date:** 2026-07-07
**Model:** grok-4.3
**Cost:** ~$0.038

---

## Verdict: "This is probably a bad idea."

Brutally honest assessment. Key points:

### Strategy Ranking (Grok's order)
1. **Niche market making / liquidity provision** — post both sides, collect spread + fees. Needs real capital + inventory management.
2. **Statistical arbitrage / relative value** — correlated Kalshi contracts (player props vs team outcomes). Better than cross-platform arb.
3. **Pure directional** — ONLY in obscure sub-markets where public info is sparse. World Cup QFs do NOT qualify.

Pure research-driven directional = **worst choice**. LLM reasoning + web search = what everyone else is doing. Edge disappears fast on high-profile markets.

### Risk Management (Non-Negotiable)
- Hard daily loss limit: 1-2% of bankroll, kill switch halts ALL trading
- Per-market cap: 5-8% of bankroll max, lower on illiquid
- No markets with < $50K-100K open interest (unless market-making)
- Mandatory cooldown after 3 consecutive losses
- Separate "research" vs "live" mode — never same agent generates ideas AND executes without human review initially
- Fractional Kelly with very conservative edge estimates
- "Most AI systems dramatically overestimate edge"

### Biggest Risks
1. **Model risk / regime shifts** — LLMs bad at black swans, referee decisions, narrative moves
2. **Execution/infrastructure bugs** — wrong order type, failed reconnects, duplicate orders, auth drift. "These have bankrupted people."
3. **Adverse selection** — sharpest money moves first, you get the other side of informed flow
4. **Overfitting + look-ahead bias** in backtesting
5. **Autonomy failure** — no concept of "stop and reassess," will double down or find worse markets
6. **Fees + bid-ask** add up fast when you're not the best player

### Realistic Expectations
- Liquid Kalshi markets = fairly efficient
- Professional operations target low double-digit returns at best, high variance
- Most retail/semi-automated efforts LOSE money
- "Expect to lose 20-50%+ before you figure out whether you have anything"
- Won't outperform well-capitalized teams on World Cup

### Architecture Recommendation
- Separate data ingestion (WebSocket + REST, redundant)
- **Risk engine sits IN FRONT of every order** (most important component)
- Execution engine with circuit breakers
- Research/alpha module that can be disabled independently
- Full audit logging of every decision + prompt
- Paper trading that mirrors live exactly
- "Risk engine and kill switches matter more than alpha generator"

### World Cup QFs
- "Terrible places to look for edge right now"
- Decent liquidity, heavily followed
- Obvious statistical edges (ELO, xG) already priced in
- Unless you have proprietary data (injuries, motivation, weather), "you're just gambling"

### Bottom Line
- Paper trade for 2-3 months minimum across many markets
- Track every trade with expected edge vs realized results
- If can't show consistent positive expectancy in paper, DO NOT go live
- "Most people never reach that point"
- If Jason proceeds: first $5-10K = pure tuition money, expect to lose it

---

*Grok was aggressively negative. Valid concerns. Need to weigh against Claude's input and Jason's risk tolerance.*
