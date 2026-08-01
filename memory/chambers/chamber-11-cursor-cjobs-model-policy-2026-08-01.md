# Chamber #11 — Cursor C-jobs model policy

**Date:** 2026-08-01 ~01:37–01:42 PDT  
**Chair:** Nova · `xai/grok-4.5`  
**Question:** C1–C8 ran under Cursor; usage looked like Codex/GPT-5.3. Redo all? Real alpha? Future model policy?

## Preflight
- `node scripts/protected-settings-guard.mjs check --context chamber-preflight` → ok true, configChanged false

## Evidence (TOOL / Chair observation)

| Fact | Evidence |
|------|----------|
| Cursor CLI default model | `agent about` → **Model: Auto** (Pro, CLI 2026.07.23-e383d2b) |
| Worker does not pin model | `scripts/cursor-worker.sh` — no `--model` on plan/ask/write |
| Available models (live `agent models`) | Auto; gpt-5.3-codex*; gpt-5.2; **cursor-grok-4.5-***; **composer-2.5***; opus-5*; opus-4-8*; **gpt-5.6-sol***; gpt-5.5*; kimi-k3-high; … |
| Per-job Cursor model id | **Not logged** in C-job write logs / notes |
| Jason usage observation | Codex / GPT-5.3 in Cursor usage — **plausible** under Auto for coding; not line-item proven per C job |
| C5 | **Nova-direct** — skipped Cursor |
| Mechanical verify still green (this session) | test-nova-task-grade 11/11; claim-guard tests pass; trajectory-closeout 10/10 |
| Alpha queue | C1–C8 DONE with Nova verify gates; C9 queued |

### Alpha nature (Chair framing)
Alpha = harness **meters/scripts/procedures** with independent Nova verify — not an LLM prose beauty contest. Weak generator can still ship correct tests if verifier is strict.

## Seats (REAL MODEL OUTPUT)

| Seat | Model | Runtime | Provenance |
|------|-------|---------|------------|
| Structural | `zai/glm-5.2` | ~48s | REAL — provider zai |
| Skeptic | `openai/gpt-5.6-sol` | ~52s | REAL — provider openai |
| Alternative | `deepseek/deepseek-v4-flash` | ~40s | REAL — provider deepseek |
| Chair | `xai/grok-4.5` | this session | Chair synthesis |

### Structural (GLM-5.2) — summary
- **No full redo.** Tests still pass; Nova verify was the real bar.
- KEEP C1/C2/C4/C5/C7/C8; **SPOT-AUDIT C3 + C6**
- Future: pin model; never Auto for production; suggested pin `gpt-5.3-codex` (reproducible code-tuned)
- gpt-5.6-sol full redo **not** justified
- Patch design: `CURSOR_MODEL` env + `--model` on agent calls

### Skeptic (GPT-5.6-sol) — summary
- Steelman: Auto is opaque; tests can validate weak specs; Nova mechanical verify ≠ architectural depth
- KEEP risks: hidden gaps, circular fixtures, Auto drift under future jobs
- REDO risks: regression, prestige theater, burn cash attention while eBay/Hilltop lag
- **MVA:** freeze baseline → adversarial review (not rewrite) → add only gap tests → patch smallest surface
- Redo only on kill criteria (unsafe trust boundary, untestable arch, repeated adversarial fails, etc.)
- Rec: do **not** redo merely because Auto/5.3; do **not** treat Auto+green tests as durable assurance

### Alternative (DeepSeek Flash) — summary
- Strategy **"Pin, Prove, Promote" (3P)**
- Classify → pin per class → dual bake-off **one** weakest job → promote only tested meters → freeze untested → re-eval ~1 week
- Cost S–M; better than full redo

## Conflict table

