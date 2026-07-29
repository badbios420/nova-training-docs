---
name: "memory-efficiency-pass"
description: "Safe memory efficiency: ops-first routing, dream filter, raw vs filtered meters, no auto config/layer changes."
---

# Memory Efficiency Pass

## Overview

Make multi-layer memory **efficient without collapsing layers**.

Efficiency comes from:
1. **Ops-first routing** (trusted files before broad search)
2. **Dream/narrative noise filtering**
3. **Honest measurement** (raw index vs policy-filtered recall)
4. **Optional, measured ranking/AM tuning** only when explicitly implementing

**Not** from fewer files, automatic config rewrites, or claiming the search engine is “fixed” when only routing improved.

### Architecture decision (stable)

Keep separate layers:

| Layer | File(s) | Job |
|-------|---------|-----|
| Current ops truth | `WORLD_STATE.md` | Fires, waiting, NOW |
| Recent events | `memory/YYYY-MM-DD.md` | Episodic trail |
| Durable facts | `MEMORY.md` | Curated long-term |
| Procedures | `memory/procedural-memory-v1.md` | How to repeat work |
| Verification meters | claim-ledger, observed-failures, harness-scorecard | Anti-fooling |
| Deep/narrative | dreaming, DREAMS, lossless-claw | Only when deep continuity / explicit |

**Do not flatten** into one megafile. Flattening usually worsens retrieval.

### What the 2026-07-28 pass actually proved

- Raw hit@3 stayed ~**0.60** (index still noisy)
- Filtered hit@3 rose to ~**0.80** (routing + dream filter)
- Progress = **better routing and filtering**, not a fully fixed search engine

Any future run must keep that distinction visible in logs and claims.

---

## Modes (critical)

| Mode | When | Allowed |
|------|------|---------|
| **inspect** (default) | “check memory”, “how is retrieval”, review skill | Read-only: measure, report, propose |
| **implement** | Jason explicitly says implement / apply tune / run efficiency pass with config changes | Backup → optional measured config edit → remeasure → log |
| **apply-skill only** | Jason says apply the skill workshop proposal | Install skill file only — **does not** change openclaw.json |

If mode is ambiguous → **inspect only**.

---

## Triggers

**Use when**
- Retrieval feels noisy (dreams beat live ops)
- hit meters below target on eval set
- Active Memory injects stale ops claims
- Jason asks to fix/make memory efficient, or to run this skill in implement mode

**Do not use when**
- Simple one-off fact (just read WORLD_STATE / daily)
- Request is “delete/collapse layers” without measurement
- Full cognition redesign (use harness research path)
- Background heartbeat / silent autonomy (no silent config edits)

---

## Hard prohibitions

Unless Jason **explicitly** orders the specific action in this turn:

1. **No automatic config rewrite** of `openclaw.json`
2. **No gateway restart**
3. **No git commit or push**
4. **No delete / flatten / relocate / bulk re-index** of memory layers
5. **No turning dreaming off**
6. **No treating July 28 numerical knobs as universal defaults to re-apply blindly**
7. **No stacking new “optimizations”** on already tuned settings without a measured before/after and a regression check

---

## Stable procedure vs environment-specific settings

### A. Stable procedure (reusable everywhere)

1. Inspect live memory health
2. Backup before any config edit
3. Measure **raw** and **policy-filtered** retrieval separately
4. Score **per category**, not only one aggregate
5. Enforce ops-first routing + dream isolation for answers
6. Treat Active Memory as untrusted cache with freshness rules
7. Document residual failures and regressions
8. Rollback if measured performance worsens or validate fails

### B. Environment-specific settings (example only — 2026-07-28 Nova host)

These are **reference values from one measured pass**, not sacred universals:

```text
memorySearch.query.minScore = 0.38
hybrid.vectorWeight = 0.55
hybrid.textWeight = 0.45
mmr.enabled = true, lambda = 0.75
temporalDecay.enabled = true, halfLifeDays = 14
active-memory.promptStyle = strict
active-memory.maxSummaryChars = 220
active-memory.timeoutMs = 12000
embedding: ollama / nomic-embed-text
```

**Promotion rule for any numeric setting**
Only keep/change a knob if:
1. before/after meters exist
2. target category improves
3. no clear regression in another category
4. config validate passes
5. backup + rollback path recorded

Do not re-apply the whole 7/28 block on every run “because the skill says so.”

---

## Preconditions

1. Prefer main session with Jason for implement mode
2. Useful files (create only if Jason asked implement and file is missing meter scaffolding):
   - `memory/retrieval-eval-set-v1.md`
   - `memory/harness-scorecard.md`
   - `memory/claim-ledger.md`
   - `memory/memory-retrieval-policy-v1.md`
   - `memory/procedural-memory-v1.md`
