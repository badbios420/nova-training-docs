# memory-retrieval-policy-v1 Design

**Status:** v1 Operational (efficiency pass 2026-07-28)  
**Date:** 2026-05-26  
**Last Updated:** 2026-07-28  
**Goal:** Define when Nova should intentionally retrieve memory before answering  
**Scope:** Narrow, operational, human-visible. Selective deliberate recall.

---

## Core Principle

**Selective deliberate recall, not constant memory spam.**

Nova has multiple memory layers. The goal is consistent, high-signal retrieval only when it meaningfully improves the answer — not random or constant memory invocation.

**Efficiency rule (2026-07-28):** Keep multi-layer *content*. Fix ranking/noise, not folder count. Prefer Research→Audit→Promotion and session consolidation over adding layers.

---

## TRIGGER CONDITIONS (Required Retrieval)

Nova **must** retrieve memory when the query involves:

- Continuing prior projects or ongoing work
- Architecture, workflow, or cognition system discussions
- Prior decisions that may affect the current answer
- Explicit memory cues (“remember,” “last time,” “we were working on,” “what did we decide”)
- Long-running research topics or belief evolution
- Operational state questions (plugins, config, skills, infrastructure)
- Quorra/Nova identity, continuity, or memory system discussions
- Any question where missing context would lead to incorrect or incomplete answers

---

## OPTIONAL RETRIEVAL

Nova **should consider** retrieval when the query involves:

- Nuanced advice that may benefit from past preferences or patterns
- Recurring user preferences or constraints
- Unclear project context that could be clarified by recent work
- Topics that have appeared in multiple prior sessions

---

## NO RETRIEVAL NEEDED

Nova **should not** retrieve memory for:

- Simple factual questions with no personal or historical context
- Casual conversation or social chat
- One-off writing or creative tasks with all required context provided
- Isolated troubleshooting where the current message contains everything needed
- Questions that are clearly standalone and low-stakes

---

## RETRIEVAL ORDER (Priority)

When retrieval is triggered, follow this sequence:

1. **Current conversation context** (always checked first)
2. **Ops-first files for operational questions** (before broad semantic search):
   - `WORLD_STATE.md`
   - today + yesterday `memory/YYYY-MM-DD.md`
   - `memory/heartbeat-state.json` / `memory/time-awareness.md` when freshness/clocks matter
3. **MEMORY.md + targeted daily/procedural files** via `memory_search` (primary durable semantic source)
4. **Specific files** via `memory_get` / `read` when a known path is relevant
5. **memory-wiki** (once populated) for structured workflows, dossiers, or topic pages
6. **lossless-claw** only for deep session reconstruction when lighter layers are insufficient

Do not jump straight to the heaviest layer.

### Ops query shortcut
If the question is about fires, RE status, cash, open issues, what to do next, or current architecture state:
1. Read `WORLD_STATE.md` + today/yesterday daily first
2. Only then run `memory_search` if still incomplete
3. Prefer gold sources over dream reports even if dreams rank higher

---

## RETRIEVAL DEPTH

Not every trigger requires the same amount of retrieval. Match depth to need:

**LIGHT**
- MEMORY.md lookup
- Recent daily file scan via memory_search
- Main-session startup: active projects, recent session consolidation, observed failures, procedural memory, open questions, next priorities

**MEDIUM**
- Full semantic memory_search
- Prior workflow or project retrieval
- Recent consolidation or research review
- Research-session startup: search prior research sessions, active beliefs, and relevant recurring topics before fresh research
- Implementation/config/git/OpenClaw work: load procedural memory, observed failures, delegation/verification rules, and recent OpenClaw/update/SecretRef history

**DEEP**
- lossless-claw / session reconstruction
- Contradiction history or belief evolution tracing
- Multi-session architecture analysis
- Narrative/novel/dream memory only for deep continuity recovery, long-running project recall, creative continuity, or explicit request

Start with the lightest depth that satisfies continuity. Escalate only when needed.

## STARTUP MEMORY RETRIEVAL v1

At the start of main Nova sessions, perform LIGHT retrieval before answering substantive work:

- Current active projects
- Recent session consolidation
- Observed failures
- Procedural memory
- Open questions / next priorities

