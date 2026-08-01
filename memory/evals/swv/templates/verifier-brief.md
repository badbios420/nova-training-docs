# Verifier brief — {{TASK_ID}}

**Role:** Verifier  
**Parent:** {{PARENT_REF}}  
**Model hint:** {{MODEL_HINT}}  
**Title:** {{TITLE}}

## Role definition

| Does | Does not |
|------|----------|
| Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis |

## Objective (verify against)

{{OBJECTIVE}}

## Scope under review

{{SCOPE_PATHS}}

## Out of scope (must remain untouched)

{{OUT_OF_SCOPE}}

## Evidence required (must be present)

{{EVIDENCE_REQUIRED}}

## Acceptance criteria

{{ACCEPTANCE}}

## Verifier output format

For each acceptance item mark one of:

- `verified` — evidence path + quote/command cited
- `pending` — missing evidence; what would close it
- `rejected` — contradicted or out-of-scope

Then: overall status, residual risks, and handoff note for Chair (Nova).  
Verifier is mechanical — **Chair synthesizes**; do not promote to durable memory alone.

## Paste for `sessions_spawn`

Copy this brief as the child task text. Check evidence; do not rewrite Worker prose as truth.
