# Wiki ops entity pack — install

Staging root: `/home/mrbig3/.openclaw/workspace/memory/wiki-ops-pack/`  
Live vault (isolated): `/home/mrbig3/.openclaw/wiki/main`

## 1. Copy entities into vault

```bash
STAGE="/home/mrbig3/.openclaw/workspace/memory/wiki-ops-pack/entities"
VAULT="/home/mrbig3/.openclaw/wiki/main/entities"

cp "$STAGE/hilltop-listing.md" "$VAULT/hilltop-listing.md"
cp "$STAGE/fbn-vista-license.md" "$VAULT/fbn-vista-license.md"
cp "$STAGE/harness-meters.md" "$VAULT/harness-meters.md"
cp "$STAGE/sister-porch.md" "$VAULT/sister-porch.md"
```

Optional synthesis:

```bash
mkdir -p /home/mrbig3/.openclaw/wiki/main/syntheses
cp /home/mrbig3/.openclaw/workspace/memory/wiki-ops-pack/syntheses/ops-now.md \
  /home/mrbig3/.openclaw/wiki/main/syntheses/ops-now.md
```

## 2. Compile, lint, status

Node PATH must be gateway-aligned (≥24.15). Cursor sidecar embeds older Node — prepend nvm 24.18:

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
openclaw wiki compile
openclaw wiki lint
openclaw wiki status
```

## 3. Smoke (optional)

```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
openclaw wiki get entity.hilltop-listing
# or path:
openclaw wiki get entities/hilltop-listing.md
```

## Pass checks

| Check | Expect |
|-------|--------|
| Staging | 4 entity md under `memory/wiki-ops-pack/entities/` |
| Vault | same 4 basenames under `wiki/main/entities/` |
| Status | **Entities ≥ 4** |
| Compile | exit 0 |
| Lint | runs (warnings OK if explained; no crash) |

## If Cursor cannot write outside workspace

Stop after staging + this INSTALL.md. Nova copies into the vault and runs compile/lint/status.

## Do not

- Edit `openclaw.json`, wallet, oauth, or secrets
- Enable bridge / unsafe-local
- Invent MLS dollar prices
- Use `rm` for cleanup (`trash` if needed)
