---
pageType: entity
entityType: project
id: entity.fbn-vista-license
title: Big House FBN + Vista city license
canonicalId: ops.fbn-vista-license
aliases:
  - Big House FBN
  - Vista business license
  - FBN newspaper
privacyTier: local-private
bestUsedFor:
  - FBN / Vista license compliance status
  - Do-not-pay / no-chase routing
notEnoughFor:
  - Publisher proof archive contents (inbound only)
lastRefreshedAt: "2026-07-31T22:45:00.000Z"
claims:
  - id: claim.fbn.closed
    text: FBN newspaper publish is CLOSED / CLEAR — published; Jason clear; archive publisher proof when inbound; no chase.
    status: supported
    confidence: 0.95
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Current Fires + retrieval anchors
      - kind: workspace-file
        path: MEMORY.md
        note: Family business durable facts
  - id: claim.vista.not-required
    text: Vista city business license is NOT REQUIRED / CLOSED — 2440 Millegar Ln is unincorporated San Diego County; do not pay pending Vista app.
    status: supported
    confidence: 0.95
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Local business license fire CLOSED
      - kind: workspace-file
        path: MEMORY.md
        note: Vista license durable fact
      - kind: workspace-file
        path: memory/2026-07-22.md
        note: Unincorporated confirmation arc
---

## Summary

Big House FBN newspaper publication and Vista city business license both **CLOSED**. FBN is published / Jason clear. Vista license was never required (unincorporated San Diego County).

## Current state

- FBN newspaper publish: **CLOSED / CLEAR** — proof inbound only; **no chase**
- Vista city business license: **NOT REQUIRED / CLOSED** — 2440 Millegar Ln context = unincorporated SD County; do not pay pending Vista app

## Claims

See structured `claims` in frontmatter.

## Sources

- `WORLD_STATE.md`
- `MEMORY.md`
- `memory/2026-07-22.md` (and related 7/27–7/28 dailies)

## Open questions

- Archive FBN publisher proof when mail/email arrives (passive)

## Notes

<!-- openclaw:human:start -->
<!-- openclaw:human:end -->

## Related

<!-- openclaw:wiki:related:start -->
- [Hilltop listing](hilltop-listing.md)
- path:`WORLD_STATE.md`
- path:`MEMORY.md`
- path:`memory/2026-07-22.md`
<!-- openclaw:wiki:related:end -->
