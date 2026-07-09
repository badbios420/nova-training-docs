# Project: Kalshi Trading Bot

**Created:** 2026-07-07
**Status:** RESEARCH & DESIGN PHASE
**Owner:** Jason (human) + Nova (bot builder/operator)
**Risk Level:** HIGH — automated gambling with real money

---

## Project Goal

Build an AI-powered automated trading bot for Kalshi prediction markets, with Nova's research/analysis as the alpha signal. Start with World Cup 2026, expand to baseball and other markets.

## Phased Approach

### Phase 1: Paper Trading (ZERO RISK) — CURRENT
- [ ] Jason creates Kalshi demo API keys
- [ ] Build bot scaffold (auth, market data, order placement)
- [ ] Implement strategy: research-driven directional betting
- [ ] Run against live data with fake money for 1-2 weeks
- [ ] Track hit rate, ROI, strategy effectiveness

### Phase 2: Micro-Stakes Production
- [ ] Demo proven profitable
- [ ] Jason provides production API keys (encrypted storage)
- [ ] Hard caps: $50-100 max position, daily loss limit
- [ ] Every trade reported to Jason
- [ ] Kill switch accessible anytime

### Phase 3: Scale
- [ ] Phase 2 profitable over sustained period
- [ ] Increase position sizes gradually
- [ ] Add markets: baseball, politics, crypto, etc.
- [ ] Full autonomous operation within guardrails

## Architecture (Tentative)

```
┌─────────────────┐
│  Nova Research   │  ← Web search, match analysis, odds comparison
│  (LLM Alpha)     │
└────────┬────────┘
         │ picks + confidence
         ▼
┌─────────────────┐
│  Strategy Engine │  ← Kelly sizing, risk management, edge detection
│  (Python)        │
└────────┬────────┘
         │ orders
         ▼
┌─────────────────┐
│  Kalshi API      │  ← REST + WebSocket, RSA-signed
│  (SDK)           │
└─────────────────┘
```

## Key Files
- `research/` — research sessions, strategy docs, external model consultations
- `scripts/` — bot code
- `config/` — API keys (encrypted), strategy params
- `logs/` — trade logs, P&L tracking

## External Consultations
- Grok 4.3 — aggressive skeptic, risk assessment
- Claude Opus 4.8 — architecture, strategy design
- GPT (via Jason) — meta-analysis, system critique

## Safety Rules
1. NEVER start in production without demo proof
2. NEVER exceed position size limits
3. NEVER trade markets not on the approved list
4. ALWAYS log every trade
5. ALWAYS report to Jason
6. Kill switch = Jason says stop → bot stops immediately
