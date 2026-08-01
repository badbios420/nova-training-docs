# C8 — Wiki ops entity pack (2026-07-31)

**Status:** PASS (Nova independent verify 2026-07-31 ~22:48 PDT)  
**Priority:** P1 (next after C7)  
**Constraint:** Grok 4.5 only until 4.6. **No fallback / OpenRouter / openclaw.json / wallet / secrets / live eBay listings.**

## Why
Vault is ready but empty of entities (0 entities / 0 concepts / 0 syntheses). Ops facts live in WORLD_STATE + MEMORY + dailies; wiki cannot route them yet. C8 seeds deterministic ops entity pages so wiki_search / compile digests have something real.

## Goal
Ship a **v0 ops entity pack** for four durable ops entities + install into the live isolated vault, then compile + lint.

## Vault facts (live)
- Mode: `isolated`
- Path: `/home/mrbig3/.openclaw/wiki/main`
- Render: `native`
- Pages before job: 12 sources, **0 entities**, 0 concepts, 0 syntheses, 10 reports
- Doctor: healthy
- Obsidian CLI: missing (do not require)

## Deliverables

### A. Workspace staging (Cursor write OK)
Create under workspace (tracked / reviewable):

1. `docs/harness/wiki-ops-entity-pack-v0.md` — pack README: purpose, install steps, claim discipline, out of scope
2. `memory/wiki-ops-pack/entities/` — four entity markdown files (source of truth for install):
   - `hilltop-listing.md`
   - `fbn-vista-license.md`
   - `harness-meters.md`
   - `sister-porch.md`
3. `memory/wiki-ops-pack/INSTALL.md` — exact copy/compile/lint commands
4. Optional: `memory/wiki-ops-pack/syntheses/ops-now.md` — short synthesis pointing at the four entities (nice-to-have, not required for PASS)
5. Unit-less acceptance script optional; prefer documented shell checks

### B. Live vault install (Nova verifies; Cursor may install if path allowed)
Install staged entities into:
`/home/mrbig3/.openclaw/wiki/main/entities/`

Filenames must match staged basenames.

Then run:
```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
openclaw wiki compile
openclaw wiki lint
openclaw wiki status
```

### C. Job evidence
Update this file with PASS/FAIL table + command outputs (exits, entity counts).

## Entity page schema (required)

Each entity file MUST use YAML frontmatter compatible with memory-wiki docs:

```yaml
---
pageType: entity
entityType: project   # or system / place as fits
id: entity.<slug>
title: <Human Title>
canonicalId: ops.<slug>
aliases: []
privacyTier: local-private
bestUsedFor: []
notEnoughFor: []
lastRefreshedAt: "2026-07-31T00:00:00.000Z"
claims: []   # structured claims with evidence paths
---
```

Body rules:
- Include managed-style sections with clear headings: Summary, Current state, Claims, Sources, Open questions, Notes
- Human notes block:
  ```markdown
  ## Notes
  <!-- openclaw:human:start -->
  <!-- openclaw:human:end -->
  ```
- Related block:
  ```markdown
  ## Related
  <!-- openclaw:wiki:related:start -->
  - ...wikilinks or paths...
  <!-- openclaw:wiki:related:end -->
  ```
