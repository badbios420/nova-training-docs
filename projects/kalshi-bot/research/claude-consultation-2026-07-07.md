# Claude Opus 4.8 Consultation — Kalshi Trading Bot

**Date:** 2026-07-07
**Model:** anthropic/claude-opus-4-8
**Runtime:** 8m51s, 48.1k tokens

---

## Key Assessment

> "The hardest part of this project is not the architecture—it's proving you have edge at all. Most of the engineering is well-trodden. The edge question is where projects like this quietly die."

---

## 1. Architecture & Design

Clean separation into independent, testable components:

```
┌─────────────────────────────────────────────────────┐
│                    Orchestrator                       │
│         (scheduler, lifecycle, kill switch)           │
└──────┬───────────────────────────────────┬───────────┘
       │                                    │
┌──────▼────────┐                  ┌────────▼─────────┐
│  Data Layer   │                  │   Execution Layer │
│ - Market feed │                  │ - Order manager   │
│  (WS + REST)  │                  │ - Position tracker│
│ - Research    │                  │ - Reconciliation  │
│  (web/news)   │                  └────────▲─────────┘
│ - Storage     │                           │
└──────┬────────┘                  ┌─────────┴─────────┐
       │                           │  Risk Manager      │
┌──────▼────────┐                  │ (HARD veto power)  │
│ Signal Engine │─────────────────▶│ - Position limits  │
│ - Fair-value  │   proposed       │ - Exposure caps    │
│   estimation  │    orders        │ - Drawdown halts   │
│ - LLM reason  │                  │ - Sanity checks    │
└───────────────┘                  └───────────────────┘
```

**Key design principles:**
- **Risk Manager sits between Signal Engine and Execution as a HARD gate.** Non-negotiable. Architecturally impossible to bypass.
- **Separate "fair value estimation" from "order generation."** Validate estimator independently from trading logic.
- **Everything is event-sourced/logged.** Every market snapshot, LLM call (prompt + response), signal, order, fill. Store in Postgres with millisecond timestamps.
- **Idempotency everywhere.** Orders carry client-generated IDs. Reconcile on restart.
- **The LLM is a component, not the system.** LLM outputs go through validation → structured signal → risk gate. Treat LLM output as untrusted input.

---

## 2. Strategy Development

**a) Fair-value / mispricing** — Estimate P(event) independently, trade when |your_P − market_P| exceeds threshold (after fees, spread, estimation error). Core strategy. Everything hinges on calibration.

**b) Market-making / spread capture** — Post limit orders both sides, earn spread. Different business — inventory management, latency, adverse selection. NOT where LLM has advantage.

**c) Cross-market arbitrage** — Logical relationships that must hold: all "team to win" probabilities sum to ~100% + overround; "win tournament" can't exceed "reach final." **Most defensible edge.** Doesn't require being smarter — just faster and more thorough.

**d) Event-driven / news latency** — React to news faster than market reprices. LLMs + web search could help but competing against fast humans and bots.

**Critical discipline:** Log predicted probability for EVERY market looked at, compare against realized outcomes. If estimates aren't better-calibrated than closing market prices over hundreds of samples, **you have no edge and should not risk money.** This is measurable. Measure it.

---

## 3. Risk Management

**Position sizing — fractional Kelly, 1/4 to 1/5:**
- Full Kelly assumes you know edge precisely. You don't.
- Kelly for binary contracts: `f* = (p·b − q) / b` then multiply by 0.2–0.25
- **Cap any single position at 2–5% of bankroll** regardless of Kelly output

**Hard guardrails (all enforced in Risk Manager):**

| Guardrail | Value |
|---|---|
| Max single position | 2–5% bankroll |
| Max exposure per market/event | 10% |
| Max correlated exposure | 15% |
| Daily loss limit → halt | 5% bankroll |
| Total drawdown → halt & alert | 15–20% |
| Min edge to trade | 5%+ after fees |
| Per-day capital deployment cap | fixed |

