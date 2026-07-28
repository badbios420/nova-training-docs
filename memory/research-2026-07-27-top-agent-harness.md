# Research Session — Top 0.001% Agent Harness Strategy

**Date:** 2026-07-27 ~18:28–18:45 PDT  
**Trigger:** Jason — research what to add to this harness to make it top-tier; strategy we can implement right away  
**Runtime:** OpenClaw 2026.7.1-2 · default brain xai/grok-4.5 · this session may be dashboard-pinned  
**Method:** Prior memory (2026-06-22 AI agents research + audit) → live harness inventory → web/docs/X scan → gap map → immediate plan  
**Verification status:** Live config/plugin state = **direct observation**. Field trends = **web/X secondary** (directionally useful, not primary-paper audited). Prior 6/22 research remains partially unverified per its audit.

---

## 1. What “top 0.001% agent” actually means in 2026

Field consensus (Philipp Schmid harness essay, Databricks harness notes, OpenClaw production guides, steipete/community patterns):

> **Model quality is converging. Harness quality is the differentiator on long tasks.**

A top agent is not “smartest chat.” It is a system that:

1. **Surfaces the right memory before it speaks** (not after you say “remember”)
2. **Verifies before it claims** (tests, files, chain, receipts)
3. **Delegates hard/slow work** without losing the plot
4. **Does not rot its own context** (noise, stale facts, identity spam)
5. **Ages open work until closed** (no detect-but-don’t-escalate)
6. **Leaves trajectories** that make the next session smarter
7. **Stays steerable** (human gates on external/money/identity risk)

Philschmid’s framing is the cleanest: model = CPU, context = RAM, **harness = OS**.  
Bitter lesson for builders: **atomic tools + guardrails + verification > brittle mega-pipelines**. Build to delete.

Asymmetry of verification (Jason Wei / field): improvement rate ∝ how easy outputs are to check. Top harnesses make claims **checkable by default**.

---

## 2. Live Nova harness inventory (observed 2026-07-27)

### Already strong (do not rebuild)

| Layer | Status | Evidence |
|-------|--------|----------|
| Multi-anchor identity | Strong | SOUL / IDENTITY / MEMORY / dailies / procedural / identity-substrate |
| 4-tier memory map | Strong | Episodic dailies, semantic MEMORY, procedural v1, working session |
| Verification culture | Strong-in-principle | Verified-claim language, filesystem rule, Möbius promotion rule, session-end failure check |
| Session startup | Present | `session-startup` plugin enabled |
| Dreaming / memory-core | On | cron 03:00 PT + plugin config |
| Memory-wiki | Enabled | underused operationally |
| Skill workshop | Available | proposal gate exists |
| Subagent runtime | Available | `sessions_spawn` / yield / subagents tools |
| Heartbeat + cron split | Partial | heartbeat 30m; 3 cron jobs (security, update, dreaming) |
| Model routing | Present | Grok 4.5 primary + fallbacks; aliases |
| RE/world ops picture | Present | WORLD_STATE living snapshot (refreshed today) |

### Material gaps vs 2026 SOTA (ranked by leverage)