3. CLI: `openclaw config validate`, `openclaw plugins list` when touching config
4. Know authoritative sources for ops claims (table below)

---

## Authoritative sources

| Query type | Trusted source first |
|-----------------------------------|------------------------------|
| Current fires / waiting / urgency | `WORLD_STATE.md` |
| Recent events | today + yesterday daily notes |
| Durable personal/project facts | `MEMORY.md` |
| Procedures / recurring ops | `memory/procedural-memory-v1.md` |
| Historical narrative / rationale | deep memory / dreaming **only after** ops sources, or on explicit deep ask |
| SI due / heartbeat freshness | `memory/heartbeat-state.json` + filesystem mtimes |
| Config/plugin truth | live `openclaw.json` / `openclaw plugins list` |

### Ops-first order (mandatory for operational answers)

1. Current conversation
2. `WORLD_STATE.md`
3. today + yesterday `memory/YYYY-MM-DD.md`
4. Curated `MEMORY.md` / procedural / claim-ledger as needed
5. Broad `memory_search` only if still incomplete
6. wiki / lossless-claw only for structured or deep continuity needs

Semantic search must **not** decide current operational truth when WORLD_STATE exists and is fresh enough.

---

## Dream / narrative isolation

For normal ops and factual recall, **exclude or heavily down-rank**:
- `memory/dreaming/**`
- `memory/.dreams/**`
- `DREAMS.md` / `dreams.md`
- `memory/candidates/**` (unpromoted)
- `memory/retrieval-eval-set-v1.md` as self-gold

Dream/narrative hits may inform answers **only if**:
- query is explicitly deep/historical/creative, OR
- the same fact is corroborated by an authoritative source above

Long-term stronger designs (optional future work — do not auto-implement):
- separate narrative collection
- `authority: narrative` metadata
- retrieval priority marks
- explicit deep-continuity corpus mode
- promote sparse dream insights into small curated files instead of searching the full dream corpus

Until engine path-exclude exists, agent-side filter is required on every ops answer.

---

## Active Memory freshness rule

Active Memory (`active_memory_plugin`) is an **untrusted cache**.

**Never repeat** an AM claim about:
- current status, open issues, deadlines
- ages (“X days stale”), SI due dates
- configuration, balances, wallet, fires

…unless you either:
1. include a **source timestamp / path** from an authoritative file, or
2. **verify live** against that file before speaking

If AM conflicts with WORLD_STATE, heartbeat-state, daily notes, or filesystem mtimes → **reject AM**, log if systemic.

“Treat as hint” alone is too soft; freshness/source check is required.

---

## Measurement protocol

### Always separate two scores

1. **Raw retrieval** — engine top hits as returned (no dream drop)
2. **Policy-filtered retrieval** — after dream/noise filter + ops routing rules

**Banned claim language**
- Do not say “retrieval accuracy is 0.80” if that is filtered-only
- Say: “filtered hit@3 = 0.80; raw hit@3 = 0.60 (routing/filter gain, index still noisy)”

### Category scoring (minimum)

Keep per-category results, not only one combined hit rate:

| Category | Example gold sources |
|---------------------------|--------------------------------------|
| current_ops | WORLD_STATE, today daily |
| recent_events | today/yesterday dailies |
| durable_facts | MEMORY.md |
| procedures | procedural-memory-v1 |
| historical_narrative | deep/dream only when appropriate; should not dominate ops |

Use `memory/retrieval-eval-set-v1.md` as smoke test (≥10 facts). Prefer expanding coverage across the five categories over farming the same ten forever.

### Targets (filtered path for ops-relevant categories)

- filtered hit@3 ≥ 0.80
- filtered hit@1 ≥ 0.70
- support@3 ≥ 0.70
- raw meters recorded even if poor
- regressions named (category that got worse)

Failing raw meters is acceptable if filtered/ops path is strong **and** honesty is preserved.

---

## Inspect mode steps (default)

1. Read WORLD_STATE freshness + open fires
2. Check heartbeat-state / SI due with filesystem verification
3. Spot-check `memory_search` on 3–5 queries spanning categories
4. Report raw vs filtered behavior qualitatively + any meters available
5. Propose next action; **stop** (no config edit)

## Implement mode steps (explicit only)

### 1. Backup + rollback plan

```bash
cp -a ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.YYYY-MM-DD-memory-efficiency
```

Record:
- backup path
- rollback command: `cp -a <backup> ~/.openclaw/openclaw.json` then `openclaw config validate`
- whether gateway restart is needed (prefer hot-apply categories only; **do not restart** unless Jason asks)

