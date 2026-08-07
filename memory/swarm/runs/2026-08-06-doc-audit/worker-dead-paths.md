# Worker packet — DEAD-PATHS (menu 4 doc/file audit support)

status: PASS
evidence: [ls/test -e checks, grep -rnoE path extraction across corpus; commands: `test -e`, `ls docs/tools/`, `ls memory/evals/swv/templates/`, `grep -rln <basename> <corpus>`, `grep -nE 'templates|brief' scripts/lib/swv-dry-harness-lib.mjs`, `ls /home/mrbig3/.openclaw/wiki/main/entities/`]
findings:
- MISS `docs/tools/browser-wsl2-windows-remote-cdp-troubleshooting.md` — TOOLS.md (shared-browser section) points here as the P0 browser docs; `docs/tools/` directory does not exist. Doc promised but never written (only docs/{chamber-*,harness/} exist).
- MISS `scripts/swarm-pack-run.mjs` — docs/harness/swarm-protocol-v0.md §6 ship item #4 and §4 execution step reference it; never built (swarm runs so far were Nova-manual). Doc hedges "**or** Nova-manual first", so it is planned-but-unbuilt, not silently broken.
- MISS `memory/swarm/packs/chi-v0.json` — swarm-protocol-v0.md §6 ship item #2; menu packs 1–2 (chi/regress) have no pack JSON. Only error-doctor-v0.json + git-lockin-inventory-v0.json exist in memory/swarm/packs/.
- MISS `memory/swarm/packs/regress-v0.json` — §6 ship item #3; same as above.
- MISS `memory/index/` — memory/procedural-memory-v1.md:395 says "after memory/index/embedding changes"; no memory/index dir (embed index lives in runtime store, not workspace). Minor/informational.
- MISS `templates/CLI/tests/Proc 18` — memory/2026-08-01.md:212 garbled reference (meant "templates + CLI + tests for Procedure 18"; actual templates/ holds only session-consolidation-template.md). Low severity, daily-note only.
- PATTERN (expected absent, NOT broken): memory/research-YYYY-MM-DD-topic.md (procedural-memory-v1.md:356 — filename template; concrete files exist), memory/cursor-jobs/retrieval-eval-report-YYYYMMDD-HHMM.md (retrieval-eval-set-v1.md:91 — pattern; concrete reports exist), memory/YYYY-MM-DD.md, memory/jason-*.md, memory/10k-nft-*.md (globs resolve to real files).
- RENAME-VERIFIED OK: memory/evals/swv/templates/ — doc says "Scout/Worker/Verifier briefs + acceptance checklist"; actual files scout-brief.md / worker-brief.md / verifier-brief.md / acceptance-checklist.md; scripts/lib/swv-dry-harness-lib.mjs:246 uses `${kind}-brief.md`, so CLI↔files consistent. Not broken.
- PRESENT (spot-verified): all 30+ memory files in retrieval-eval-set-v1.md (incl. 2026-06-23-wallet-v2.md, 2026-07-22.md, ops-fact-cards-v1.md, research-2026-07-27-top-agent-harness.md, chambers/chamber-9-verdict.md); all harness scripts (claim-guard.mjs, error-doctor.mjs, git-lockin-inventory.mjs, memory-health-probe.mjs, memory-embed-warmup.mjs, nova-task-grade.mjs, retrieval-eval.mjs, session-startup.mjs, trajectory-closeout.mjs, swv-dry-harness.mjs, cursor-worker.sh, shared-browser-p0-check.sh + scripts/lib/*.mjs ×11); memory/wiki-ops-pack/{INSTALL.md, entities/×4, syntheses/ops-now.md}; live wiki vault /home/mrbig3/.openclaw/wiki/main/entities/ has all 4 entities + index.md; .cursor/rules/nova-sidecar.mdc; memory/error-doctor-ledger.md; memory/harness-scorecard.md; memory/heartbeat-state.json; memory/self-improvement-log.md; memory/trajectory-log.md; memory/ebay-cash-bridge-prep-v0.md; memory/wallet-gen/verify-custody-v2.js; memory/cursor-jobs/{c8,c9,retrieval-eval-report-20260729-2049,swv-runs/SWV-DRY-001-*}; ~/.npm-global/bin/gog + ~/.config/gogcli/credentials.json; ~/.local/bin/agent; ~/.nvm/versions/node/v24.18.0/bin/node; skills/recursive-self-improve (HEARTBEAT ref).
- ORPHAN SCRIPTS (in scripts/, harness-critical by name heuristic, filename never mentioned in AGENTS/TOOLS/HEARTBEAT/MEMORY/WORLD_STATE/procedural-memory-v1/docs/harness/packs):
  1. scripts/test-active-memory-smoke.mjs — AM smoke suite shipped per swarm-protocol milestone text but never named in docs; pairs with scripts/lib/active-memory-smoke-lib.mjs
  2. scripts/test-memory-before-speech.mjs — no doc ref; eval doc memory/evals/memory-before-speech-meter-v0.md exists outside listed corpus
  3. scripts/test-memory-health.mjs — no doc ref (probe is documented, its test is not)
  4. scripts/test-nova-task-grade.mjs — no doc ref; eval docs memory/evals/nova-task-suite-v0.{md,json} exist
  5. scripts/test-protected-settings-guard.mjs — no doc ref
  6. scripts/test-session-startup.mjs — no doc ref (session-startup.mjs itself is documented)
  7. scripts/test-trajectory-closeout.mjs — no doc ref
  8. scripts/memory-before-speech-meter.mjs — Layer-B meter script, unmentioned by name
  9. scripts/protected-settings-guard.mjs — security guard script, unmentioned by name
  10. scripts/start-shared-chrome-windows.sh — browser-ops helper; TOOLS.md documents cdp-bridge.ps1 + shared-browser-p0-check.sh but not this
  (non-harness, excluded: gmail-unsub-batch*.mjs, sync-training-repos.sh, desktop-inventory.py, organize-onedrive-desktop.py, parse-gmail-scan.py)
confidence: high
scope_touched: [AGENTS.md, TOOLS.md, HEARTBEAT.md, MEMORY.md, WORLD_STATE.md, memory/procedural-memory-v1.md, docs/harness/{swarm-protocol-v0,swv-dry-harness-v0,wiki-ops-entity-pack-v0,retrieval-eval-set-v1}.md, docs/chamber-protocol-v0.1.md, memory/swarm/packs/{error-doctor-v0,git-lockin-inventory-v0}.json, memory/swarm/runs/2026-08-06-doc-audit/scope.json, memory/evals/swv/templates/, scripts/lib/swv-dry-harness-lib.mjs, memory/wiki-ops-pack/entities/hilltop-listing.md, memory/2026-08-01.md, scripts/ listing]
