# Research — Multi-Subagent Architecture (Chamber #10 intake)

**Status:** CHAMBER CLOSED — see memory/chambers/chamber-10-verdict.md
**Date:** 2026-07-31 ~23:50 PDT
**Promotion:** 0 durable MEMORY promotions until chamber audit closes
**Related:** docs/chamber-protocol-v0.1.md · memory/research-2026-07-27-top-agent-harness.md · memory/research-2026-07-31-deepseek.md · openclaw docs/tools/subagents.md

## Question
Best practical multi-subagent architecture for Nova on OpenClaw so main agent can run multiple specialists simultaneously with verified synthesis (orchestrator / "boss" mode) without safety/cost collapse.

## Direct observations (local, this session)
- Live config:
  - agents.defaults.subagents.model = zai/glm-5.1
  - thinking = low
  - runTimeoutSeconds = 600
  - maxConcurrent = 3
  - delegationMode = suggest
- Nested depth: docs support maxSpawnDepth 1-5; default 1; depth-2 = orchestrator to workers
- maxChildrenPerAgent default 5; global maxConcurrent docs examples up to 8
- sessions_spawn non-blocking; sessions_yield wait; isolated default
- Subagents lack session/message tools by default
- Harness live: C1-C8

### Chamber #10 live spawn results (critical evidence)
| Seat | Model | Result |
|------|-------|--------|
| Structural A | anthropic/claude-opus-4-8 | FAIL — Anthropic credit balance too low |
| Workhorse A | zai/glm-5.1 | FAIL — ZAI billing insufficient |
| Structural B | zai/glm-5.2 | FAIL — ZAI billing insufficient |
| Skeptic | deepseek/deepseek-v4-flash | OK — full report |
| Structural C | deepseek/deepseek-v4-flash | pending |
| Workhorse B | deepseek/deepseek-v4-flash | pending |
| Chair | xai/grok-4.5 | OK |

Architecture implication: multi-provider billing failover is first-class, not optional. Config still points default workers at a dry ZAI key — boss mode is broken until defaults or balances change.

## Secondary research (untrusted web — directional)
- 2026 production default: supervisor + workers + verifier (maker-checker)
- Fan-out/fan-in for independent work; pipeline for dependent; debate for high-stakes
- Failure modes: supervisor bottleneck, verifier loops, cost blowup, cascading errors
- OpenClaw: coordinator + cheap workers; narrow scopes; timeouts; validate before act
- Citations: docs.openclaw.ai/tools/subagents; Microsoft AI agent design patterns; beam/digitalapplied pattern roundups

## Standing fences
1. Default brain remains xai/grok-4.5 until Jason opens 4.6 path
2. DeepSeek Flash = cheap worker only
3. No wallet/secrets/full-memory to untrusted worker APIs
4. Gen→Verify stays (Proc 11)
5. Config writes = Jason-approved proposals with old/new + readback
6. Cash: small bake-offs; no swarm FOMO

## Hypotheses
- H1: Depth-1 fan-out is enough for ~80% boss-mode value
- H2: maxConcurrent 3→4/5 is high-leverage after playbook exists
- H3: Dual cheap lane beats premature single flip — BUT live evidence says GLM lane is currently dead on billing
- H4: Structured spawn briefs + verifier beat more model variety
- H5: Provider health probe must gate spawns

## Outputs
- Chamber: memory/chambers/chamber-10-subagent-architecture-2026-07-31.md
- This research file
- Possible later: docs/harness/subagent-swarm-playbook-v0.md (only if PROMOTE)

## Update 2026-08-01 00:08 PDT
- Jason rotated ZAI key + topped up a few dollars.
- Live spawn smoke zai/glm-5.1: PASS (ZAI_SMOKE_OK).
- Default subagent lane no longer billing-dead. Dual-lane bake-off unblocked when opened.
