# Worker packet — STALE class (Swarm CHI · 2026-08-06)

**Worker:** deepseek/deepseek-v4-flash (subagent) · **Mode:** read-only · **Class:** stale
**Scope:** live root docs/scripts/harness meters — skipped dreaming corpus and archives

---

## Finding 1 — Harness meter drift: `lastIdentityCheckAt` stale while date field rolls

- **Path:** `.openclaw/session-startup-state.json:1256-1257` (+ root cause `scripts/lib/session-startup-lib.mjs:290-291`)
- **Stale vs truth:** State says `lastIdentityCheckDate: "2026-08-06"` but `lastIdentityCheckAt: "2026-08-01T07:08:24.433Z"` (5 days back). Actual identity checks are logged daily — `memory/identity-substrate.md` has entries through `## 2026-08-06` (Logged 2026-08-07T00:46:06.741Z = 8/6 17:46 PDT).
- **Root cause:** In `maybeLogIdentityCheck`, the `file_already_has_today_entry` branch updates the date but keeps `state.lastIdentityCheckAt = state.lastIdentityCheckAt || nowIso` — i.e., preserves the first-ever timestamp forever once the file already has today's heading. Date and timestamp fields now disagree.
- **Blast radius:** Continuity/identity freshness consumers reading the state file would conclude "last identity review 8/1" (≈5d) while substrate shows daily checks — under-reads identity continuity; future automated checks keyed on `lastIdentityCheckAt` will mis-fire (skip or flag).
- **Fix class:** update (script one-liner: set `lastIdentityCheckAt = nowIso` in the file_already_has_today_entry branch; plus one-time state repair of the value).
- **Effort:** S

---

## Finding 2 — WORLD_STATE internal age notes stale (understate escalation)

- **Path:** `WORLD_STATE.md` — fires table row "eBay liquidation | **13d** since 7/21"; repeated in "Waiting On" (13d), "Retrieval anchors" ("13 days on 2026-08-03"), "Monitoring Targets" ("13d escalate"). Also fires row "Grok 4.6 release window | **~4d**" (event = 2026-08-07, now ~1d out).
- **Stale vs truth:** Today is 2026-08-06 → eBay intent age is **16d** (7/21→8/6), not 13d; Grok 4.6 is ~1 day out, not ~4d.
- **Note:** file mtime 2026-08-03 14:16 (~3.1d) is under the 7d refresh threshold, so a refresh isn't *mandated* — but the in-file ages themselves are already misleading. Pack-4 flagged the Grok "~4d" as cosmetic; the eBay 13d→16d understate is the higher-value part (escalation severity).
- **Blast radius:** Ops — understates escalation age on the #1 cash fire; repeated in 4 places so any reader gets the stale number.
- **Fix class:** update (next main ops refresh pass; refresh ages to 8/6 values, or drop day-counts for dates like 7/21 + 8/7 which stay true forever).
- **Effort:** S

---

## Finding 3 — verifier skill cites pre-8/1 worker default `zai/glm-5.1`

- **Path:** `skills/verifier-pass-v1/SKILL.md:161` — "Prefer cheaper/different model for verifier when configured (`zai/glm-5.1` worker defaults are fine for mechanical checks)."
- **Stale vs truth:** Swarm/subagent default flipped **2026-08-01** to `deepseek/deepseek-v4-flash` (evidence: `docs/harness/swarm-protocol-v0.md:5`, `MEMORY.md:30`, WORLD_STATE "Cheap worker / swarm default", and this runtime's own session model `deepseek/deepseek-v4-flash`). GLM-5.1 is now an *alt* seat only. Skill was edited today (P5 fix per pack-4 authority pass) but this line survived.
- **Blast radius:** Harness — verifier-spawn guidance names a deprecated default; a spawner following the skill could pin GLM-5.1 for verifier jobs or misread current config. Small but actively consulted skill.
- **Fix class:** update (one line → `deepseek/deepseek-v4-flash`).
- **Effort:** S

---

## Watched / minor (not promoted)
- `cron/security-20260309.json` — leftover 3/9 audit record implying "crons live"; cron/ dir otherwise empty. Low blast; delete or archive-pointer if ever touched.

## Checked and verified CURRENT (do not thrash)
- Cursor pin `cursor-grok-4.5-high` (TOOLS.md = scripts/cursor-worker.sh:35 = swarm-protocol:12) ✓
- Brain `xai/grok-4.5` + swarm `deepseek/deepseek-v4-flash` consistent across WORLD_STATE/MEMORY/swarm-protocol ✓
- HEARTBEAT `openclaw security audit --deep` — flag exists in CLI 2026.7.1-2 ✓
- IDENTITY.md no hardcoded ADA (pack-4 fix in place) ✓; Proc 19 cite fixed in swarm-protocol:214 ✓

---

**status:** PASS
**evidence:** `.openclaw/session-startup-state.json:1256-1257` · `scripts/lib/session-startup-lib.mjs:283-308` (read) · `memory/identity-substrate.md` (tail) · `WORLD_STATE.md` (fires/waiting/anchors/monitoring) · `skills/verifier-pass-v1/SKILL.md:161` · `docs/harness/swarm-protocol-v0.md:5` · `MEMORY.md:30` · `openclaw security audit --help` (exit 0)
**findings:** 3 stale items above (all fix-class update, effort S; no delete/archive needed)
**confidence:** high (all three verified against live files/config; no inference-only claims)
**scope_touched:** read-only — `.openclaw/session-startup-state.json`, `scripts/lib/session-startup-lib.mjs`, `memory/identity-substrate.md`, `WORLD_STATE.md`, `skills/verifier-pass-v1/SKILL.md`, `docs/harness/swarm-protocol-v0.md`, `TOOLS.md`, `HEARTBEAT.md`, `MEMORY.md`, `scripts/cursor-worker.sh`, `memory/swarm/runs/2026-08-06-doc-audit/report.md`; wrote only this packet.
