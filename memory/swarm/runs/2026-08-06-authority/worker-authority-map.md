# Worker — Authority Map (which file wins)

**Pack:** 9 · Authority / single-source map
**Run:** 2026-08-06 (swarm cycle, authority pass)
**Worker model:** deepseek/deepseek-v4-flash (read-only + this report)
**Scope touched (read only):** AGENTS.md, memory/procedural-memory-v1.md, WORLD_STATE.md (header), MEMORY.md (header), SOUL.md, IDENTITY.md, HEARTBEAT.md, docs/harness/swarm-protocol-v0.md

---

## status: PASS

## evidence
- AGENTS.md "Source-of-Truth Map" section read in full (priority list + conflict rules) — injected session context.
- `memory/procedural-memory-v1.md` read in full; Proc 14 / 21 / 23 / 1 / 16 confirmed present.
- `WORLD_STATE.md` header read (fires table, wallet snapshot, canonical ownership: "Not memory. Not journal.").
- `MEMORY.md` header read (inject-slim, L2/L3 split, "Live ops NOW: WORLD_STATE.md").
- `SOUL.md` / `IDENTITY.md` headers read (identity narrative; no live numbers).
- `HEARTBEAT.md` read (cooperative heartbeat, Proc 21 deference, filesystem verification rule).
- `docs/harness/swarm-protocol-v0.md` header read (Status: Live v0 — operational; worker constraints; output contract).

## findings

### 1. Authority tier table

| Document | Tier / role | Wins when | Loses to | Must NOT contain |
|----------|-------------|-----------|----------|------------------|
| **Direct observation** (ls/stat, git, CLI, tx, probe output) | L0 evidence | Any verified mechanical fact contradicts a file claim | Nothing (but must be logged to count) | Unbacked recollection; claims without command/path/exit proof |
| **WORLD_STATE.md** | L1 ops — volatile NOW | Current fires, wallet, listings, cash, deadlines; any "what is happening right now" | Live verified observation of changed state (then L1 refresh) | History, journaling, biography, identity narrative; numbers hardcoded into SOUL/IDENTITY |
| **memory/YYYY-MM-DD.md** | L1 ops/episodic | Session log, open issues, failure check, same-day record | WORLD_STATE on NOW numbers; MEMORY on distilled durable facts | Durable belief promotions without audit |
| **memory/procedural-memory-v1.md** | L2 behavior — how | Any "how to act" question; workflow conflict with AGENTS on the same workflow | AGENTS on startup load order; Jason explicit override | Procedural bloat (scope note enforces); architecture changes (L3) |
| **AGENTS.md** | L2/L3 behavior — startup + safety + map | Startup ritual, safety, delegation, Source-of-Truth priority | Procedure on the specific workflow; Jason; direct observation | Volatile numbers; full procedures (delegated to Proc file) |
| **MEMORY.md** | L2 curated / L3 promotions — durable | Standing rules, distilled facts, identity-adjacent, harness state | WORLD_STATE on live numbers; dailies on NOW | Live dashboards, unverified research, inject bloat >18KB target |
| **SOUL.md / IDENTITY.md** | L3 narrative | Identity, values, archetype, relationship, voice | AGENTS behavior rules; WORLD_STATE numbers; openclaw.json (model truth) | Live numbers, wallet, listings, fires, procedures |
| **HEARTBEAT.md** | L1/L2 ops checklist | Heartbeat cadence, what to check, quiet/NO_REPLY rules | Proc 21 (no invented lock-in); AGENTS safety; WORLD_STATE freshness | Claims without filesystem verification; lock-in authority |
| **TOOLS.md** | L2 local notes | Environment specifics (binaries, paths, hosts, voice prefs) | procedural-memory on how; AGENTS on safety | Secrets verbatim; procedures; governance |
| **docs/harness/swarm-protocol-v0.md** | L2 protocol body | Swarm labor roles, worker constraints, output contract | Chair (Nova) synthesis; Jason | Worker promotions to MEMORY/WORLD_STATE; spend/external sends |
| **claim-ledger.md / observed-failures.md** | L1/L2 evidence | Claim status, banned-word proof, failure patterns | Primary evidence; WORLD_STATE | Vibes; "verified" without evidence rows |
| **Archives** (nova/quorra-training-docs, MEMORY-archive, old dailies) | Historical | Reference only — never governs current behavior | Everything live | Governance authority |
| **openclaw.json / config** | L3 protected | Effective system truth (models, plugins, providers) | Jason explicit; Codex gate (Proc 20) | Unapproved edits; wallet/secret dumps |

### 2. Conflict rules already written vs gaps

**Written (12):**
1. AGENTS Source-of-Truth priority: direct observation > WORLD_STATE (ops tier) > AGENTS > procedural-memory > MEMORY > dailies > Möbius ledgers > archives.
2. AGENTS vs Procedure → **Procedure wins on the specific workflow**; AGENTS still owns startup load order.
3. Same-tier residual conflict → **state it and check Jason**.
4. Volatile numbers → **WORLD_STATE.md only**; never hardcode into SOUL/IDENTITY (Proc 23 canonical ownership).
5. **L1 auto / L2 verify-then-write / L3 explicit Jason** (Proc 23); delegated-autonomy one-liner.
6. **Proc 21:** investigate → implement → verify → report → **STOP**; lock-in/git/porch/MEMORY-promotion/consolidation need explicit Jason.
7. **Proc 14:** ops-first retrieval (WORLD_STATE + today/yesterday before search); Active Memory = **untrusted cache**; dream-filter.
8. **Proc 1:** runtime/state files never `git checkout`/`restore` (2026-08-06 CHI Batch A incident).
9. **HEARTBEAT.md:** cooperative heartbeat — never invents lock-in authority; filesystem-verification rule; daily-file mandate.
10. **swarm-protocol-v0:** workers never promote to MEMORY/WORLD_STATE, never sole-verify irreversible actions, never spend/send; always return status/evidence/findings/confidence/scope_touched.
11. **Möbius:** research → audit → promotion; no promotion without audit (direct observations exempt if independently verifiable).
12. **Verified Claim Language:** banned words (done/fixed/verified/…) require proof source, else "pending verification."