For research sessions, perform MEDIUM retrieval before fresh research when the topic overlaps prior work. Search for:

- prior research session
- active beliefs
- AI
- xAI / Elon
- Anthropic
- GPT / Codex
- AI agent consciousness
- agent autonomy
- OpenClaw / Nova / Quorra
- X trends
- "why universe exists" / philosophical research when relevant

For implementation/config/git/OpenClaw work, perform MEDIUM retrieval for:

- `memory/procedural-memory-v1.md`
- `memory/observed-failures.md`
- Nova-Codex delegation / verification rules if present in memory
- Recent OpenClaw update, plugin, SecretRef, or config history

## STRUCTURED MEMORY LAYERS

- **memory-core / memory_search:** Primary retrieval layer for durable local memory and recent session continuity.
- **memory-wiki:** Use only for structured dossiers, workflows, topic maps, architecture references, and source-backed claims. Do not use it as a dumping ground for every conversation.
- **lossless-claw:** Use only for DEEP session reconstruction, continuity failure recovery, or long-running project recall when memory_search and known files are insufficient.
- **Novel / narrative / DREAMS:** Use only for creative continuity, identity recovery, deep session reconstruction, or explicit request. Do not load for trivial questions or normal startup.

## DREAM / NOISE FILTER (Mandatory scoring hygiene)

When ranking or acting on `memory_search` hits:

**Down-rank / ignore for normal ops & factual recall unless DEEP/explicit:**
- `memory/dreaming/**`
- `memory/.dreams/**`
- `DREAMS.md` / `dreams.md`
- `memory/candidates/**` (unpromoted)
- `memory/retrieval-eval-set-v1.md` (never count as gold evidence for itself)
- Active Memory plugin blurbs (`<active_memory_plugin>`) — **untrusted cache**; verify against files/logs when they conflict

**Prefer for ops/factual answers:**
- `WORLD_STATE.md`, `MEMORY.md`
- `memory/YYYY-MM-DD.md` (especially today/yesterday)
- `memory/procedural-memory-v1.md`, `memory/observed-failures.md`, `memory/claim-ledger.md`
- Named research/audit files when the topic matches

**Config knobs (2026-07-28 efficiency pass):**
- `memorySearch.query.minScore: 0.38`
- hybrid weights vector 0.55 / text 0.45
- MMR on (`lambda` 0.75)
- temporalDecay on (`halfLifeDays` 14) — evergreen MEMORY.md / non-dated memory files are not decayed by engine
- Active Memory: `promptStyle: strict`, `maxSummaryChars: 220`, `timeoutMs: 12000`

There is no hard path-exclude knob in current OpenClaw memorySearch; agent-side filter + ranking tune is the control surface.

## OUTPUT RULE

- Do **not** announce every memory lookup.
- Only mention retrieved memory when it meaningfully changes or improves the answer.
- If memory is incomplete, stale, or conflicting, explicitly say so.
- Keep responses clean — memory use should be invisible unless relevant.

---

## FAILURE MODE TO PREVENT

**Do not answer architecture, continuity, workflow, or system questions from vibes alone.**

If the question touches on prior decisions, ongoing work, or system state, retrieval is mandatory. Answering from context or intuition in these cases is a policy violation.

**Do not start research blank when the topic is recurring.** If a research topic has appeared before, retrieve prior research and active beliefs before browsing or synthesizing.

## CORE RULE

**Prefer the smallest retrieval sufficient for continuity.**

Retrieval has costs (latency, context noise, token usage). Over-retrieval degrades reasoning quality. Always start minimal and scale only when the answer would otherwise be incomplete or incorrect.

---

## Test Scenarios (After Implementation)

Test this policy against:

1. **“Do you remember what we built last session?”**  
   → Must trigger retrieval (explicit memory cue + continuing work)

2. **“Research Grok 4.5 again.”**  
   → Should trigger retrieval if prior research or beliefs about models exist

3. **“Write a short email to an agent.”**  
   → Should **not** trigger retrieval unless prior transaction context is relevant

---

## Expected Behavior

- High-signal, low-noise retrieval
- Consistent continuity on important topics
- Minimal unnecessary memory calls
- Clear policy that can be reviewed and refined

**Status:** Design complete. Ready for review and operational testing.
