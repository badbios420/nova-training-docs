# Kalshi Bot Research Session 1 — 2026-07-07

## Technical Research Summary

### Kalshi API Architecture
- **REST API v2**: `https://external-api.kalshi.com/trade-api/v2`
- **WebSocket**: Real-time market data + order updates
- **Auth**: RSA-PSS SHA-256 signing (Key ID + private key)
- **Demo environment**: Paper trading with mock funds
- **Python SDKs**: `kalshi_python_sync` / `kalshi_python_async` (official)
- **OpenAPI spec**: `docs.kalshi.com/openapi.yaml` (source of truth)

### Rate Limits (Token Bucket)
| Tier | Read | Write |
|------|------|-------|
| Basic (default) | 200 | 100 |
| Advanced | 300 | 300 |
| Expert | 600 | 600 |
| Premier | 1,000 | 1,000 |
| Paragon | 2,000 | 2,000 |
| Prime | 4,000 | 4,000 |
| Prestige | 6,000 | 8,000 |

- Most requests cost 10 tokens
- Write bucket can burst 2x refill rate
- 429 = back off (no Retry-After header, use exponential backoff)
- Higher tiers earned via 30-day trailing volume share

### Strategy Options (Research Findings)

#### 1. Cross-Platform Arbitrage (Kalshi ↔ Polymarket)
- Buy YES on one, NO on other when combined < $1.00
- Typical edges: 1-5% per trade
- **Pros**: Near risk-free, consistent
- **Cons**: Small, fleeting, requires $2-5K+ capital, bot competition fierce
- Polymarket often leads Kalshi in price discovery
- World Cup: 5-8 cent gaps appear occasionally but close fast

#### 2. Model vs Market Mispricing (Directional)
- Compare Kalshi prices to independent forecasts/models
- Trade when gap exceeds threshold (5+ cents after spreads)
- **Pros**: Higher upside, can use LLM research as edge
- **Cons**: Most strategies lose money, markets are efficient
- Weather markets: quantifiable (GFS/ECMWF ensembles)
- Sports: edge from faster info (injuries, lineups, form)

#### 3. Market Making
- Post bids/asks to capture spread
- **Pros**: 24/7 operation, emotionless
- **Cons**: Inventory risk, needs capital, competition

#### 4. AI/LLM-Enhanced (Our approach)
- Use Nova's research as "alpha signal"
- Ensemble probability scoring + edge detection
- **Pros**: Unique edge (LLM synthesis > pure quant on qualitative events)
- **Cons**: Hard to validate, LLM reasoning ≠ true probability edge

### Kelly Criterion for Prediction Markets

**Formula (binary markets):** f = (q - p) / (1 - p)
- q = your estimated probability
- p = market price

**Example:**
- Market price: 0.28 (28¢)
- Your estimate: 0.44 (44%)
- Full Kelly: 22.2% of bankroll
- Half Kelly: 11.1% (recommended)
- Quarter Kelly: 5.6% (conservative)

**Rules:**
- Only bet if q > p (positive EV)
- Use fractional Kelly (half or quarter) for safety
- Track calibration over time
- Dynamic — reassess after every bet

### Market Efficiency Reality Check
- Kalshi markets are HIGHLY efficient (aggregates crowd wisdom)
- Arbitrage opportunities: rare, 1-5%, fleeting
- Most retail traders lose money
- Bots dominate — competing against funded quant operations
- Backtests show most strategies lose (500 weather bot backtests — most negative)
- World Cup specifically: $1B+ volume, very efficient
- Lower-liquidity markets (weather, econ data) = more inefficiency

### Key Risks Identified
1. **Market efficiency** — edges are small (1-5%), hard to find consistently
2. **Execution risk** — API failures, slippage, rate limits
3. **Capital requirements** — arbitrage needs $2-5K+ for meaningful returns
4. **Competition** — quant bots with better funding and speed
5. **LLM limitation** — research synthesis ≠ true probability edge
6. **Loss of capital** — automated gambling can lose fast
7. **Liquidity** — many markets too thin to trade profitably

### Open Source Bots Found
| Bot | Focus | Lang |
|-----|-------|------|
| kalshi-ai-trading-bot | AI strategies, LLM integration | Python |
| kalshi-trading-bot-cli | AI research → edge → execution | Python |
| prediction-market-arbitrage-bot | Cross-platform arb | Python |
| polymarket-arbitrage | 10K+ market monitoring | Python |
| Polymarket-Kalshi-Arbitrage-bot | High-perf arb | Rust |
| OctoBot-Prediction-Market | Copy trading + arb | Python |

### Recommended Bot Architecture
```
┌──────────────────┐
│  Market Scanner   │  ← Poll/WebSocket all Kalshi markets
│  (data ingest)    │
└────────┬─────────┘
         │ live prices, volumes
         ▼
┌──────────────────┐
│  Signal Generator │  ← Nova research + model comparison
│  (alpha engine)   │  ← Kelly sizing calculator
└────────┬─────────┘
         │ picks + confidence + size
         ▼
┌──────────────────┐
│  Risk Manager     │  ← Position limits, daily loss cap
│  (guardrails)     │  ← Kill switch check
└────────┬─────────┘
         │ approved/rejected orders
         ▼
┌──────────────────┐
│  Execution Engine │  ← Kalshi API, order placement
│  (order manager)  │  ← Retry, backoff, error handling
└────────┬─────────┘
         │ fills, positions
         ▼
┌──────────────────┐
│  P&L Tracker      │  ← Trade log, ROI, hit rate
│  (reporting)      │  ← Jason notifications
└──────────────────┘
```

### Waiting On
- Grok 4.3 consultation (subagent running)
- Claude Opus 4.8 consultation (subagent running)

---
*Research by Nova, 2026-07-07. External consultations pending.*