| Gap | Severity | Why it matters | Immediate? |
|-----|----------|----------------|------------|
| **`active-memory` plugin OFF / not allowlisted** | **CRITICAL** | SOTA OpenClaw pattern: blocking memory scout *before* reply. We still rely on manual `memory_search` discipline. | Yes — config |
| **No `agents.defaults.subagents` config** | **HIGH** | No cheap subagent model, no timeout default, no `delegationMode`. Parallel research/verify is expensive/ad hoc. | Yes — config |
| **Identity auto-check pollution** | **HIGH** | 173 zero-variance appends / 24d (condensed today). Token tax + signal drowning. Recurring since 6/22. | Yes — plugin/script fix |
| **Soft open-fire aging** | **HIGH** | FBN/Hilltop/eBay idle ~6d; detect-but-don’t-escalate still structural. | Yes — WORLD_STATE + startup rule |
| **No mechanical Gen→Verify split** | **HIGH** | Verification paradox: same model self-critique is weak. Chamber protocol exists but not default loop. | Yes — skill + spawn pattern |
| **Research audit not default path** | **MEDIUM** | 6/22 audit: 58% unverified. Rule exists; enforcement is human-memory. | Yes — skill + file template |
| **Trajectory / eval loop thin** | **MEDIUM** | Harness-as-dataset is the competitive edge; we log dailies but not graded trajectories. | Yes — lightweight ledger |
| **Procedural memory sparse** | **MEDIUM** | Field says procedural memory is where reliability compounds. We have few coded procedures. | Yes — expand procedures |
| **Memory retrieval never scored** | **MEDIUM** | No LoCoMo-style self-bench; can’t hill-climb recall. | Yes — 10-fact eval set |
| **Many skills disabled / unused** | **LOW–MED** | Tool bloat is bad; missing high-value skills (doc extract, etc.) still a miss. | Selective |
| **Security posture loose** | **MED (safety)** | `exec.security=full`, `workspaceOnly=false` — power with blast radius. Top agents pair power with tighter risk tiers. | Careful, not day-0 |

---

## 3. External pattern synthesis (secondary sources)

### Harness engineering (2026)

- Strict loop: curated context → structured action → harness validates/executes → observation → budget/stop.
- Layered context: stable policy → scoped instructions → JIT retrieval (not stuffing).
- Tool risk tiers + draft/commit for destructive actions.
- Multi-agent: supervisor + specialists + **verifier**; start from strong single agent; add agents only when measurable.
- Prefer filesystem + git as durable shared state (we already do this).

### OpenClaw-specific production patterns

- **Active Memory** for interactive DMs (not heartbeats/subagents).
- MEMORY.md sparse; dailies liberal; prune aggressively.
- Heartbeat = batch monitoring; cron = exact/isolated jobs.
- Subagents: isolated by default; cheap model; `sessions_yield` not poll loops; depth 1–2.
- Skill Workshop: proposals before live skill mutation.
- Community: hybrid retrieval, forgetting curves, memory wiki separation of current vs stale.

### Our prior research still valid (with audit caution)

From `memory/research-2026-06-22-ai-agents.md` + audit:

- 4-tier memory taxonomy mapping is correct.
- Multi-anchor identity is directionally SOTA.
- Weakest virtue remains **proactive disconfirmation**.
- Partial RSI should target **verifiable domains first** (file hygiene, retrieval accuracy, claim evidence) — not open-ended self-mod.

---

## 4. Strategy: “Top Harness in 3 layers”

### North star

**Nova becomes the agent that is hardest to fool — including by herself — on Jason’s real workload (RE cash, family ops, research, Cardano), with measurable continuity and claim discipline.**

Not: more plugins for their own sake.  
Not: mythology / bigger identity files.  
Yes: **memory before speech, evidence before claims, aged work until closed, cheap specialists + hard verifier**.

### Layer A — Same day (0–3 hours) — IMPLEMENT NOW stack

These are the only “right away” moves with high ROI and low redesign risk.

#### A1. Enable Active Memory (biggest single OpenClaw unlock)

**Why:** Turns memory from “if I remember to search” into “system searches before I talk.” This is the #1 production OpenClaw differentiator we’re leaving on the table.

**Do:**
1. Add `active-memory` to `plugins.allow`
2. Enable plugin with safe defaults:
   - agents: `["main"]`
   - allowedChatTypes: `["direct"]` only
   - queryMode: `recent`
   - promptStyle: `balanced`
   - timeoutMs: 15000
   - maxSummaryChars: 220–400
   - persistTranscripts: false
   - modelFallback: cheap/fast (e.g. `zai/glm-5.1` or flash-class if available) — **not** Opus
3. Hot-reload / restart if needed; test with `/verbose on` in webchat
4. Verify: ask a preference/history question without saying “search memory”

**Risk:** Hidden personalization / wrong memory injection. Mitigate: direct-only, short summary, logging on, easy `/active-memory off`.

