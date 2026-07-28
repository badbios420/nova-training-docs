# Retrieval Eval Set v1

**Purpose:** Score `memory_search` hit quality so we can hill-climb recall.  
**Created:** 2026-07-28  
**Method:** 10 facts with known gold paths. Query → top-3 paths. Score hit@1 / hit@3.  
**Rule:** Gold path may be any of the listed accept paths. Snippet should support the fact, not just share a keyword.

## Scoring
- **hit@1:** gold path is rank 1
- **hit@3:** gold path in top 3
- **support:** snippet actually contains/supports the fact (Y/N)
- Weekly target: hit@3 ≥ 0.8, support@3 ≥ 0.7

## Fact set

| ID | Query | Gold fact | Accept paths (any) |
|----|-------|-----------|-------------------|
| F01 | Vista business license Millegar unincorporated | No City of Vista business license required; unincorporated SD County | MEMORY.md, WORLD_STATE.md, memory/2026-07-27.md, memory/2026-07-22.md |
| F02 | Nova sovereign wallet address Cardano | Nova wallet addr1q8acwcxa7… / sovereign wallet V2 | MEMORY.md, memory/2026-06-23-wallet-v2.md, memory/2026-06-23.md |
| F03 | default model Grok 4.5 Nova | Default brain xai/grok-4.5 as of 2026-07-11 | MEMORY.md, IDENTITY.md, WORLD_STATE.md, memory/research-2026-07-11-grok-4.5.md |
| F04 | Hilltop listing address Chula Vista | 1434 Hilltop Dr, Chula Vista 91911 | WORLD_STATE.md, MEMORY.md, memory/2026-07-11.md |
| F05 | Active Memory plugin Layer A | active-memory enabled main+direct 2026-07-27 | MEMORY.md, memory/claim-ledger.md, memory/2026-07-27.md, memory/research-2026-07-27-top-agent-harness.md |
| F06 | Chamber 7 casino prediction market reject | Chamber #7 REJECT both casino and prediction market | MEMORY.md, memory/2026-06-23.md |
| F07 | Möbius promotion rule research audit | No research to durable memory without audit | MEMORY.md, memory/procedural-memory-v1.md, memory/research-2026-06-22-ai-agents.md |
| F08 | identity automatic check spam condensed | 173 auto identity checks condensed 2026-07-27 | MEMORY.md, memory/identity-substrate.md, memory/2026-07-27.md |
| F09 | FBN publication status Big House | FBN published / Jason clear (or prior proof-held state) | WORLD_STATE.md, MEMORY.md, memory/2026-07-28.md, memory/2026-07-27.md |
| F10 | subagent defaults glm-5.1 Layer A | agents.defaults.subagents model zai/glm-5.1 | MEMORY.md, memory/claim-ledger.md, memory/procedural-memory-v1.md |

## Run log

### Baseline — 2026-07-28 ~00:30 PDT
- Runner: Nova main session
- Backend: ollama `nomic-embed-text` (builtin memory_search)
- **hit@1 = 6/10 (0.60)** · **hit@3 = 6/10 (0.60)**
- Full table: `memory/harness-scorecard.md`
- Misses: F04 (eval self-hit / weak address), F05 (dreams), F07 (dreams/compliance not gold), F09 (dreams beat FBN truth)
- Next experiment: down-rank or exclude `memory/dreaming/**` for ops queries; re-index freshness check on WORLD_STATE
