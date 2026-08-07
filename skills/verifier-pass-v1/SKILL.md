---
name: "verifier-pass-v1"
description: "Gen→Verify split for claims: intake claim list + evidence paths, output verified/pending/rejected table. Live skill (applied 2026-07-30). Pairs with claim-guard + claim-ledger."
---

# Verifier Pass v1

## When to use

Trigger this skill when **any** of:

- Research about to promote claims into `MEMORY.md` / durable notes
- Implementation burst used or is about to use banned success words (`done`, `fixed`, `verified`, `clean`, `working`, `pushed`, `live`, `shipped`)
- High-stakes ops summary for Jason (RE, cash, wallet, compliance)
- Child/subagent output is about to be trusted as fact
- Jason says "verify", "verifier pass", or "don't trust that yet"

**Do not use** for pure brainstorming with no durable write, or for already ledger-verified single claims with fresh evidence in-session.

## Non-negotiables

1. **Gen ≠ Verify.** Prefer a separate pass (second model/subagent when stakes are high). Same-session self-check is allowed only if explicitly labeled and evidence is re-checked mechanically.
2. **No evidence pointer → cannot be `verified`.** Paths, commands, tx hashes, URLs, plugin lists, exit codes only.
3. **Banned success words** without proof are automatic `rejected` or `pending` (never `verified`).
4. **Secondary web/X** stays untrusted until primary-checked (Procedure 5 / Möbius).
5. **Dream / AM cache** is not evidence (Procedure 14). Prefer `WORLD_STATE.md`, dailies, claim-ledger, direct `ls`/`stat`/CLI.
6. **No auto-apply** of other skills; no silent MEMORY promotions; no external sends.
7. **trash > rm.**

## Inputs

Collect before scoring:

| Field | Required | Notes |
|-------|----------|-------|
| `claims[]` | yes | Each: `{ id?, text, source? }` — source = generator\|research\|child\|human |
| `evidence_hints[]` | no | Paths, commands, URLs the generator cited |
| `scope` | no | `ops` \| `research` \| `harness` \| `mixed` |
| `stakes` | no | `low` \| `high` (high → separate subagent/model if available) |
| `write_ledger` | no | default false; if true, append claim-ledger rows for material outcomes |
| `run_claim_guard` | no | default true when scanning a draft file/string |

If Jason pastes prose instead of a list, **first extract claims** as atomic sentences (one fact each). Do not verify multi-fact blobs as a single row.

## Procedure

### 1) Intake & atomicize

- Split compound sentences into one claim per row.
- Tag each: `observation` | `primary` | `secondary` | `inference` (best effort).
- Drop pure opinion/process color unless it asserts a world fact.

### 2) Optional mechanical pre-scan

When a draft path or string exists:

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/claim-guard.mjs --soft path/to/draft.md
# or
node scripts/claim-guard.mjs --text "..."
```

- Guard **violations** → those spans start as `rejected` or `pending` until evidence is attached.
- Guard clean ≠ claims true; it only means no bare banned words.

### 3) Evidence binding (per claim)

For each claim, attempt **in order**:

1. **Direct observation** — run/read now (`ls`, `stat`, `openclaw …`, `node scripts/…`, file quote with path).
2. **Primary artifact** — tx, config validate output, on-chain, official doc, Jason direct instruction logged.
3. **Workspace SoT** — `WORLD_STATE.md` / today daily / claim-ledger **only if** the claim is about current ops and the file content actually supports it (quote line).
4. **Reject as evidence:** dreaming/**, DREAMS.md, Active Memory blurbs alone, uncited web summaries, "model remembers".

Record for each claim:

- `status`: `verified` | `pending` | `rejected`
- `evidence`: pointer string (path+line or cmd+exit or URL/tx)
- `note`: short why (optional)

### 4) Status rules

| Status | Rule |
|--------|------|
| **verified** | Evidence pointer checked **this pass** and supports the exact claim |
| **pending** | Plausible but evidence missing, stale, or only secondary |
| **rejected** | Contradicted by observation, bare banned success word, or vibe-only |

Hard rejects:

- Claim says "done/fixed/verified/…" with no proof
- Claim cites only dream/AM
- Child agent prose with no artifact
- Numeric/benchmark claims from secondary web without primary fetch

### 5) Output table (required)

Emit markdown:

```markdown
## Verifier pass — YYYY-MM-DD HH:MM PT