### 2. Baseline measure

Run eval set; log raw + filtered + per-category before changes.

### 3. Optional config tune

Only if implement mode and baseline shows a ranking problem worth knobs:
- Read current live memorySearch + active-memory config first
- Diff proposed vs current
- Prefer **smallest change**
- Use 7/28 values only as a starting hypothesis, not mandatory paste
- Do not change embedding provider/model unless Jason accepts possible index rebuild

### 4. Validate

```bash
openclaw config validate
openclaw plugins list
```

On validate failure → rollback immediately.

### 5. Confirm policy surfaces

Ensure ops-first + dream filter + AM freshness rules exist in:
- `memory/memory-retrieval-policy-v1.md`
- procedural Procedure 14 (or equivalent)

Do not delete prior procedures; merge.

### 6. Remeasure

Same eval + categories. Compare before/after. Keep change only if net positive.

### 7. Evidence log (required on implement)

Update:
- `memory/harness-scorecard.md` — raw vs filtered + per-category
- `memory/retrieval-eval-set-v1.md` — run log
- `memory/claim-ledger.md` — claims with backup path + meters
- `memory/trajectory-log.md` — ≤20 lines
- `memory/YYYY-MM-DD.md` + Session-End Failure Check
- sparse `MEMORY.md` only for durable decision/result
- `WORLD_STATE.md` harness line if ops picture changed

### 8. Residual failures

Always record misses and regressions, not only aggregate wins.

| Symptom | Action |
|---------|--------|
| Ops facts buried under dreams | Ops-first; exclude dreams from answer path |
| Rare entity/address miss | Enrich WORLD_STATE/MEMORY exact strings |
| AM stale age/due claims | Freshness verify; reject; optional tighten AM only if measured |
| Raw hit@3 stuck low | Expected without path-exclude; do not fake index win |
| Category regression | Rollback knob or narrow change |
| Pressure to collapse layers | Refuse; measure first |

---

## Files this skill may touch

### Inspect mode
- Read-only anywhere needed
- Optional append to daily note if Jason is in session and a finding must persist

### Implement mode (explicit)
- `~/.openclaw/openclaw.json` (after backup) — memorySearch / active-memory only unless Jason expands scope
- `memory/memory-retrieval-policy-v1.md`
- `memory/procedural-memory-v1.md` (Procedure 14 area)
- meter/log files listed in evidence log
- **Never** wallet secrets, nested training repos, or bulk dream corpus deletes

---

## Success criteria

- Mode respected (inspect vs implement)
- If config touched: timestamped backup + rollback instructions + validate OK
- Raw and filtered meters both recorded
- Per-category results recorded (not only aggregate)
- Ops answers used WORLD_STATE → dailies → curated → search order
- Dream/narrative not used as sole ops authority
- AM current-status claims verified or omitted
- No layer delete/flatten; no silent commit/push/restart
- Residual failures named honestly
- Claims distinguish **routing/filter gain** vs **index gain**

---

## Failure modes

- Blindly re-applying 7/28 numbers every run
- Calling filtered 0.80 “the retrieval system is fixed”
- Config edit without backup/rollback
- Auto restart / commit / push
- Counting dreams or eval-set self-hits as gold
- Collapsing layers “for efficiency”
- Silent implement during inspect
- Ignoring category regressions because aggregate looked better

---

## Quick checklist

**Inspect**
- [ ] WORLD_STATE + clocks freshness
- [ ] Spot-check multi-category retrieval
- [ ] Report raw vs filtered honestly
- [ ] No config edits

**Implement**
- [ ] Explicit Jason implement intent
- [ ] Backup path + rollback noted
- [ ] Baseline meters (raw/filtered/category)
- [ ] Smallest config/policy change only if needed
- [ ] Validate (+ rollback on fail)
- [ ] Remeasure + compare
- [ ] Evidence logs + residual failures
- [ ] No commit/push/restart unless asked

---

## Origin / provenance

- First implement pass: 2026-07-28 Nova main session
- Result: raw hit@3 ~0.60; filtered hit@3 ~0.80 via ops-first + dream filter + local ranking/AM tune
- Revised same day after GPT review: separated stable procedure from env knobs; added mode gates, category meters, AM freshness, rollback, and no-auto-apply safeguards
- Skill apply ≠ config implement

## Rollback (config)

```bash
cp -a ~/.openclaw/openclaw.json.bak.YYYY-MM-DD-memory-efficiency ~/.openclaw/openclaw.json
openclaw config validate
```

If validate fails after rollback, stop and escalate to Jason with paths and error text.
