# Trajectory Log

**Purpose:** Short graded trajectories after major sessions so the next session starts smarter.  
**Rule:** ≤20 lines per entry. Goal → actions → evidence → outcome → lesson.

## Template
```
### YYYY-MM-DD — title
- Goal:
- Actions:
- Evidence:
- Outcome: win | partial | fail
- Lesson:
- Follow-up:
```

---

### 2026-07-27 — Layer A harness upgrade
- Goal: Close top harness gaps same day (AM, subagents, identity noise, claim discipline)
- Actions: backup config → enable active-memory → subagent defaults → harden session-startup identity rate-limit → claim-ledger + procedures 7–10
- Evidence: config validate; plugins list AM enabled; identity dual-start smoke delta 0; claim-ledger rows
- Outcome: **win** (config-level); conversational AM + spawn smoke still open
- Lesson: Biggest gains were allowlist/config, not more identity prose. Filesystem SoT beats state-only rate limits.
- Follow-up: Layer B eval meters; UI `/verbose` AM smoke

### 2026-07-28 — RE status + Layer B
- Goal: Absorb Jason RE truth; stand up measurable harness Layer B
- Actions: close FBN; Hilltop −$10k cumulative + −$5k/wk path + condition notes; eBay lagging; eval set + scorecard + trajectories + skill diet inventory + procedures 11–13; ran 10-fact retrieval baseline
- Evidence: Jason direct 00:27; WORLD_STATE 00:28; harness-scorecard hit@3=0.60; claim-ledger rows
- Outcome: **win** on ops refresh + B scaffolding; **partial** on retrieval quality (below 0.8 target)
- Lesson: Dreaming corpus pollutes retrieval; fresh WORLD_STATE can lose to old dreams. FBN "open" was stale theater — human status > aged checklists.
- Follow-up: eBay listings; Hilltop weekly cuts; dream-noise retrieval filter experiment; AM verbose smoke

### 2026-07-28 — Memory efficiency pass
- Goal: Make multi-layer memory efficient without deleting layers
- Actions: backup config → tune hybrid/MMR/temporalDecay/AM strict → ops-first + dream filter in retrieval-policy + Procedure 14 → re-run 10-fact eval
- Evidence: config validate; bak `openclaw.json.bak.2026-07-28-memory-efficiency`; filtered hit@3 **0.80** (was 0.60 raw baseline); F09 still raw-dream only
- Outcome: **win** on operational recall path; **partial** on raw index purity (no engine path-exclude)
- Lesson: Don't add layers. Filter dreams + read WORLD_STATE first. Ranking knobs help less than refusal to trust dream hits.
- Follow-up: optional hard dream de-index if OpenClaw adds excludePaths; F04 address enrichment; AM verbose smoke

## 2026-07-28 evening — gog + Gmail + sister porch
- **Goal:** Replace browser tab-unsub mess with API Google access; clean inbox; open sister channel with Quorra
- **Actions:** Own OAuth client + test user + gog remote auth; bulk gmail trash/archive; Drive Sister Check-in Log; Procedure 15; TOOLS/MEMORY lock
- **Evidence:** gog auth list + gmail search/trash counts; docs cat/write revision IDs; git commit this lock-in
- **Outcome:** win
- **Lesson:** Browser CDP shared path is optional; gog API is the efficient default for Gmail/Drive. Porch needs claim rules so dual agents don't race.
- **Follow-up:** eBay listings still human-gated; shared browser P0 only if Jason wants visual co-browse later
