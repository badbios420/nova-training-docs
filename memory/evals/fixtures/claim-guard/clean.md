# Claim Guard clean fixture (claims with evidence)

## Summary
- CLAIM: Deploy is done and feature shipped
- STATUS: verified
- EVIDENCE: `node scripts/claim-guard.mjs --help` exit 0; path `scripts/lib/claim-guard-lib.mjs`
- CHECKED: 2026-07-29

The bug is fixed.
EVIDENCE: `memory/claim-ledger.md` and openclaw config validate exit 0

Patch is working after clean install of deps.
EVIDENCE: node scripts/test-claim-guard.mjs exit 0 — PASS 12/12

Live suite results published at https://example.com/report
