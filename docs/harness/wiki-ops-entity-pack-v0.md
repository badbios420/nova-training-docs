# Wiki ops entity pack v0

**Job:** C8 (`memory/cursor-jobs/c8-wiki-ops-entity-pack-2026-07-31.md`)  
**Purpose:** Seed four durable ops entities into the isolated memory-wiki vault so `wiki_search` / compile digests have source-backed pages (vault was 0 entities).

## Entities

| File | id | canonicalId | entityType |
|------|-----|-------------|------------|
| `hilltop-listing.md` | `entity.hilltop-listing` | `ops.hilltop-listing` | project |
| `fbn-vista-license.md` | `entity.fbn-vista-license` | `ops.fbn-vista-license` | project |
| `harness-meters.md` | `entity.harness-meters` | `ops.harness-meters` | system |
| `sister-porch.md` | `entity.sister-porch` | `ops.sister-porch` | system |

Staging source of truth: `memory/wiki-ops-pack/entities/`  
Live vault: `/home/mrbig3/.openclaw/wiki/main/entities/`  
Install steps: `memory/wiki-ops-pack/INSTALL.md`

## Claim discipline

- Every entity has ≥2 structured `claims` with `evidence[].path` pointing at workspace files that exist.
- Prefer WORLD_STATE for live ops; MEMORY / TOOLS / scorecard / job files for durable facts.
- Status language: CLOSED / Active / Lagging / cash-gated — banned success words only when already true in sources.
- **No secrets** (mnemonics, wallet keys, oauth tokens).
- **No invented MLS list price** — only −$5k/week path and −$10k cumulative; exact MLS $ is TBD.

## Out of scope

- Bridge mode / unsafe-local
- Obsidian CLI
- Full memory reindex
- C9 SWV harness
- Dreaming corpus
- Live RE marketing / eBay publish
- MEMORY.md bulk rewrite

## Optional synthesis

`memory/wiki-ops-pack/syntheses/ops-now.md` — short rollup pointing at the four entities (nice-to-have).
