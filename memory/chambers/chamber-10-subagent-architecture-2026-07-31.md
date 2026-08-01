# Chamber #10 — Multi-Subagent Architecture — 2026-07-31 23:48 PDT

**Status:** IN PROGRESS  
**Chair:** Nova (xai/grok-4.5)  
**Trigger:** Jason — design best subagent architecture; multi-parallel; god-tier orchestrator; mix fresh research; APIs available may need modify

## Question
How should Nova design and (phased) implement a multi-subagent architecture so the main agent can reliably run multiple specialists in parallel, synthesize verified results, and operate at top-tier orchestrator quality — without wrecking cost, safety, or continuity?

## Hard constraints (Chair)
1. Chamber protocol v0.1: real model outputs labeled; no fake consensus; verification > debate
2. Protected settings: default brain stays Grok; no silent config mutation; proposals only
3. OpenClaw native: sessions_spawn + sessions_yield; isolated default; no poll loops
4. Cash tight: cheap workers; expensive verify; no FOMO spend
5. Trust fence: DeepSeek Flash = worker only; never wallet/memory-brain/sole verifier
6. Family/ops privacy: no full MEMORY/WORLD_STATE dumps to untrusted APIs
7. Flat hierarchy default today: maxSpawnDepth effectively 1 unless we propose 2
8. Live config (read 2026-07-31): subagents.model=zai/glm-5.1; thinking=low; runTimeoutSeconds=600; maxConcurrent=3; delegationMode=suggest

## Live model inventory (access, not quality ranking)
| Lane | Model | Role candidate | Access note |
|------|-------|----------------|-------------|
| Chair | xai/grok-4.5 | orchestrator / synthesizer | session default |
| Worker default | zai/glm-5.1 | bulk subagents | config default |
| Structural | zai/glm-5.2 / anthropic claude | design critique | aliases GLM-5.2 / opus / claude |
| Cheap swarm | deepseek/deepseek-v4-flash | parallel grunt | wired 7/31; manual lane; PONG smoke |
| Fallback ladder | openrouter/auto, glm-5.1, opus | resilience | OpenRouter 402 parked historically |
| Research tools | web_search / web_fetch | scout | TOOL OUTPUT |

## Fresh research notes (TOOL OUTPUT — untrusted web, 2026-07-31)
### Industry pattern (web_search)
- Dominant production pattern 2026: **supervisor + workers + verifier** (maker-checker)
- Complement: fan-out/fan-in for independent parallel; pipeline for dependent stages; debate/council for high-stakes
- Failure modes: supervisor bottleneck/context overflow; verifier infinite loops; cost blowup; cascading errors
- Advice: start simple single agent; add agents only when measurable; max iterations on verify loops
- Sources (secondary): digitalapplied multi-agent patterns; beam.ai production patterns; Microsoft AI agent design patterns

### OpenClaw-specific (docs + web_search)
- sessions_spawn non-blocking; completion push-based; sessions_yield wait primitive
- isolated vs fork context; prefer isolated + clear task brief
- maxConcurrent global lane cap; maxSpawnDepth default 1, can set 2 for orchestrator→workers
- maxChildrenPerAgent default 5; nesting depth-2 leaf cannot spawn
- Subagents lack session/message tools by default (good blast-radius)
- Cheap model on workers, premium on chair
- Local docs: openclaw docs/tools/subagents.md (658 lines)
- Prior Nova research 7/27: supervisor+specialists+verifier; filesystem/git as shared state; Gen→Verify already in harness (C1–C8)

## Prior durable stack (already built — do not redesign away)
- C1 task grade · C2 claim-guard · C3 retrieval eval · C4 memory health · C5 trajectory closeout · C6 verifier-pass skill · C7 meters · C8 wiki ops
- Procedures 11 (Gen→Verify), 13 closeout, 14 ops-first
- Chamber protocol itself is multi-model consultation (not the same as runtime swarm)

## Consultants planned
1. REAL MODEL — Structural Architect (claude/opus or glm-5.2)
2. REAL MODEL — Cheap-worker skeptic / cost+trust (deepseek flash)
3. REAL MODEL — Implementation workhorse (glm-5.1 default)
4. TOOL OUTPUT — docs + config + web_search (chair-gathered above)

## Promotion bar
- PROMOTE only phased architecture + measurable acceptance tests
- HOLD anything needing config depth/concurrency changes until Jason approves exact values
- REJECT mythology, unbounded swarm, DeepSeek-as-brain, auto MEMORY dumps to workers
