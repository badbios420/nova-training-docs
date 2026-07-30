# C5 — Trajectory Closeout CLI (2026-07-30)

**Status:** PASS — **Nova-direct** (Jason: your call go; skipped Cursor/Codex for small job)  
**~00:06–00:08 PDT**

## Shipped

| Piece | Path |
|-------|------|
| Lib | `scripts/lib/trajectory-closeout-lib.mjs` |
| CLI | `scripts/trajectory-closeout.mjs` |
| Tests | `scripts/test-trajectory-closeout.mjs` — **10/10** |
| Procedure 13 | hooked with CLI checklist |
| Live entry | `memory/trajectory-log.md` — `2026-07-30 — Alpha P0 night C1-C4 + C5 CLI` |
| Scorecard touch | `memory/harness-scorecard.md` — Trajectory closeout row |

## Run

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/test-trajectory-closeout.mjs
node scripts/trajectory-closeout.mjs --help
node scripts/trajectory-closeout.mjs --list 5
node scripts/trajectory-closeout.mjs --dry-run \
  --title "..." --goal "..." --actions "..." \
  --evidence "..." --outcome win --lesson "..."
node scripts/trajectory-closeout.mjs \
  --title "..." --goal "..." --actions "..." \
  --evidence "..." --outcome win|partial|fail --lesson "..." \
  [--follow-up "..."] [--scorecard]
```

Exit: 0 ok · 1 validation · 2 usage/infra

## Acceptance

1. Deliverables exist — yes  
2. Unit 10/10 — yes  
3. Live append + list — yes  
4. Procedure 13 CLI hook — yes  
5. No openclaw.json / wallet / fallback work — yes  
