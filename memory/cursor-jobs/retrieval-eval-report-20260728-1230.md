# Retrieval Eval Report — 20260728-1230

- **Runner:** `scripts/retrieval-eval.mjs`
- **Eval set:** `memory/retrieval-eval-set-v1.md`
- **openclaw:** `/home/mrbig3/.npm-global/bin/openclaw`
- **Facts scored:** 15
- **support@3 note:** weak proxy — Y if hit@3 and matched hit snippet is non-empty; N on miss.
- **Filtered drops:** `memory/dreaming/**`, `memory/.dreams/**`, `DREAMS.md`, `memory/candidates/**`, `memory/retrieval-eval-set-v1.md`

## Overall

| Mode | hit@1 | hit@3 | support@3 | errors |
|------|-------|-------|-----------|--------|
| raw | 5/15 (0.33) | 8/15 (0.53) | 8/15 (0.53) | 0 |
| filtered | 8/15 (0.53) | 9/15 (0.60) | 9/15 (0.60) | 0 |

## Per category

| Category | Mode | hit@1 | hit@3 | support@3 | n |
|----------|------|-------|-------|-----------|---|
| current_ops | raw | 1/4 (0.25) | 2/4 (0.50) | 2/4 (0.50) | 4 |
| current_ops | filtered | 2/4 (0.50) | 2/4 (0.50) | 2/4 (0.50) | 4 |
| recent_events | raw | 0/2 (0.00) | 0/2 (0.00) | 0/2 (0.00) | 2 |
| recent_events | filtered | 0/2 (0.00) | 1/2 (0.50) | 1/2 (0.50) | 2 |
| durable_facts | raw | 2/5 (0.40) | 4/5 (0.80) | 4/5 (0.80) | 5 |
| durable_facts | filtered | 4/5 (0.80) | 4/5 (0.80) | 4/5 (0.80) | 5 |
| procedures | raw | 1/2 (0.50) | 1/2 (0.50) | 1/2 (0.50) | 2 |
| procedures | filtered | 1/2 (0.50) | 1/2 (0.50) | 1/2 (0.50) | 2 |
| historical_narrative | raw | 1/2 (0.50) | 1/2 (0.50) | 1/2 (0.50) | 2 |
| historical_narrative | filtered | 1/2 (0.50) | 1/2 (0.50) | 1/2 (0.50) | 2 |

## Per fact

| ID | Category | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | support@3 (filt) | error | top raw paths |
|----|----------|-----------|-----------|------------|------------|------------------|-------|---------------|
| F01 | durable_facts | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-24.md; 3. memory/2026-07-22.md |
| F02 | durable_facts | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-28.md; 3. memory/2026-06-23-wallet-v2.md |
| F03 | durable_facts | Y | Y | Y | Y | Y |  | 1. memory/research-2026-07-11-grok-4.5.md; 2. memory/dreaming/light/2026-05-21.md; 3. memory/dreaming/light/2026-07-28.md |
| F04 | durable_facts | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/jason-business-context.md; 3. memory/dreaming/light/2026-06-25.md |
| F05 | current_ops | Y | Y | Y | Y | Y |  | 1. memory/procedural-memory-v1.md; 2. memory/claim-ledger.md; 3. memory/procedural-memory-v1.md |
| F06 | historical_narrative | Y | Y | Y | Y | Y |  | 1. MEMORY.md; 2. memory/dreaming/light/2026-07-28.md; 3. memory/dreaming/light/2026-07-28.md |
| F07 | procedures | Y | Y | Y | Y | Y |  | 1. memory/procedural-memory-v1.md; 2. MEMORY.md; 3. memory/quorra-arbitrage-2026-06-22.md |
| F08 | recent_events | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md |
| F09 | current_ops | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md |
| F10 | current_ops | N | Y | Y | Y | Y |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/dreaming/light/2026-07-28.md; 3. memory/claim-ledger.md |
| F11 | current_ops | N | N | N | N | N |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/retrieval-eval-set-v1.md; 3. memory/retrieval-eval-set-v1.md |
| F12 | recent_events | N | N | N | Y | Y |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/dreaming/light/2026-06-05.md; 3. memory/security-audit-2026-05-29.md |
| F13 | durable_facts | Y | Y | Y | Y | Y |  | 1. MEMORY.md; 2. memory/retrieval-eval-set-v1.md; 3. memory/2026-07-28.md |
| F14 | procedures | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md |
| F15 | historical_narrative | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md |
