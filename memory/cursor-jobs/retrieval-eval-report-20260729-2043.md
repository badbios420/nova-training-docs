# Retrieval Eval Report — 20260729-2043

- **Runner:** `scripts/retrieval-eval.mjs`
- **Eval set:** `memory/retrieval-eval-set-v1.md`
- **openclaw:** `/home/mrbig3/.npm-global/bin/openclaw`
- **Facts scored:** 15
- **support@3 note:** weak proxy — Y if hit@3 and matched hit snippet is non-empty; N on miss.
- **Filtered drops (canonical):** `memory/dreaming/**`, `memory/.dreams/**`, `DREAMS.md`, `memory/candidates/**`, `memory/retrieval-eval-set-v1.md`, `memory/MEMORY-archive-*`, `*-training-docs/**`, `memory/cursor-jobs/**`, `memory/evals/**`
- **opsPrefer (secondary):** after filter, equal-score ties prefer WORLD_STATE / MEMORY / today daily / ops-fact-cards. Canonical meter = filtered.

## Overall

| Mode | hit@1 | hit@3 | support@3 | errors |
|------|-------|-------|-----------|--------|
| raw | 5/15 (0.33) | 7/15 (0.47) | 7/15 (0.47) | 0 |
| filtered | 9/15 (0.60) | 10/15 (0.67) | 10/15 (0.67) | 0 |
| opsPrefer | 9/15 (0.60) | 10/15 (0.67) | 10/15 (0.67) | 0 |

## Per category

| Category | Mode | hit@1 | hit@3 | support@3 | n |
|----------|------|-------|-------|-----------|---|
| current_ops | raw | 1/4 (0.25) | 2/4 (0.50) | 2/4 (0.50) | 4 |
| current_ops | filtered | 2/4 (0.50) | 2/4 (0.50) | 2/4 (0.50) | 4 |
| recent_events | raw | 2/2 (1.00) | 2/2 (1.00) | 2/2 (1.00) | 2 |
| recent_events | filtered | 2/2 (1.00) | 2/2 (1.00) | 2/2 (1.00) | 2 |
| durable_facts | raw | 1/5 (0.20) | 1/5 (0.20) | 1/5 (0.20) | 5 |
| durable_facts | filtered | 3/5 (0.60) | 4/5 (0.80) | 4/5 (0.80) | 5 |
| procedures | raw | 1/2 (0.50) | 2/2 (1.00) | 2/2 (1.00) | 2 |
| procedures | filtered | 2/2 (1.00) | 2/2 (1.00) | 2/2 (1.00) | 2 |
| historical_narrative | raw | 0/2 (0.00) | 0/2 (0.00) | 0/2 (0.00) | 2 |
| historical_narrative | filtered | 0/2 (0.00) | 0/2 (0.00) | 0/2 (0.00) | 2 |

## Per fact

| ID | Category | raw hit@1 | raw hit@3 | filt hit@1 | filt hit@3 | opsP hit@3 | support@3 (filt) | error | top raw paths | top filt paths |
|----|----------|-----------|-----------|------------|------------|------------|------------------|-------|---------------|----------------|
| F01 | durable_facts | N | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-24.md; 3. memory/MEMORY-archive-pre-2026-07-29-inject-trim.md | 1. MEMORY.md; 2. MEMORY.md; 3. memory/2026-07-22.md |
| F02 | durable_facts | N | N | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/dreaming/light/2026-07-29.md; 3. memory/dreaming/light/2026-07-28.md | 1. memory/2026-06-23-wallet-v2.md; 2. memory/10k-nft-research-2026-06-23.md; 3. MEMORY.md |
| F03 | durable_facts | Y | Y | Y | Y | Y | Y |  | 1. memory/research-2026-07-11-grok-4.5.md; 2. memory/dreaming/light/2026-05-21.md; 3. memory/dreaming/light/2026-07-28.md | 1. memory/research-2026-07-11-grok-4.5.md; 2. memory/2026-06-22-consolidation.md; 3. memory/human-intent-ledger.md |
| F04 | durable_facts | N | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/retrieval-eval-set-v1.md |  |
| F05 | current_ops | Y | Y | Y | Y | Y | Y |  | 1. memory/claim-ledger.md; 2. memory/procedural-memory-v1.md; 3. MEMORY.md | 1. memory/claim-ledger.md; 2. memory/procedural-memory-v1.md; 3. MEMORY.md |
| F06 | historical_narrative | N | N | N | N | N | N |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/MEMORY-archive-pre-2026-07-29-inject-trim.md; 3. memory/dreaming/light/2026-07-28.md |  |
| F07 | procedures | Y | Y | Y | Y | Y | Y |  | 1. memory/procedural-memory-v1.md; 2. memory/MEMORY-archive-pre-2026-07-29-inject-trim.md; 3. memory/MEMORY-archive-pre-2026-07-29-inject-trim.md | 1. memory/procedural-memory-v1.md; 2. memory/quorra-nuggets-2026-06-23.md; 3. memory/quorra-arbitrage-2026-06-22.md |
| F08 | recent_events | Y | Y | Y | Y | Y | Y |  | 1. memory/identity-substrate.md; 2. memory/retrieval-eval-set-v1.md; 3. memory/identity-substrate.md | 1. memory/identity-substrate.md; 2. memory/identity-substrate.md; 3. memory/ops-fact-cards-v1.md |
| F09 | current_ops | N | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/retrieval-eval-set-v1.md; 3. memory/dreaming/light/2026-07-12.md |  |
| F10 | current_ops | N | Y | Y | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-28.md; 2. memory/retrieval-eval-set-v1.md; 3. MEMORY.md | 1. MEMORY.md; 2. memory/procedural-memory-v1.md; 3. memory/claim-ledger.md |
| F11 | current_ops | N | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md |  |
| F12 | recent_events | Y | Y | Y | Y | Y | Y |  | 1. memory/ops-fact-cards-v1.md; 2. memory/retrieval-eval-set-v1.md; 3. memory/dreaming/light/2026-06-05.md | 1. memory/ops-fact-cards-v1.md; 2. memory/security-audit-2026-05-29.md; 3. memory/claim-ledger.md |
| F13 | durable_facts | N | N | N | Y | Y | Y |  | 1. memory/dreaming/light/2026-07-29.md; 2. memory/MEMORY-archive-pre-2026-07-29-inject-trim.md; 3. memory/2026-07-28.md | 1. memory/2026-07-28.md; 2. MEMORY.md |
| F14 | procedures | N | Y | Y | Y | Y | Y |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/ops-fact-cards-v1.md; 3. memory/retrieval-eval-set-v1.md | 1. memory/ops-fact-cards-v1.md; 2. memory/procedural-memory-v1.md; 3. memory/procedural-memory-v1.md |
| F15 | historical_narrative | N | N | N | N | N | N |  | 1. memory/retrieval-eval-set-v1.md; 2. memory/retrieval-eval-set-v1.md |  |
