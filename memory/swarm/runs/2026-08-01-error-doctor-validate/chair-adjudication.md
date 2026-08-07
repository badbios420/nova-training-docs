# Runtime Error Doctor — Validation Pass (Chair adjudication)

**Date:** 2026-08-01 ~15:35 PDT  
**Chair:** Nova (xai/grok-4.5)  
**Flash lanes:** deepseek/deepseek-v4-flash ×3 (A evidence · B diagnosis · C risk) — all done  
**Mode:** READ-ONLY · no repairs · no commits · no ledger edits  

---

## Honest status vs GPT bar

| Layer | Verdict |
|-------|---------|
| Core engine (bounded logs, redact, cluster, ledger, probes, L0–L4 options) | **PASS (prototype)** |
| Swarm integration (specialized Flash critique on redacted packet) | **PASS this validation** (lanes ran; first full swarm doctor pass) |
| Diagnostic precision (default top-5 families, low noise) | **INCOMPLETE** — engine still over-fragments; chair must consolidate |
| Role split on original implement | **Process miss acknowledged** — Nova coded v0.1 directly; further engine work → **Cursor** |

---

## A. Why ~113–115 clusters from ~60 events

1. **Lifecycle split of one failure:** active-memory run timeout (12s) → recall timeout log (13.5s, ~2ms later) → abort-settle (2s later) → transport "Request was aborted" → failover_decision. Same `runId`s appear across 3–4 fingerprints.
2. **Normalization gaps:** trailing period on aborted messages; JSON wrapper vs extracted message; hash suffix per normalized string → many `E-*-{12hex}` children of one family.
3. **Corpus contamination:** prior doctor/report/markdown table rows and analysis prose ingested as "errors" (billing-402 fragments, `status: failed` junk).
4. **Benign agent ops:** edit-miss retries, external web_fetch 403s counted as incidents.
5. **Metric note:** fingerprints (115) > raw errorish lines (60) is the smoking gun for over-fragmentation, not under-collection.

**Chair rule for user UI:** keep raw fingerprints internally; **show ≤5 actionable families** by default; dump the rest as unclassified/noise appendix. Never hide high-severity even if count is low.

---

## B. Flash lane results (Nova adjudicates)

### Lane A — Evidence (PARTIAL, useful)
- Confirmed over-fingerprinting of active-memory family (~13+ child fps).
- Shared runIds prove merge of embedded-run-timeout + abort-settle + AM timeout + aborted transport.
- Punctuation split on "Request was aborted" / "aborted."
- False positives: edit-miss, web_fetch 403, junk JSON fragment, doc-table contamination.
- Secrets family correctly tagged but severity/NOISE tension noted.

### Lane B — Diagnosis (PARTIAL, high value)
- **Timeout chain is one family** with timestamp proof (T, T+2ms, T+2s on same runId).
- **Budget inversion hypothesis (strong):** active-memory embedded `timeoutMs: 12000` < recall ~13500ms < tool ~15s → structural, not only "load."
- **durationMs=0** lane errors → scheduler/nesting contention, not only model stall.
- **XAI_API_KEY:** service-managed key list includes XAI_API_KEY; `gateway.systemd.env` lacks it; runtime survives on OAuth `device-auth.json`. Standing config gap that **surfaces on restart/reload** → NOISE while gateway up is correct; permanent fix is Codex/Jason secrets alignment (no keys in chat).
- Circular root causes ("run exceeded timeout") rejected; want structural causes.
- Probe gap: ollama + memory-health quick do **not** exercise AM 12s path or secret-reload path.

### Lane C — Risk (PARTIAL, useful)
- AM family severity low-medium **understated** if user-visible surface_error; chair: **watch / medium-low**, still not emergency while probes pass.
- Secrets HIGH + NOISE incoherent → medium historical, observe if gateway up.
- PASS probes ≠ resolved for unprobed paths.
- No auto-repair language found (good). Secrets fix must stay Jason/Codex gated.

**Worker consensus is not proof.** Chair accepts merge of timeout family + secrets restart noise + FP list. Budget inversion is **high-confidence structural hypothesis**, not proven product bug without a controlled AM latency probe (future Cursor work).

---

## C. Quality metrics (this live window)

