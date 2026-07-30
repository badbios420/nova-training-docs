# Retrieval Eval Report — 20260729-2032

- **Runner:** `scripts/retrieval-eval.mjs`
- **Eval set:** `memory/retrieval-eval-set-v1.md`
- **openclaw:** `/home/mrbig3/.npm-global/bin/openclaw`
- **Facts scored:** 3
- **support@3 note:** weak proxy — Y if hit@3 and matched hit snippet is non-empty; N on miss.
- **Filtered drops:** `memory/dreaming/**`, `memory/.dreams/**`, `DREAMS.md`, `memory/candidates/**`, `memory/retrieval-eval-set-v1.md`

## Overall

| Mode | hit@1 | hit@3 | support@3 | errors |
|------|-------|-------|-----------|--------|
| raw | 1/3 (0.33) | 2/3 (0.67) | 2/3 (0.67) | 0 |
| filtered | 3/3 (1.00) | 3/3 (1.00) | 3/3 (1.00) | 0 |

## Per category

| Category | Mode | hit@1 | hit@3 | support@3 | n |
|----------|------|-------|-------|-----------|---|
| durable_facts | raw | 1/3 (0.33) | 2/3 (0.67) | 2/3 (0.67) | 3 |
| durable_facts | filtered | 3/3 (1.00) | 3/3 (1.00) | 3/3 (1.00) | 3 |

## Per fact

| ID | Category | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | support@3 (filt) | error | top raw paths |
|----|----------|-----------|-----------|------------|------------|------------------|-------|---------------|
| F01 | durable_facts | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. MEMORY.md; 3. memory/dreaming/light/2026-07-24.md |
| F02 | durable_facts | N | N | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-29.md; 3. memory/dreaming/light/2026-07-28.md |
| F03 | durable_facts | Y | Y | Y | Y | Y |  | 1. memory/research-2026-07-11-grok-4.5.md; 2. memory/dreaming/light/2026-05-21.md; 3. memory/dreaming/light/2026-07-28.md |