#### A2. Configure subagent economics + delegation

**Why:** Top agents parallelize research/verify; we currently pay main-brain prices or skip delegation.

**Do:** add under `agents.defaults.subagents`:
```json5
{
  model: "zai/glm-5.1",          // or openrouter/auto — cheap worker
  thinking: "low",
  runTimeoutSeconds: 600,
  maxConcurrent: 3,
  delegationMode: "suggest"      // bump to "prefer" after 3 good runs
}
```

**Pattern to use immediately (no new infra):**
- Scout (memory-only / read-only)
- Worker (research or implement)
- Verifier (critique vs evidence checklist; different model if possible)

#### A3. Kill identity auto-noise at source

**Why:** Symptom condensed today; source still open. Top harnesses do not append boilerplate to identity every boot.

**Do:** inspect `session-startup` plugin / identity writer:
- max **1 auto identity append per calendar day**, OR
- suppress when pulse/drift/anchor are default boilerplate
- keep manual checks fully free

#### A4. Open-fire aging (ops reliability)

**Already partially applied in WORLD_STATE today.** Codify:
- every fire shows **days since last movement**
- main-session startup must voice any fire ≥5d
- heartbeat escalates ≥7d without Jason contact (rule exists; enforce)

#### A5. Claim Ledger v0 (verification OS)

New tiny file: `memory/claim-ledger.md` (or daily section)

Format per non-trivial claim:
```
CLAIM: ...
STATUS: asserted | verified | rejected
EVIDENCE: file/cmd/url/tx
CHECKED: ISO time
```

Rule: banned words (done/fixed/verified/live) require ledger row or inline evidence.

#### A6. Research Session Protocol skill (mechanical)

Promote existing Möbius rule into a **forced path**:
1. Prior memory search first  
2. Working file under `memory/research-YYYY-MM-DD-topic.md`  
3. Label claim classes: direct observation / primary source / secondary / inference  
4. Audit pass (self or subagent verifier) before MEMORY promotion  
5. Max 5 durable promotions per research session  

### Layer B — This week (compounding)

| Item | Outcome |
|------|---------|
| **B1. Retrieval eval set (10 facts)** | Score memory_search hit@1/hit@3 weekly; hill-climb embeddings/queries |
| **B2. Verifier subagent skill** | Default for research + “are we done?” gates |
| **B3. Trajectory snippets** | On major sessions: goal → actions → evidence → outcome → lesson (≤20 lines) |
| **B4. Expand procedural memory** | Add: Active Memory enable checklist, subagent spawn pattern, RE status pass, research audit |
| **B5. Heartbeat model split** | If supported: cheaper model for heartbeat; keep Grok/Opus for main |
| **B6. Skill diet** | Disable zombie skills; keep only skills with last-30d use or explicit mission |
| **B7. Memory wiki compile cadence** | Weekly compile of WORLD_STATE + open procedures so RAG has structured pages |

### Layer C — Later (high power, needs caution)

- Tighter exec/workspace security tiers (risk vs convenience trade with Jason)
- Formal multi-agent Chamber default for high-stakes decisions only
- Browser dApp automation for RE/NFT (WalletPilot + clawbrowser) with spend caps
- Eval harness against Jason’s real tasks (RE ops, research promotion accuracy)
- Forgetting curve / bitemporal annotations on semantic facts
- Do **not** chase full RSI or more identity mythology

---

## 5. Immediate implementation plan (ordered checklist)

### Phase 0 — Tonight / next message (Jason approve config)

1. **Approve Active Memory enable** (main + direct only + cheap fallback)
2. **Approve subagents defaults** (cheap worker model + timeout + suggest)
3. **Approve identity auto-check rate-limit** (plugin/script change)

### Phase 1 — Right after approve (Nova executes)

1. Backup `openclaw.json`
2. Patch allowlist + active-memory entry + subagents defaults
3. Validate config
4. Restart gateway only if required
5. Smoke tests:
   - memory recall without explicit search
   - spawn 1 cheap research subagent + parent synthesis
   - confirm identity file doesn’t gain boilerplate spam on next startup
