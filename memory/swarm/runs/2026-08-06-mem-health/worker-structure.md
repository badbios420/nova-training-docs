# Worker Packet: INDEX / ORPHAN / HYGIENE (structure)

- **Run:** 2026-08-06-mem-health
- **Worker:** Swarm Pack 5 (structure)
- **Date:** 2026-08-06 (probe ran 2026-08-07T01:50Z)
- **Mode:** READ-ONLY. No deletes, no file edits (only created this packet).
- **Status:** COMPLETE

## Evidence (what was checked)

- Link/pointer scan of 40+ files: MEMORY.md, WORLD_STATE.md, AGENTS/TOOLS/HEARTBEAT/IDENTITY/SOUL/USER, memory/{procedural-memory-v1, observed-failures, session-consolidation-v1, harness-scorecard, claim-ledger, identity-substrate, memory-retrieval-policy-v1, time-awareness, self-improvement-log, assumption-registry, discovery-log, reality-contact, goal-evolution-ledger, human-intent-ledger, opportunity-portfolio, priority-dashboard, trajectory-log, knowledge-inventory, ops-fact-cards-v1, identity-system, skill-diet-inventory-2026-07-28, consciousness-research, MEMORY-archive-pre-2026-07-29-inject-trim, mobius-cycle-12/13, 2026-08-05, 2026-08-06}.md
- Orphan scan: every .md under memory/ root (excl. dreaming/swarm/cursor-jobs/re-ops/evals/chambers/candidates/wiki-ops-pack/wallet-gen) vs. full-workspace corpus of .md/.mjs/.js/.json (excl. training docs, dreaming, git).
- Size audit: `du`/`wc` over memory tree + git tracking check (`git ls-files` + .gitignore).
- Probe: `node scripts/memory-health-probe.mjs --quick --no-report` → **exit 0, overall PASS**.

## Findings (12, max)

### Broken / stale pointers (7)

1. **`memory/knowledge-inventory.md:81` → `memory/RECURSIVE-PATTERNS.md` — WRONG DIRECTORY (MED).** File actually lives at workspace ROOT (`RECURSIVE-PATTERNS.md`), not under memory/. The inventory is a discovery index whose whole job is correct pointers; this one sends readers to a nonexistent path. Fix: `RECURSIVE-PATTERNS.md` (root) or add an explicit `../RECURSIVE-PATTERNS.md`.
2. **`memory/session-consolidation-v1.md` (lines 105,114,118,124,128) → `memory/research-synthesis-v2.md` — NEVER EXISTED (LOW-MED).** File not found anywhere in workspace. "Research-synthesis v2" framework was designed in that session but its standalone file was never created; the framework content lives inside session-consolidation-v1.md itself. Stale/aspirational pointer — future sessions may hunt for a file that isn't there.
3. **`memory/MEMORY-archive-pre-2026-07-29-inject-trim.md:309` → `memory/nova-mainnet.enc` — STALE NAME (LOW).** Actual file is `memory/nova-mainnet-v2.enc`. Archive-only pointer to the wallet-encryption material path; stale since the V2 rename. (No content change — archive is frozen history, so LOW; just be aware the path is v1-era.)
4. **`memory/harness-scorecard.md:122` → bare `nova-task-suite-v0.md` (LOW).** Actual file: `memory/evals/nova-task-suite-v0.md`; the sibling `.json` is correctly fully-pathed on the same line (`memory/evals/nova-task-suite-v0.json` — exists). Spec ref should read `memory/evals/nova-task-suite-v0.md`.
5. **`memory/discovery-log.md:117` → bare `verify-custody-v2.js` (LOW).** Actual: `memory/wallet-gen/verify-custody-v2.js`. Bare name resolves nowhere from memory/ root.
6. **`MEMORY.md:92` → bare `memory-embed-warmup.mjs` (LOW).** Actual: `scripts/memory-embed-warmup.mjs`. MEMORY.md paths all other scripts with `scripts/` prefix — this one dropped it.
7. **`memory/procedural-memory-v1.md:600` → bare `cursor-worker.sh` (LOW).** Actual: `scripts/cursor-worker.sh` (line 571 spells it fully; 600 does not). Note: bare `openclaw.json` refs (procedural:508,561,587; claim-ledger; ops-fact-cards) are intentional config-concept refs (file lives at ~/.openclaw/), not broken. AGENTS.md `BOOTSTRAP.md`/`SKILL.md` are template conditionals, not broken. `fixtures/sample-task.json` (procedural:549) resolves relative to `memory/evals/swv/` → **exists** (memory/evals/swv/fixtures/sample-task.json) — not broken.

