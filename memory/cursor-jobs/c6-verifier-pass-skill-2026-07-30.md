# C6 — Verifier Pass Skill Workshop (2026-07-30)

**Status:** **APPLIED 2026-07-30 ~00:17 PDT**  
Jason delegated ("your call"). skill_workshop apply tool approval expired; CLI apply succeeded.

**Live path:** `skills/verifier-pass-v1/SKILL.md` (8050B)

## Proposal

| Field | Value |
|-------|-------|
| Name | `verifier-pass-v1` |
| ID | `verifier-pass-v1-20260730-de97704f5f` |
| Status | **pending** |
| Path | `~/.openclaw/skill-workshop/proposals/verifier-pass-v1-20260730-de97704f5f` |

## What it does

Operationalizes **Procedure 11** (Gen → Verify):

1. Atomicize claim list  
2. Optional `claim-guard` pre-scan  
3. Bind each claim to evidence (direct → primary → SoT; never dreams/AM alone)  
4. Emit **verified / pending / rejected** table + **SHIP OK / SHIP BLOCKED** gate  
5. Optional claim-ledger append + trajectory-closeout  

Pairs with: C2 claim-guard · claim-ledger · C5 trajectory-closeout · C4 memory-health when recall is suspect.

## Jason actions

```text
# Read / apply only when you want it live as a skill:
# (OpenClaw skill workshop UI or ask Nova: "apply verifier-pass-v1")
```

- **Apply** → skill becomes available for sessions  
- **Reject / quarantine** → if you don't want it  
- Until apply: Nova can still **follow the procedure manually** from Proc 11 + this proposal text

## Acceptance (C6 job)

1. Workshop proposal created pending — **yes**  
2. No auto-apply — **yes**  
3. Job report + queue/daily/ledger updated — **yes**  
4. Aligns with Procedure 11 + claim-guard — **yes**  