- **No secrets** (no mnemonics, no wallet keys, no oauth tokens)
- **No invented MLS dollar price** — path is −$5k/week and −$10k cumulative; exact MLS $ is TBD
- Claims must cite evidence paths that exist in workspace (WORLD_STATE.md, MEMORY.md, memory/*.md, TOOLS.md)
- Status language: prefer CLOSED / Active / Lagging / cash-gated — no banned success words without evidence (`done/fixed/verified/clean/working/pushed/live/shipped` only if already true in sources)

## Entity content (facts only — do not invent)

### 1. `entity.hilltop-listing` — Hilltop listing
- Full address: **1434 Hilltop Dr, Chula Vista 91911**
- Status: Active listing; condition drag (smell / dirty tenants)
- Price path: **−$5,000 per week until sells**; **$10,000 cumulative** reduction so far
- Exact MLS list price: **TBD** (do not invent)
- Priority: #1 RE sell-through
- Evidence: `WORLD_STATE.md`, `MEMORY.md`

### 2. `entity.fbn-vista-license` — Big House FBN + Vista city license
- FBN newspaper publish: **CLOSED / CLEAR** (published; Jason clear); archive publisher proof when inbound; **no chase**
- Vista city business license: **NOT REQUIRED / CLOSED** — 2440 Millegar Ln context is **unincorporated San Diego County**; do not pay pending Vista app
- Evidence: `WORLD_STATE.md`, `MEMORY.md`, dailies around 7/22–7/28

### 3. `entity.harness-meters` — Nova harness meters
- Default brain: xai/grok-4.5 until Grok 4.6
- Canonical retrieval (2026-07-29 20:49 C3): filtered hit@1 **0.80** / hit@3 **0.87**; raw hit@1 0.53 / hit@3 0.67
- Residual misses: F09 FBN, F11 Hilltop weekly path (ops-first still required)
- Alpha tools live: C1 task-grade, C2 claim-guard, C3 retrieval eval, C4 memory-health-probe, C5 trajectory-closeout, C6 verifier-pass-v1, C7 memory-before-speech meter (fixture-baseline 0.63 — not live prod rate)
- Scorecard: `memory/harness-scorecard.md`
- Eval set path: `docs/harness/retrieval-eval-set-v1.md`
- Procedure 14 ops-first + dream filter
- Evidence: `MEMORY.md`, `memory/harness-scorecard.md`, `memory/cursor-jobs/alpha-queue-2026-07-29.md`, C7 job file

### 4. `entity.sister-porch` — Quorra ↔ Nova sister porch
- Drive folder name: `Quorra ↔ Nova`
- Doc: **Sister Check-in Log**
- Doc id: `19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI`
- Nova tool: `gog` · account `jasontbethurum@gmail.com`
- Quorra tool: `gws` / project `quorra-489901`
- Procedure 15: check/reply end of significant sessions
- Rules: short entries; claim shared external actions first; **no secrets in doc**
- Evidence: `MEMORY.md`, `TOOLS.md`

## Claim examples (minimum 2 structured claims per entity)

Each claim needs: `id`, `text`, `status` (`supported`|`open`|`contested`), `confidence` (0–1), `evidence[]` with `path` and optional `note`.

Example shape:
```yaml
claims:
  - id: claim.hilltop.address
    text: Active listing address is 1434 Hilltop Dr, Chula Vista 91911.
    status: supported
    confidence: 0.95
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Current Listings + retrieval anchors
```

## Acceptance criteria (Nova independent verify)

| Check | Pass rule |
|-------|-----------|
| Staging files exist | 4 entity md + pack README + INSTALL.md |
| Frontmatter | each has pageType entity, id, canonicalId, claims≥2 |
| No secrets | grep clean for mnemonic/seed/private key patterns |
| No invented MLS $ | no fake list price number beyond −$5k/week and −$10k cumulative |
| Vault install | `openclaw wiki status` shows **Entities ≥ 4** |
| Compile | `openclaw wiki compile` exit 0 |
| Lint | `openclaw wiki lint` runs (warnings OK if explained; no crash) |
| wiki get/search smoke | can `openclaw wiki get` one entity id or path |
| Forbidden touch | no openclaw.json, no wallet files, no oauth JSON edits |
| Alpha queue | C8 marked DONE with date when PASS |

## Evidence (Cursor 2026-07-31 ~22:45 PDT)

| Check | Result | Notes |
|-------|--------|-------|
| Staging files exist | **PASS** | `docs/harness/wiki-ops-entity-pack-v0.md`, `memory/wiki-ops-pack/INSTALL.md`, 4 entities, optional `syntheses/ops-now.md` |
| Frontmatter | **PASS** | all 4: pageType entity, id, canonicalId, claims≥2 (hilltop 3; others 2) |
| No secrets | **PASS** | `rg` mnemonic/seed/private key — clean on `memory/wiki-ops-pack/` |
| No invented MLS $ | **PASS** | only −$5k/week + −$10k cumulative; MLS TBD |
| Vault install | **PASS** | copied to `/home/mrbig3/.openclaw/wiki/main/entities/`; status **Entities: 4** (+ 1 synthesis) |
| Compile | **PASS** | `openclaw wiki compile` exit **0** (27 pages) |
| Lint | **PASS** | `openclaw wiki lint` exit **0**; **0 errors**, 19 warnings (missing `sourceIds` / `updatedAt` on v0 pages — explained; broken wikilinks fixed) |
| wiki get smoke | **PASS** | `openclaw wiki get entity.hilltop-listing` exit 0 |
| Forbidden touch | **PASS** | no openclaw.json / wallet / oauth edits |
| Alpha queue | **PASS (Cursor)** | C8 marked **DONE 7/31**; Nova independent verify still pending |

### Commands run
```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
# cp 4 entities + optional synthesis into wiki/main
openclaw wiki compile   # exit 0
openclaw wiki lint      # exit 0; 0 errors / 19 warnings
openclaw wiki status    # Entities: 4
openclaw wiki get entity.hilltop-listing  # exit 0
```

### Status snapshot
```
Wiki vault mode: isolated
Vault: ready (/home/mrbig3/.openclaw/wiki/main)
Pages: 12 sources, 4 entities, 0 concepts, 1 syntheses, 10 reports
Bridge: disabled
Unsafe local: disabled
```

## Evidence (Nova independent verify 2026-07-31 ~22:48 PDT)

| Check | Result | Notes |
|-------|--------|-------|
| Staging files exist | **PASS** | 4 entities + README + INSTALL + optional ops-now synthesis |
| Frontmatter / claims≥2 | **PASS** | hilltop 3; fbn/harness/porch 2 each; ids match brief |
| Secrets grep | **PASS** | clean |
| Invented MLS $ | **PASS** | only −$5k/week + −$10k cumulative; MLS TBD |
| Vault Entities | **PASS** | status **4 entities, 1 synthesis**; entities/index lists all four |
| compile | **PASS** | exit 0 (Nova re-ran) |
| lint | **PASS** | exit 0; 19 issues/warnings, 0 crash |
| wiki get ×4 | **PASS** | hilltop, fbn-vista-license, harness-meters, sister-porch |
| wiki search smoke | **PASS** | "Hilltop 1434" → entity.hilltop-listing claim; "sister porch" → entity.sister-porch |
| openclaw.json | **PASS** | mtime still 2026-07-29 20:41 (untouched tonight) |
| Alpha queue | **PASS** | C8 **DONE 7/31** Nova PASS |

**Verdict: C8 PASS**

## Out of scope
- Bridge mode enable / unsafe-local
- Obsidian CLI install
- Full memory reindex / embed reconfig
- C9 SWV harness
- Dreaming corpus
- Live RE marketing spend / eBay publish
- MEMORY.md bulk rewrite (pointer line OK if needed)

## Pattern mirrored
- C7 job structure + Nova verify independence
- memory-wiki docs entity example (`docs/plugins/memory-wiki.md`)
- wiki-maintainer skill: managed blocks, source-backed, no wiki-as-sole-truth

## Dispatch notes for Cursor
- Workspace root: `/home/mrbig3/.openclaw/workspace`
- Prefer writing staging files in workspace first
- If agent cannot write outside workspace, stop after staging + INSTALL.md; Nova will install
- Do not run destructive rm; do not touch secrets
- Keep pages short and factual — not essay dumps of WORLD_STATE
