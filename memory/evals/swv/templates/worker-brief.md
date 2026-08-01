# Worker brief — {{TASK_ID}}

**Role:** Worker  
**Parent:** {{PARENT_REF}}  
**Model hint:** {{MODEL_HINT}}  
**Title:** {{TITLE}}

## Role definition

| Does | Does not |
|------|----------|
| Implement only within scopePaths; produce evidence paths | Expand scope; touch forbidden paths; sole-verify |

## Objective

{{OBJECTIVE}}

## In scope (only these paths)

{{SCOPE_PATHS}}

## Out of scope (hard)

{{OUT_OF_SCOPE}}

## Evidence required

{{EVIDENCE_REQUIRED}}

## Acceptance

{{ACCEPTANCE}}

## Worker output format

1. What changed (paths) or explicit no-op with rationale
2. Commands run + exit codes
3. Evidence paths for Verifier
4. Residual risks / open questions
5. Do **not** self-mark verified — Verifier + Chair decide

## Paste for `sessions_spawn`

Copy this brief as the child task text. Stay inside scopePaths. Forbidden paths are hard stops.
