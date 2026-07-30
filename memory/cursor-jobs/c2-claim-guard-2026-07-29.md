# C2 — Claim Guard (2026-07-29)

**Status:** PASS — **Nova verified 2026-07-29 ~20:11 PDT**  
**Scope:** Mechanical claim discipline lint only (not C3–C9).

## Design

Zero-dep Node ESM scanner matching `nova-task-grade` style.

| Piece | Path |
|-------|------|
| Library | `scripts/lib/claim-guard-lib.mjs` |
| CLI | `scripts/claim-guard.mjs` |
| Unit tests | `scripts/test-claim-guard.mjs` |
| Fixtures | `memory/evals/fixtures/claim-guard/{dirty,clean,policy}.md` |

**Banned words (canonical):** `done`, `fixed`, `verified`, `clean`, `working`, `pushed`, `live`, `shipped` — case-insensitive whole-word (`\p{L}`/`\p{N}` boundaries).

**Clear rules (precision-first):**
1. Evidence in same line or ±N lines (default N=2): `EVIDENCE:` / `Source:` / `CHECKED:` / `checked:`, path tokens, `node scripts/`, `openclaw `, `git status|log|push…`, `exit 0`, `https://`, PASS+counts, `sha256`/`wc -c`, `memory_search`, `plugins list`
2. Same contiguous bullet block also searched for evidence
3. Idioms: `live ops|workspace|suite|grade|smoke|…`, `working memory|file|tree|…`, `clean child|install|session|working tree|state`
4. Policy/teaching meta: banned-word lists, "banned success/words", Verified Claim Language headings, slash-lists `"done/fixed/verified"`, anti-pattern teaching lines
5. `STATUS: verified` alone does **not** clear — needs evidence marker/path/cmd in window

**Categories:** `bare_success`; `multi_bare` when ≥2 violations share a paragraph.

**Exit codes:** 0 clean (or `--soft`); 1 strict violations; 2 usage/infra. No paths → help + exit 2.

## How to run

```bash
node scripts/test-claim-guard.mjs
node scripts/claim-guard.mjs --help
node scripts/claim-guard.mjs --text "Ship is done"                    # expect exit 1
node scripts/claim-guard.mjs --text "Ship is done. EVIDENCE: node scripts/foo.mjs exit 0"  # exit 0
node scripts/claim-guard.mjs memory/evals/fixtures/claim-guard/dirty.md   # exit 1
node scripts/claim-guard.mjs memory/evals/fixtures/claim-guard/clean.md   # exit 0
node scripts/claim-guard.mjs memory/evals/fixtures/claim-guard/policy.md  # exit 0
node scripts/claim-guard.mjs --soft MEMORY.md memory/claim-ledger.md WORLD_STATE.md memory/procedural-memory-v1.md
```

## Unit results

```
claim-guard unit tests

  PASS  DEFAULT_BANNED_WORDS has canonical eight
  PASS  bare done → violation
  PASS  done + EVIDENCE path nearby → cleared
  PASS  policy documentation list → no violation
  PASS  working memory → cleared
  PASS  live suite → cleared
  PASS  STATUS: verified without evidence → violation
  PASS  STATUS: verified + EVIDENCE → cleared
  PASS  multi-line window works (±2)
  PASS  isEvidenceNearby exported helper
  PASS  file scan on temp fixture
  PASS  formatReport text includes OK when clean
  PASS  clean child / clean install idioms

13 passed, 0 failed
EXIT:0
```

## Fixture results

| Fixture | Violations | Exit |
|---------|------------|------|
| `dirty.md` | 7 (all bare / multi_bare) | **1** |
| `clean.md` | 0 (8 cleared) | **0** |
| `policy.md` | 0 (21 cleared) | **0** |

Paste:

```
===== TEXT BARE =====
claim-guard: 1 violation(s), 0 cleared, 1 hit(s), 1 line(s)
VIOLATION bare_success line 1:done:Ship is done
EXIT:1
===== TEXT EVIDENCE =====
claim-guard: 0 violation(s), 1 cleared, 1 hit(s), 1 line(s)
OK
EXIT:0
===== FIXTURES =====
claim-guard: 7 violation(s), 0 cleared, 7 hit(s), 11 line(s)
… dirty.md … DIRTY:1
claim-guard: 0 violation(s), 8 cleared … CLEAN:0
claim-guard: 0 violation(s), 21 cleared … POLICY:0
```

## Live soft scan sample

```bash
node scripts/claim-guard.mjs --soft MEMORY.md memory/claim-ledger.md WORLD_STATE.md memory/procedural-memory-v1.md
```

```
claim-guard: 0 violation(s), 88 cleared, 88 hit(s), 766 line(s)
OK
EXIT:0
```

**Interpretation:**
- MEMORY / claim-ledger / WORLD_STATE: no bare-success FPs after idiom + evidence rules (paths, live idioms, ledger EVIDENCE blocks).
- procedural-memory-v1: early tuning had ~14 teaching/meta FPs; cleared via policy headings, teaching-meta patterns, `git status`/`plugins list` as evidence, `clean working tree`, slash-lists. **Final residual FPs on this sample: 0.**
- Accept some future FPs on novel prose; prefer precision. Optional later: `--allow-live-context`.

## Procedure / scorecard hooks

- Procedure 9 + 11: optional `node scripts/claim-guard.mjs path/to/note.md` checklist bullets.
- Scorecard: `### 2026-07-29 — Claim Guard (C2)` (meter #2 support).
- Optional C1 changelog line in `memory/evals/nova-task-suite-v0.md`.

## Acceptance checklist

1. Deliverables exist — yes  
2. Unit tests exit 0 — **13/13**  
3. dirty fails strict; clean+policy pass — yes  
4. Procedure 9/11 tiny hook — yes  
5. Scorecard + job report — yes  
6. No forbidden files touched — yes (no openclaw.json / wallets / AGENTS rewrite / HEARTBEAT rules)  
7. Nova can re-run independently — yes  

## Residual risks

- Not NLU: novel idioms of `live`/`clean`/`working` may still false-positive outside known clears.
- Globbing `fixtures/claim-guard/*.md` together exits 1 because dirty is intentional — scan fixtures separately for green CI.
- Lemma variants (`fixing`, `verifying`) intentionally omitted in v0 (exact list only).