**Correlation is the silent killer.** "France to win," "France to reach final," "France-Spain semifinal" are the SAME BET. Risk system must understand correlation and cap aggregate exposure. Naive per-market limits let you accidentally go 40% on France.

**Other essentials:**
- Global kill switch — one command halts all trading
- Dead-man's switch — connectivity loss = stop trading
- Reconciliation on startup — sync with exchange state
- Human approval gate for large actions (initially)
- Circuit breakers on anomalies — impossible price moves, unexpected fills, LLM validation failure → halt

---

## 4. Edge Sustainability (Critical Section)

> "Prediction markets on major, high-volume events are among the most efficient markets that exist. The World Cup winner market has $1B+ volume. Your LLM does not have an information edge on 'who will win the World Cup.' Assume the market price is the best available estimate."

**Where edge realistically might exist:**
- **Low-liquidity / niche markets** — obscure props, smaller markets where sharp money hasn't bothered
- **Cross-market logical arbitrage** — relationships that must hold but temporarily don't
- **Event-driven latency** — reacting to news faster (difficult but possible)
- **Calibration edge on qualitative events** — LLM might be better than crowd on nuanced, hard-to-quantify outcomes

**Where edge does NOT exist:**
- Headline markets (World Cup winner, major elections) — already efficiently priced
- Pure numerical/data markets (weather, CPI) — quant models already dominate
- Speed-dependent strategies — can't compete with HFT infrastructure

---

## 5. Technical Implementation

- **Python SDK vs custom client:** Start with official SDK for speed, move to custom client from OpenAPI spec for production control
- **WebSocket usage:** Essential for real-time. Subscribe to market data + order updates. Use for position tracking and signal triggers
- **Rate limits:** Implement exponential backoff on 429s. Basic tier (100 write tokens/sec) is plenty for low-frequency strategy
- **Failures/retries:** Idempotent order IDs. Exponential backoff. Circuit breaker on repeated failures
- **Database:** Postgres for trade logging, market snapshots, LLM audit trail

---

## 6. Testing & Validation

- **Demo mode first** — paper trade with mock funds. Minimum 2 weeks.
- **Track calibration:** Brier score (mean squared error of probability estimates) vs market
- **Backtest on historical Kalshi data** — use historical data endpoints for settled markets
- **Metrics that matter:**
  - Hit rate (% of trades profitable)
  - ROI (% return on capital deployed)
  - Brier score (calibration quality)
  - Sharpe ratio (risk-adjusted return)
  - Max drawdown
  - Correlation of P&L across positions
- **Minimum sample size:** 50-100 trades before drawing conclusions. Don't trust 10 trades.
- **Forward test in demo for full QF round** before any real money

---

## 7. World Cup Picks

> "Given the current QF matchups and prices, where do you see value?"

Claude's response was truncated here, but key points from earlier context suggest:
- Headline markets (tournament winner) are efficiently priced — no edge
- Value may exist in prop markets (BTTS, over/under, correct score)
- Cross-market arbitrage: check if "France to win" + "France to reach final" + "France-Spain semi" are logically consistent
- Norway vs England: most likely to have mispricing due to Haaland variance

---

## Claude's Bottom Line

1. **Architecture is the easy part.** Edge discovery is the hard part.
2. **Start with cross-market arbitrage** — most defensible, doesn't require being smarter than market
3. **Fractional Kelly (1/4 to 1/5)** for position sizing
4. **Risk Manager as hard architectural gate** — not policy, not bypassable
5. **Log everything** — LLM calls, signals, orders, outcomes. Can't improve what you don't measure
6. **Calibration tracking is mandatory** — if your estimates aren't better than market over hundreds of samples, stop
7. **Treat LLM output as untrusted input** — validation pipeline, not direct execution
8. **Correlation awareness is critical** — don't accidentally go 40% on one outcome across "different" markets

---

*Consultation complete. Awaiting Grok 4.3 response for comparison.*