### Orphan files (1 grouped finding)

8. **12 unreferenced .md under memory/ root, ~13.5KB total, all legacy/small — NO large high-signal orphans (LOW, good hygiene).** Top 8 candidates by size:
   - `skill-audit-2026-06-22.md` (3.8K) — superseded by referenced `skill-diet-inventory-2026-07-28.md`
   - `session-consolidation-2026-07-30-alpha-lockin.md` (2.1K) — superseded by `session-consolidation-2026-07-30-late-lockin.md` (referenced in claim-ledger:144)
   - `security-audit-2026-06-02.md` (1.8K)
   - `2026-04-01-wallet.md` (1.2K) — superseded by `2026-06-23-wallet-v2.md`; only referenced in dreaming evidence fields
   - `2026-03-21-cardano-research.md` (1.1K) — only referenced in dreaming evidence fields
   - `security-audit-2026-05-22.md` (1.0K)
   - `2026-03-27-security.md` (0.6K)
   - `2026-03-23-security.md` (0.6K)
   All are still embedded/indexed (508/508), so they add small retrieval noise; none are high-value. Recommendation: leave or move to a `memory/archive/` dir on Jason's OK — **no auto-trash** (per task). Not a retrieval problem today.

### Bloat / noise (4)

9. **`memory/wallet-gen/node_modules` = 6.4MB inside the memory tree (DISK ONLY).** Gitignored (`memory/wallet-gen/node_modules/` in .gitignore ✓), not indexed (no .md) ✓. No functional impact; only a disk/clone-size wart inside "memory".
10. **`memory/cursor-jobs/codex-repair-2026-08-01.stdout.log` = 2.9MB (DISK ONLY).** Not git-tracked ✓, `.log` not indexed ✓. Second-biggest single file in memory/; harmless to retrieval.
11. **`memory/dreaming/` = 2.3MB across 214 .md files ≈ 42% of the 508 indexed files (WATCH ITEM).** Largest memory volume; `light/` alone is 1.8MB. Mitigated by Procedure 14 (ops-first + dream filter) and confirmed working probe, but the index population is dominated by dreaming dumps. Not a defect — just the structural fact that matters for index/rank tuning.
12. **`memory/identity-substrate.md` = 24KB / 319 lines, log-section growth pattern (OK NOW).** The 7/27 condensation collapsed 173 auto-check rows into a summary; since then 4 manual entries appended (7/27→7/29) and startup rate-limits to ≤1 auto-append/day (scripts/session-startup.mjs). Growth is bounded and intentional — but expect another condensation pass like 7/27 in a few weeks. MEMORY.md itself is 16.1KB — under the 18KB inject budget ✓.

### Health probe (#4 requested check) — **PASS, exit 0**

- sqlite store ok (148,389,888 B; wal=true, shm=true)
- Index: **508/508 indexed, dirty=no**, FTS ready, provider ollama
- Embed: nomic-embed-text present, dims=768, latency **174ms** (below 2s warn cliff)
- Workspace memory dir ok (70 daily files + MEMORY.md)
- Search smoke/latency/concurrency SKIPPED by `--quick` design — no action needed
- No embed-provider or index-integrity red flags

## Confidence

- **HIGH** for mechanical findings: existence checks (`ls`/`find`/`stat`), sizes (`du`/`wc`), git tracking (`git ls-files`, .gitignore), probe exit code + lines.
- **MEDIUM** for severity/priority judgments (LOW/MED labels) and the "superseded by" relationships (read from content, not verified by diff).

## Scope touched

- READ-ONLY across all scanned files. No files modified, moved, or deleted.
- Created: `memory/swarm/runs/2026-08-06-mem-health/worker-structure.md` (this packet).
- Temp analysis scripts in /tmp only (linkcheck2.mjs, orphan2.mjs) — not part of workspace.