Scope: … · Stakes: … · Guard: clean|N violations

| ID | Claim | Status | Evidence | Note |
|----|-------|--------|----------|------|
| V01 | … | verified | `path` or `cmd` exit N | … |
| V02 | … | pending | — | need primary |
| V03 | … | rejected | claim-guard bare "done" | … |

Summary: verified=A pending=B rejected=C
Next: (only if pending/rejected block a ship)
```

Also give a **one-line ship gate**:

- `SHIP OK` — no rejected on critical path; no pending on banned-word ops claims
- `SHIP BLOCKED` — any rejected critical claim or unverified banned success word remains

### 6) Optional ledger write

Only if `write_ledger` true **or** Jason asks to record:

Append to `memory/claim-ledger.md` using existing format:

```markdown
### YYYY-MM-DD — short title
- CLAIM: …
- STATUS: verified | pending | rejected
- EVIDENCE: …
- CHECKED: ISO or local time
- NOTES: verifier-pass-v1
```

Do not rewrite old rows; append.

### 7) Optional trajectory

After major multi-claim sessions:

```bash
node scripts/trajectory-closeout.mjs \
  --title "Verifier pass: <topic>" \
  --goal "…" \
  --actions "verifier-pass-v1 on N claims" \
  --evidence "table: verified=A pending=B rejected=C" \
  --outcome win|partial|fail \
  --lesson "…"
```

Outcome heuristic: all critical verified → win; any pending on critical → partial; critical rejected left unfixed → fail.

## Subagent pattern (stakes=high)

When available:

1. **Generator** already produced claims (or scout summary).
2. **Verifier** spawn gets **only**: claim list, evidence_hints, this skill, and read access — not the generator's cheerleading.
3. Verifier returns the table; main agent merges and enforces ship gate.
4. Prefer cheaper/different model for verifier when configured (`deepseek/deepseek-v4-flash` worker default; `zai/glm-5.1` optional alt for mechanical checks).

Never let the generator mark its own claims `verified` without re-reading evidence.

## Pairing tools

| Tool | Role |
|------|------|
| `node scripts/claim-guard.mjs` | Mechanical banned-word lint |
| `memory/claim-ledger.md` | Durable claim status |
| `node scripts/trajectory-closeout.mjs` | Session grade after big verify |
| `node scripts/memory-health-probe.mjs` | If recall itself is suspect before citing memory |
| `node scripts/nova-task-grade.mjs` | Outcome meters for harness facts (not a substitute for claim verify) |

## Anti-patterns

- Marking `verified` because the generator sounded confident
- Using accept-path gaming or eval-set text as ops proof
- Promoting secondary research numbers into MEMORY without audit labels
- Auto-applying this skill's workshop proposal without Jason
- Running verifier only after Jason already acted on the claim externally

## Minimal example

**Input claims:**

1. Filtered retrieval hit@3 is 0.87 after C3  
2. eBay liquidation is done  

**Evidence hints:** `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md`, `WORLD_STATE.md`

**Output:**

| ID | Claim | Status | Evidence | Note |
|----|-------|--------|----------|------|
| V01 | Filtered hit@3 0.87 post-C3 | verified | `memory/cursor-jobs/retrieval-eval-report-20260729-2049.md` overall filtered hit@3 | re-read table |
| V02 | eBay liquidation is done | rejected | WORLD_STATE eBay **Lagging** | banned "done" + contradicted |

Ship gate: **SHIP BLOCKED** until V02 rephrased to match live ops.

## Definition of done (for a single pass)

- Atomic claim table emitted
- Every row has status ∈ {verified, pending, rejected}
- Every `verified` row has a checked evidence pointer
- Ship gate stated
- No durable promotion of rejected/pending critical claims

## Version

- v1 — 2026-07-30 — C6 Skill Workshop proposal (Procedure 11 operationalized)
