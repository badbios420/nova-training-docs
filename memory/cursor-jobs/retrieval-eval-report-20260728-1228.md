# Retrieval Eval Report — 20260728-1228

- **Runner:** `scripts/retrieval-eval.mjs`
- **Eval set:** `memory/retrieval-eval-set-v1.md`
- **openclaw:** `/home/mrbig3/.npm-global/bin/openclaw`
- **Facts scored:** 2
- **support@3 note:** weak proxy — Y if hit@3 and matched hit snippet is non-empty; N on miss.
- **Filtered drops:** `memory/dreaming/**`, `memory/.dreams/**`, `DREAMS.md`, `memory/candidates/**`, `memory/retrieval-eval-set-v1.md`

## Overall

| Mode | hit@1 | hit@3 | support@3 | errors |
|------|-------|-------|-----------|--------|
| raw | 0/2 (0.00) | 2/2 (1.00) | 2/2 (1.00) | 0 |
| filtered | 2/2 (1.00) | 2/2 (1.00) | 2/2 (1.00) | 0 |

## Per category

| Category | Mode | hit@1 | hit@3 | support@3 | n |
|----------|------|-------|-------|-----------|---|
| durable_facts | raw | 0/2 (0.00) | 2/2 (1.00) | 2/2 (1.00) | 2 |
| durable_facts | filtered | 2/2 (1.00) | 2/2 (1.00) | 2/2 (1.00) | 2 |

## Per fact

| ID | Category | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | support@3 (filt) | error | top raw paths |
|----|----------|-----------|-----------|------------|------------|------------------|-------|---------------|
| F01 | durable_facts | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-24.md; 3. memory/2026-07-22.md |
| F02 | durable_facts | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-28.md; 3. memory/2026-06-23-wallet-v2.md |