**Gaps (missing rules):**
- G1: SOUL.md, IDENTITY.md, TOOLS.md, and openclaw.json are **absent from the AGENTS Source-of-Truth map** — identity/config tiers are only inferable via Proc 23 canonical ownership + Proc 20 (Codex owns config). No explicit rank.
- G2: L1 "WORLD_STATE refresh" (Proc 23) vs Proc 21 "no scope expansion after a scoped fix" — **when exactly** may a session refresh WORLD_STATE without Jason? Mid-work refresh vs end-of-fix refresh is ambiguous.
- G3: No general "docs/ is canonical; memory/ copy is a pointer" rule — stated only for retrieval-eval-set (Proc 12).
- G4: MEMORY.md retains volatile numbers ("−$10k cumulative" Hilltop) while citing WORLD_STATE as live path — no rule for **how much volatility MEMORY may hold** (policy "−$5k/week" vs current cumulative figure).
- G5: HEARTBEAT.md vs AGENTS heartbeat guidance — no ranking if they conflict on what to check (same-tier, unwritten; only the state-and-check fallback exists).
- G6: Direct observation vs WORLD_STATE — "verified live observation wins AND triggers L1 refresh" is implied (map #1 + Proc 23 L1) but never stated as a rule.
- G7: Whether editing docs/harness protocol bodies (e.g., swarm-protocol-v0.md) counts as L3 procedure change is unwritten (implied yes by Proc 23 "new/changed procedures that alter authority").

### 3. Top 5 "A vs B disagree" scenarios

1. **WORLD_STATE says cash "Tight"; today's daily + direct Koios check show funds landed.** → *Winner:* direct observation + today/yesterday dailies for NOW; then L1-refresh WORLD_STATE. *Path:* AGENTS map #1–2, Proc 14 step 1, Proc 23 L1.
2. **MEMORY.md says Hilltop −$10k; WORLD_STATE says −$15k.** → *Winner:* WORLD_STATE (sole owner of volatile numbers); MEMORY gets L2 sync-trim. *Path:* Proc 23 canonical ownership + MEMORY.md split rule.
3. **Active Memory asserts "SI due / open fire"; files show recent run / WORLD_STATE shows closed.** → *Winner:* files + WORLD_STATE; AM rejected as untrusted cache. *Path:* Proc 14 step 5, Proc 16 (probe if tool flake suspected).
4. **Heartbeat wants to lock-in/commit after a completed fix; Proc 21 says report-then-STOP.** → *Winner:* Proc 21; HEARTBEAT.md itself defers (cooperative heartbeat clause). *Path:* Proc 21 rule 1–2, HEARTBEAT.md "must not invent lock-in authority."
5. **AGENTS.md startup load order conflicts with a procedure step for the same workflow.** → *Winner:* Procedure on the specific workflow; AGENTS owns load order and safety. *Path:* AGENTS conflict rule + map rank #3/#4.

### 4. Gaps ambiguous after Proc 23

- **L1/L2 boundary drift:** Proc 23 calls "WORLD_STATE.md refresh" L1-automatic, but Proc 21 bans post-fix expansion. Ambiguous: is a WORLD_STATE refresh inside a scoped task "the work" (L1 OK) or "while I'm here" (violation)? Recommend: refresh during the work = L1; end-of-session refresh without Jason = ask.
- **Unranked tiers:** identity narrative (SOUL/IDENTITY) and local notes (TOOLS.md) and config (openclaw.json) have no explicit row in the AGENTS map — only Proc 23/20 inferences.
- **MEMORY volatility ceiling:** how much live number may MEMORY.md hold before it must be stripped to "policy + pointer to WORLD_STATE"? Currently holds a live cumulative (−$10k) — likely fine as of-now, but no rule prevents recurrence.
- **docs vs memory canonical copies:** only retrieval-eval-set has an explicit canonical-owner rule; other doc/memory pairs (chamber, swv, procedures) rely on convention.
- **Heartbeat scope ownership:** AGENTS says "free to edit HEARTBEAT.md"; HEARTBEAT.md governs cadence; if they conflict on what to check, no written winner (same-tier → state-and-check fallback, unstated for this pair).

## confidence: high

Read all 8 named sources directly; AGENTS.md supplied in full via session context (no truncation on the Source-of-Truth section). Gaps G1–G7 are absence-based observations, not speculation about file content.

## scope_touched
- Read: AGENTS.md, memory/procedural-memory-v1.md, WORLD_STATE.md, MEMORY.md, SOUL.md, IDENTITY.md, HEARTBEAT.md, docs/harness/swarm-protocol-v0.md
- Written: this report only (`memory/swarm/runs/2026-08-06-authority/worker-authority-map.md`)
- No edits to any workspace file; no config/wallet/secrets touched.
