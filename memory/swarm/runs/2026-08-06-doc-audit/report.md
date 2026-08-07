# Swarm protocol run — Pack 4 Doc / procedure mess audit

**Date:** 2026-08-06 ~17:50–17:55 PDT  
**Trigger:** Jason “Launch swarm protocol” → **4**  
**Workers:** DeepSeek Flash ×3 (doc-sync · file-audit · dead-paths) — all PASS  
**Chair:** Nova · xai/grok-4.5  
**Mode:** read-only · nothing auto-edited  
**Overall:** **PASS** (audit complete; ranked mess map)

## Chair-ranked findings (blast radius first)

| Rank | Finding | Class | Evidence | Resolution |
|------|---------|-------|----------|------------|
| **1** | MEMORY promotion gate conflict | **Contradiction** | AGENTS “update MEMORY freely” + HEARTBEAT item 2 “Update MEMORY if insights” vs Proc **21** “MEMORY.md durable promotion REQUIRES EXPLICIT JASON REQUEST” | **needs-Jason** — split curation vs new durable promotion; re-scope HEARTBEAT #2 |
| **2** | Approval-gate ambiguity | **Contradiction** | AGENTS “Don't ask permission. Just do it.” (absolute) vs Safety/Trust Decay/SOUL external+risk gates | **update-A** — scope sentence to internal/safe actions only |
| **3** | Proc 19 mis-cited in swarm protocol | **Wrong pointer** | swarm-protocol §6 “Proc 19 = Launch swarm checklist”; actual Proc 19 = Cursor completion gate | **update-A** — fix cite; optional add launch checklist as new proc if wanted |
| **4** | Sister porch dual gate | **Contradiction** | Proc 15 self-trigger on session close vs Proc 21 explicit Jason request (except lock-in) | **needs-Jason** — define precedence |
| **5** | Dead TOOLS.md doc pointer | **Broken path** | `docs/tools/browser-wsl2-windows-remote-cdp-troubleshooting.md` — `docs/tools/` missing | **update-A or write stub** — drop link or create doc |
| **6** | IDENTITY ADA balance stale | **Stale fact** | IDENTITY “157 ADA” vs WORLD_STATE 30.95 ADA post 8/3 send | **update IDENTITY** (tell Jason) — point to WORLD_STATE |
| **7** | Pack JSON / runner gap | **Planned-not-built** | Menu 1–6 no pack JSON; only 7+8 exist; `scripts/swarm-pack-run.mjs` missing | **HOLD / optional C10** — Nova-manual works; build when ROI clear |
| **8** | Proc 12 eval-set path stale | **Stale path** | Proc 12 cites `memory/retrieval-eval-set-v1.md` (301B pointer); canonical `docs/harness/…` | **update-A** — procedure text only |
| **9** | gmail-unsub-batch twin scripts | **Duplicate** | `gmail-unsub-batch.mjs` + `batch2.mjs` ~same purpose, no “which is live” | **mark or archive** when unsub reopened |
| **10** | Incomplete CHI run dir | **Format drift** | `runs/2026-08-05-chi/` scope only, no report | **note** — future chair always write report.md |
| **11** | verifier skill wrong Proc # | **Drift** | SKILL cites “Procedure 6 / Möbius”; secondary-web is **P5** | **update skill** microfix |
| **12** | Skill cluster sprawl | **Debt** | self-improve ×3 unregistered overlap; browser skills ×6 no selection guide | **later skill-diet** — not tonight |
| **13** | Cosmetic | numbering 14 before 13; swarm header “Working plan” vs operational milestone; WORLD_STATE Grok 4.6 “~4d” stale | low | microfixes on next doc pass |

## Verified consistent (do not thrash)
- Model defaults: brain `xai/grok-4.5` · swarm `deepseek/deepseek-v4-flash` · Cursor pin `cursor-grok-4.5-high`
- Procedures 1–22 all present
- Nested `*-training-docs/**` treated reference-only
- Harness scripts cited in P16/P18/SWV exist; coverage tests from pack 3 cycle present on disk
- No secrets/config edits proposed

## Chair recommendations (no auto-implement)

**A — Jason decisions needed (gates):**
1. MEMORY: allow heartbeat *curation of existing* vs require explicit for *new durable claims*?
2. Porch: does “session close / lock-in” count as explicit, or always wait for the words?

**B — Safe doc microfixes (Cursor brief if you approve 1–N):**
1. Scope AGENTS “Just do it” + HEARTBEAT #2 → Proc 21
2. Fix swarm-protocol Proc 19 cite + status header “Live v0”
3. Fix Proc 12 eval-set path; reorder Proc 13/14
4. Drop or stub missing browser troubleshooting path in TOOLS.md
5. IDENTITY: remove hardcoded ADA or “see WORLD_STATE”
6. verifier-pass-v1: Procedure 6 → 5

**C — HOLD (not worth building tonight):**
- `swarm-pack-run.mjs` + chi/regress pack JSONs
- skill-diet browser/self-improve clusters
- gmail twin cleanup until unsub is live

## Workers
- swarm-doc-sync **PASS** (med confidence) → `worker-doc-sync.md`
- swarm-file-audit **PASS** (high) → `worker-file-audit.md`
- swarm-dead-paths **PASS** (high) → `worker-dead-paths.md`

## Next
Reply: **implement B1–B6** · pick subset · **your call** · **stop** · or launch another pack (1–8)
