---
pageType: entity
entityType: project
id: entity.hilltop-listing
title: Hilltop listing
canonicalId: ops.hilltop-listing
aliases:
  - 1434 Hilltop
  - Hilltop Dr
privacyTier: local-private
bestUsedFor:
  - RE sell-through status
  - Price path and condition drag
notEnoughFor:
  - Exact MLS list price (TBD)
  - Live showing calendar
lastRefreshedAt: "2026-07-31T22:45:00.000Z"
claims:
  - id: claim.hilltop.address
    text: Active listing address is 1434 Hilltop Dr, Chula Vista 91911.
    status: supported
    confidence: 0.95
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Current Listings + retrieval anchors
      - kind: workspace-file
        path: MEMORY.md
        note: Family business durable facts
  - id: claim.hilltop.price-path
    text: Price path is −$5,000 per week until sells; $10,000 cumulative reduction so far; exact MLS list price TBD.
    status: supported
    confidence: 0.9
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Current Fires + Current Listings
      - kind: workspace-file
        path: MEMORY.md
        note: Hilltop weekly −$5k path
  - id: claim.hilltop.priority
    text: Hilltop sell-through is priority #1 RE project; condition drag from smell / dirty tenants.
    status: supported
    confidence: 0.9
    evidence:
      - kind: workspace-file
        path: WORLD_STATE.md
        note: Current Projects + Current Risks
---

## Summary

Active RE listing at **1434 Hilltop Dr, Chula Vista 91911**. Sell-through is the #1 RE priority. Condition (smell / dirty tenants) is dragging showings; price is the lever.

## Current state

- Status: **Active** listing · condition drag
- Price path: **−$5,000 per week until sells**; **$10,000 cumulative** reduction so far
- Exact MLS list price: **TBD** (do not invent)
- Priority: #1 RE sell-through

## Claims

See structured `claims` in frontmatter. Human summary:

1. Full address is 1434 Hilltop Dr, Chula Vista 91911.
2. Weekly −$5k path; −$10k cumulative; MLS $ TBD.
3. #1 RE priority with condition drag.

## Sources

- `WORLD_STATE.md` — live fires, listings, retrieval anchors
- `MEMORY.md` — durable Hilltop address + price-path pointer

## Open questions

- Exact MLS list price after latest weekly cut (Jason / MLS)
- Showing outcomes after further cuts

## Notes

<!-- openclaw:human:start -->
<!-- openclaw:human:end -->

## Related

<!-- openclaw:wiki:related:start -->
- [Big House FBN + Vista city license](fbn-vista-license.md)
- [Nova harness meters](harness-meters.md)
- path:`WORLD_STATE.md`
- path:`MEMORY.md`
<!-- openclaw:wiki:related:end -->
