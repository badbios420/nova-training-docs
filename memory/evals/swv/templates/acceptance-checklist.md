# Acceptance checklist — {{TASK_ID}}

**Title:** {{TITLE}}  
**Parent:** {{PARENT_REF}}  
**Objective:** {{OBJECTIVE}}

## Role gate

| Role | Does | Does not | Status (verified/pending/rejected) |
|------|------|----------|-------------------------------------|
| Scout | Read-only inventory, prior art, risks, open questions | Edit product code; claim done | pending |
| Worker | Implement only within scopePaths; produce evidence paths | Expand scope; touch forbidden paths; sole-verify | pending |
| Verifier | Checklist vs evidence; mark verified/pending/rejected | Rewrite worker output as truth without checks; chair synthesis | pending |

## Scope

**In scope:**

{{SCOPE_PATHS}}

**Out of scope (hard):**

{{OUT_OF_SCOPE}}

## Evidence required

{{EVIDENCE_REQUIRED}}

## Acceptance items

{{ACCEPTANCE}}

## Dry-run grading

| Check | Pass? | Notes |
|-------|-------|-------|
| Task JSON validates | | |
| Scout brief rendered (no leftover required mustache vars) | | |
| Worker brief rendered (no leftover required mustache vars) | | |
| Verifier brief rendered (no leftover required mustache vars) | | |
| Evidence stubs present | | |
| Forbidden paths untouched | | |
| CLI did not auto-spawn agents | | |

## Chair note

Chair (Nova) synthesizes live runs. Verifier marks checklist only — not final promote.