| Metric | Value |
|--------|------:|
| Raw errorish events (sum of cluster counts in window) | **60** |
| Initial fingerprints | **115** |
| Incidents shown by engine (top slice) | **12** |
| **Consolidated incident families (chair)** | **5** (+ unclassified bucket) |
| Actionable findings (need decision now) | **0** |
| Watch items (recurring, probes pass) | **1** (AM timeout family) |
| Known/mitigated | **1** (memory_search 15s tool cliff — mitigated workspace-side) |
| Noise / non-actionable | **2** (XAI env on restart; benign tool 403/edit-miss) |
| Unclassified / low-confidence leftover | **~7** engine generics after merge |
| False positives rejected by Nova | **≥4** (edit-miss, web_fetch 403, junk `status:failed`, report-table contamination) |

---

## D. Target families — improved diagnosis?

### 1. Active-memory timeout (+ embedded / abort / aborted request)
| | |
|--|--|
| **Before engine alone** | Many NEW generics + split AM fingerprints; weak root cause |
| **After swarm+chair** | **One family:** AM child/embedded path timing out under 12s run budget; cascade produces abort-settle + aborted transport |
| **Status** | Recurring · current probes PASS · **WATCH** |
| **Risk** | Low–medium (context miss / soft-fail; chat continues) |
| **Recommendation** | **Observe.** Optional later: Cursor adds AM-specific latency probe + family merge in doctor UI; Codex only if changing AM `timeoutMs` (protected) |

### 2. memory_search 15s tool timeout
| | |
|--|--|
| **In this window** | Not dominating top incidents (workspace harden + probes PASS) |
| **Ledger** | KNOWN · mitigated (warmup, LIGHT 20s, Proc 16) |
| **Permanent** | Still upstream 15s hardcode → Codex brief exists, not run |
| **Recommendation** | **No action** unless frequency rises |

### 3. XAI_API_KEY environment warning
| | |
|--|--|
| **After swarm+chair** | Config gap (service-managed key listed, not in env file) + OAuth works → errors on restart loop |
| **Status** | **NOISE** while gateway healthy |
| **Recommendation** | **Ignore** operationally; permanent alignment = Jason/Codex secrets (no auto-fix) |

### 4. Aborted / settle timeout family
| | |
|--|--|
| **After swarm+chair** | **Not independent** — downstream of AM embedded abort chain (timestamp-linked) |
| **Recommendation** | Fold into family #1; do not open separate repair |

---

## Ideal user-facing card (this pass)

```text
Runtime Error Doctor

Current health: HEALTHY WITH 1 WATCH ITEM

1. Active-memory child / embedded timeouts
   Status: recurring; current probes PASS
   Risk: low–medium (soft-fail / context miss)
   Recommendation: observe
   Note: abort-settle + "Request was aborted" are cascade, not separate roots
   Structural hypothesis: 12s run budget < ~13.5s recall budget (needs dedicated probe before any config change)

2. memory_search 15s tool timeout
   Status: known and mitigated (workspace)
   Risk: low unless frequency increases
   Recommendation: no action
   Permanent: upstream configurable timeout (Codex) — not urgent

3. XAI_API_KEY env missing on reload
   Status: non-actionable noise while auth/OAuth works and gateway is up
   Recommendation: ignore
   Permanent (optional): Jason/Codex align service-managed secrets — no auto

Unclassified / rejected noise this window:
- agent edit-miss retries
- external web_fetch 403
- junk/partial JSON fingerprints
- prior-report table fragments ingested as errors
(~7 low-confidence leftovers after consolidation)

No Level 2+ repairs recommended.
```

---

## What is still incomplete (for Cursor later — not done now)

1. Default report = **top 5 families** + appendix (not 12 raw incidents).
2. Parent/child merge (runId co-occurrence + tag collapse).
3. Exclude `memory/swarm/runs/**`, ledger, doctor reports from evidence corpus.
4. Stronger punctuation/normalization so aborted. == aborted
5. Incident-specific probes (AM recall latency; optional secret-reload dry check without printing secrets).
6. Wire menu 8 to: run CLI → optional Flash A/B/C on packet → Chair card (this validation is the template).

**Do not promote** full swarm feature complete until (1)–(3) land via **Cursor** and 2–3 more manual runs stay low-noise.

---

## Safety check (this pass)

- No repairs  
- No config edits  
- No gateway restart  
- No log deletion  
- No commits/pushes  
- No ledger writes  
- Workers did not edit files (B read config/env **names only** for diagnosis — Chair notes; no secrets printed in this report)

---

## Process corrections accepted

1. v0.1 was a **deterministic diagnostic engine**; this pass adds **real Flash critique**. Full product still needs engine noise reduction via Cursor.
2. Nova should not default-implement multi-file doctor upgrades; **Cursor** for scripts/tests/docs going forward.

**STOP.**