| Topic | Structural | Skeptic | Alternative | Chair resolve |
|-------|------------|---------|-------------|---------------|
| Full redo C1–C8? | No | No (unless kill criteria) | No | **No** |
| Was alpha real? | Yes (mechanical + verify) | Yes as instrumentation, not optimal cert | Implied yes | **Yes — alpha meters, not "best code forever"** |
| Default pin | gpt-5.3-codex | (n/a — audit first) | cursor-grok-4.5 for mechanical | **Pin something better than Auto; prefer Composer 2.5 or cursor-grok-4.5-high for implement — not freeze 5.3 as destiny** |
| Auto forever? | No for production | No | No after week 1 | **No** |
| GPT-5.6-sol role | special cases only | adversarial auditor | bake-off candidate | **Auditor / hard jobs — not mass rewrite engine** |
| Immediate action | spot C3/C6 + pin flag | provenance-labeled audit | 3P | **Pin worker model + log model id; spot-audit C3/C6; optional one adversarial pass; no mass redo** |

## Chair synthesis

### Direct answers to Jason

1. **Why Codex/5.3?**  
   Cursor sidecar ran with **Model=Auto** because `cursor-worker.sh` never passed `--model`. Auto often routes coding work to the Codex family. That matches your usage UI. We did **not** intentionally choose "old crappy model" — we failed to pin.

2. **Does Cursor have better models?**  
   **Yes.** Live list includes: **cursor-grok-4.5** (low/med/high + fast), **composer-2.5**, **gpt-5.6-sol***, Opus 5 / 4.8, GPT-5.5, Kimi K3, plus Codex 5.3 variants. No separate "Grok Build" id in this list (Grok 4.5 cursor-* is the Grok lane).

3. **Was C1–C8 actually alpha?**  
   **Yes — as harness alpha.** Deliverables are scripts, tests, fixtures, meters, wiki ops entities. Nova re-verified mechanically. This session still green on core unit tests. Alpha ≠ "frontier prose on every line."

4. **Redo everything with GPT-5.6-sol / Codex?**  
   **No.** Consensus across seats. Mass redo burns money/time, risks thrashing working meters, does not fix eBay/Hilltop cash. Prestige model ≠ automatic better harness scripts.

5. **What should we do?**  
   - **Keep** C1 C2 C4 C5 C7 C8 as baseline (C5 never used Cursor).  
   - **Spot-audit** C3 (retrieval residual logic/gold) and C6 (verifier skill content).  
   - **Pin Cursor model** going forward + **log the model id** on every job.  
   - Optional: one **read-only adversarial audit** of C1–C8 by GPT-5.6-sol (find missing tests/gaps) — rewrite only if kill criteria hit.  
   - Continue queue at **C9** under pinned model, not Auto.

### Recommended Cursor model policy (Chair)

| Mode | Recommended pin | Notes |
|------|-----------------|-------|
| `write` (implement) | `composer-2.5` **or** `cursor-grok-4.5-high` | Jason preference aligns; pick one default after one smoke |
| `plan` / `ask` | same pin or `cursor-grok-4.5-medium` | cheaper OK |
| Hard redesign / adversarial | `gpt-5.6-sol-high` (explicit) | not default worker |
| Never default | bare `auto` for production C-jobs | exploration only |

**Reject Structural's "default forever = gpt-5.3-codex"** as policy goal — that freezes the problem you noticed. Use 5.3 only if bake-off proves equal quality cheaper.

### Minimal worker patch (design — not applied this chamber)
- `CURSOR_MODEL="${CURSOR_MODEL:-composer-2.5}"` (or grok-high after smoke)
- Pass `--model "$CURSOR_MODEL"` on all agent invocations
- Echo/log model into job log header every run
- Allow per-job override via env

## Promotion decision
- **Hold as working memory** this chamber file + daily note  
- **Do not** promote "C1–C8 are junk" or "must redo"  
- **Promote sparse** only after Jason accepts: "Cursor worker must pin model; C1–C8 keep; no mass redo"  
- Config/script edit of `cursor-worker.sh` = **proposal only** until Jason says go

## Postflight
- `node scripts/protected-settings-guard.mjs check --context chamber-postflight` → ok true, configChanged false
- Brain/swarm/fallbacks untouched this chamber

## Jason decision + apply — 01:44 PDT
- Jason: **B** — pin `cursor-grok-4.5-high`
- Applied: `scripts/cursor-worker.sh` default `CURSOR_MODEL=cursor-grok-4.5-high`; passes `--model` on plan/ask/read/write; logs `model=` header
- TOOLS.md updated with pin + override docs
- openclaw.json untouched
