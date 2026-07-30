# Memory Health Recovery v0

**Purpose:** Detect and recover from **infra** memory outages (sqlite/CLI/ollama/index), not retrieval ranking quality (that is C3 / retrieval-eval).

**Probe CLI:** `node scripts/memory-health-probe.mjs`  
**Lib:** `scripts/lib/memory-health-lib.mjs`  
**Procedure:** Procedure 16 in `memory/procedural-memory-v1.md`

## When to run

- Startup / session: `memory_search` tool errors (e.g. `database is not open`) while you still need recall
- Suspicious empty recall (agent says “nothing found” but ops facts should exist)
- After gateway restart / crash / Node version swap
- Optional heartbeat / weekly harness health

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
node scripts/memory-health-probe.mjs          # full + markdown report
node scripts/memory-health-probe.mjs --quick  # skip search smoke
node scripts/memory-health-probe.mjs --json
```

Exit codes: **0** pass · **1** fail · **3** degraded (warns only) · **2** probe usage/infra error.

## Interpreting results

| Overall | Meaning |
|---------|---------|
| `pass` | Checks green (skips OK). Safe to trust CLI memory path for infra. |
| `degraded` | Warns only (e.g. Dirty=yes, soft workspace gaps). Usable but investigate. |
| `fail` | Any hard fail — **do not claim memory healthy**. Follow ladder below. |

Never treat “tool returned empty” as proof the index is empty without a probe (or direct CLI) confirmation.

## Recovery ladder (read-only first)

1. **Ollama up**
   ```bash
   curl -s localhost:11434/api/tags
   ```
2. **Embed model pulled** (default `nomic-embed-text`)
   ```bash
   curl -s localhost:11434/api/tags | grep nomic-embed-text
   # if missing: ollama pull nomic-embed-text
   ```
3. **Status**
   ```bash
   export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
   openclaw memory status
   ```
4. **Search smoke**
   ```bash
   openclaw memory search "Vista business license" --json | head
   ```
5. **Sqlite missing/corrupt**
   - Path: `~/.openclaw/agents/main/agent/openclaw-agent.sqlite` (+ `-shm` / `-wal`)
   - **Do not delete** the DB. Escalate; restore from known backup if one exists.
   - Probe may run `PRAGMA integrity_check` only if `sqlite3` is on PATH.
6. **Tool flake but CLI OK**
   - Gateway / agent tool-path issue. Retry once; open a new session.
   - **Do not trust empty recall** from the tool while CLI search returns hits.
7. **Optional reindex (explicit only)**
   - Probe discovers commands via `openclaw memory --help` and lists them in remediation.
   - Common (document only — **probe never executes**):
     - `openclaw memory index`
     - `openclaw memory index --force`
     - `openclaw memory status --fix` (stale recall locks — confirm before use)
   - Run reindex only with Jason/Nova approval when status shows indexed 0 or stuck dirty after ladder 1–4.

## What this is not

- Not retrieval hit@k scoring (`scripts/retrieval-eval.mjs`)
- Not claim discipline (`scripts/claim-guard.mjs`)
- Does not modify the memory DB