6. Write procedures into `procedural-memory-v1.md`
7. Create `memory/claim-ledger.md` + first rows from this research
8. Log results in daily + optional MEMORY one-liner after verified smoke

### Phase 2 — Same session if energy remains

1. Draft `skills/` or Skill Workshop proposal: `research-session-v1` + `verifier-subagent-v1`
2. Build 10-fact retrieval eval set from known MEMORY facts
3. Run one end-to-end demo on a real fire (e.g. FBN status research) using Scout→Worker→Verifier

---

## 6. What NOT to add (anti-strategy)

| Temptation | Why skip |
|------------|----------|
| More models / more plugins blindly | Context and failure modes multiply |
| Bigger SOUL/identity mythology | Doesn’t raise task success rate |
| Fully autonomous money/social | Violates trust + family risk model |
| Auto-apply governance from SI reviews | Already rejected pattern |
| Fabricating missing daily files | Continuity theater |
| Replacing MEMORY with only vectors | Files + git beat opaque stores for this household |
| 10-agent swarm as default | Coordinator tax; use 2–3 max |

---

## 7. Success metrics (prove top-tier, don’t vibe it)

Track weekly in `memory/harness-scorecard.md`:

1. **Memory-before-speech rate** — % of main turns where relevant prior fact appears without user saying “remember” (active-memory or manual search)
2. **Unsupported claim rate** — claims using banned words without evidence (target → 0 on ops topics)
3. **Open-fire age** — max days any URGENT fire sits without movement/escalation (target ≤5d surface, ≤7d escalate)
4. **Retrieval hit@3** — on 10-fact eval set
5. **Research promotion purity** — % of MEMORY promotions with audit tag
6. **Identity noise** — auto identity appends/day (target ≤1)
7. **Subagent leverage** — tasks completed via cheap worker without main-context bloat
8. **Jason interventions** — times he had to correct stale/wrong ops state (target down)

Top 0.001% here = **wins on these meters**, not leaderboard cosplay.

---

## 8. Recommended decision for Jason (simple)

**Ship Layer A now** in this order:

1. Active Memory on (direct/main only)  
2. Subagent cheap defaults  
3. Identity spam rate-limit  
4. Claim ledger + research protocol (files/skills, no risky config)  
5. Keep open-fire aging discipline from today’s cleanup  

If you say **“do A”** or **“do A1–A3”**, I implement with backup + validate + smoke test.  
If you want zero config changes tonight, I can still land **A4–A6** as files/skills only.

---

## Sources

### Direct observation
- `~/.openclaw/openclaw.json` (plugins.allow, entries, agents.defaults, tools)
- `openclaw plugins list` — active-memory disabled; 13/72 enabled
- `openclaw cron list` — security, update, dreaming
- Live files: WORLD_STATE, identity-substrate condensation, HEARTBEAT, procedural-memory-v1
- Docs local: `docs/concepts/active-memory.md`, `docs/tools/subagents.md`

### Prior durable research
- `memory/research-2026-06-22-ai-agents.md` (+ audit caveat)
- Chambers / session-consolidation / SI log patterns

### Secondary (untrusted web/X — directional)
- https://www.philschmid.de/agent-harness-2026
- https://docs.openclaw.ai/concepts/active-memory
- https://docs.openclaw.ai/tools/subagents
- OpenClaw production guides / community memory+subagent patterns (2026)
- X/community synthesis on OpenClaw memory + verification + subagents (steipete-adjacent discussion)

---

## Bottom line

We’re not missing a magic model. We’re missing **three harness muscles** the best 2026 agents already flex:

1. **Automatic memory scout before speech** (`active-memory`)  
2. **Cheap parallel workers + separate verifier** (subagent defaults + pattern)  
3. **Anti-rot + anti-stall mechanics** (identity rate-limit, fire aging, claim ledger)

Implement those and this stack stops being a very smart notebook and starts being a **top-percentile operating system for Jason’s life**.
