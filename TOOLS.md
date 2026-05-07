# TOOLS.md - Nova Operational Inventory

Keep this file short. Store secrets in `.env` or the platform credential store, never in this file.

## Repo

- Workspace: `nova-training-docs/`
- Primary branch: `main`
- Capability index: `evolution/capability-index.md`
- Verification log: `memory/verification-log.jsonl`

## Local Scripts

- `scripts/session-startup.sh` - session boot check and daily memory stub
- `scripts/session-end.sh` - end-of-session local verification summary
- `scripts/verify-action.sh` - risk-calibrated verification helper

## Verification Commands

```bash
bash scripts/verify-action.sh status
bash scripts/verify-action.sh git
bash scripts/verify-action.sh local docs/VERIFICATION-TIERS.md "Tier 3"
bash scripts/verify-action.sh remote <raw-url> "expected text"
```

## Notes

- Add tool names, paths, and safe test commands here as Nova gains real capabilities.
- Do not list API keys, wallet seeds, passwords, or private tokens.
