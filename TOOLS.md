# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Cursor Agent sidecar (Ubuntu/WSL) — Nova-controlled worker

**Intent:** Cursor CLI is an engineering worker Nova can dispatch, similar to Codex.

| Item | Value |
|------|--------|
| Binary | `~/.local/bin/agent` (also `cursor-agent`) |
| Version installed | `2026.07.23-e383d2b` (2026-07-28) |
| Workspace | `/home/mrbig3/.openclaw/workspace` |
| Launcher | `scripts/cursor-worker.sh` |
| Rules | `.cursor/rules/nova-sidecar.mdc` |
| Auth | **Required** — `agent login` or `CURSOR_API_KEY` |
| Job logs | `memory/cursor-jobs/` |

### Auth (Jason one-time)
```bash
export PATH="$HOME/.local/bin:$PATH"
agent login          # browser on Windows host if linked; or
# export CURSOR_API_KEY='...'
agent status
```

### Nova dispatch patterns
```bash
# status
scripts/cursor-worker.sh status

# read-only / plan
scripts/cursor-worker.sh read "..."
# equivalent:
agent -p --mode plan --workspace /home/mrbig3/.openclaw/workspace "..."

# implement (explicit only)
scripts/cursor-worker.sh write "..."   # uses --force
```

### Quorra nuggets stolen (keep)
1. **Codex/Cursor pattern:** executive scopes + acceptance tests; worker implements; executive verifies diffs/tests.
2. **TTY:** interactive agent needs PTY/tmux when not using `-p` print mode.
3. Prefer `-p` / `--mode plan|ask` for Nova automation; use tmux only if TUI required.
4. Never run unconstrained `--force` without Jason/Nova implement intent.

### Do not
- Install GUI Cursor AppImage for sidecar use
- Let worker edit wallet/secrets/openclaw.json unless task says so
- Treat Cursor apply as proven — Nova still verifies

### Node PATH (required for openclaw from sidecar)
- Gateway-aligned Node: `~/.nvm/versions/node/v24.18.0/bin` (≥24.15 required)
- Cursor embeds older Node (observed **v24.5.0**) — breaks `openclaw` CLI
- `scripts/cursor-worker.sh` prepends nvm 24.18 when present

---

## gog (Google Workspace CLI) — Nova path

| Item | Value |
|------|--------|
| Binary | `gog` (`~/.npm-global/bin/gog`) |
| Account | `jasontbethurum@gmail.com` |
| Credentials | `~/.config/gogcli/credentials.json` (Jason's Desktop OAuth client) |
| Keyring | needs `GOG_KEYRING_PASSWORD` in non-interactive shells (set in `~/.bashrc`) |
| Scopes | gmail.modify, calendar, drive, contacts, sheets |

### Sister porch (Quorra ↔ Nova)
- Folder: `Quorra ↔ Nova`
- Doc: `Sister Check-in Log` → id `19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI`
- Read: `gog docs cat 19xm8g0r0iNpvihAh_JnX8shUzfBLyIUZUpBqyTkESZI -a jasontbethurum@gmail.com`
- Reply: `gog docs write … --append --text '…'`
- Quorra uses **gws** + project `quorra-489901` (encrypted creds). Different CLI, same account.
- Procedure 15: check/reply end of significant sessions.

### Safety
- Claim shared external actions on the porch before Gmail purge/send/delete races
- Never put secrets in the porch doc
- Confirm before any gmail send

---

## Shared browser (Jason + Nova) — Windows Chrome remote CDP

**Goal:** One Chrome window on Windows that Jason sees/controls and Nova drives via CDP.

**Status 2026-07-28:** P0 spike in progress. Profiles today: `openclaw` (managed WSL chromium, stopped), `user` (chrome-mcp, stopped), `chrome` (extension, stopped). No remote profile configured yet. WSL probes to `10.255.255.254:9222` and `127.0.0.1:9222` failed (nothing listening).

**#1 architecture (audit):** OpenClaw profile `remote` → Windows Chrome dedicated user-data-dir + `--remote-debugging-port=9222` + `attachOnly: true`.
Docs: `openclaw` → `docs/tools/browser-wsl2-windows-remote-cdp-troubleshooting.md`

### Security gates
- Dedicated profile only — **never** attach to Jason primary Chrome with password manager unlocked
- Jason approval before login / pay / wallet connect / email / social post
- Jason types secrets; no password dump into chat/memory
- CDP not bound to `0.0.0.0` / LAN / tailnet casually
- Keep separate: `personal` (Jason only) | `shared-ops` (this) | `openclaw` managed (agent-only)

### P0 — Jason on Windows (PowerShell)
```powershell
# 1) Start dedicated Chrome (Chrome 136+ needs non-default user-data-dir)
chrome.exe --remote-debugging-port=9222 --user-data-dir="$env:LOCALAPPDATA\OpenClaw\ChromeCDP"

# 2) Verify on Windows first
curl.exe http://127.0.0.1:9222/json/version
curl.exe http://127.0.0.1:9222/json/list

# 3) If only [::1] listens, or WSL cannot reach 127.0.0.1, set portproxy carefully.
# Prefer forwarding WSL-reachable Windows host IP → Chrome loopback (not 0.0.0.0).
# Discover WSL view of Windows host from Ubuntu: grep nameserver /etc/resolv.conf
netstat -ano | findstr :9222
netsh interface portproxy show all
# Example (adjust LISTEN_IP to the address WSL can route to):
# netsh interface portproxy add v4tov4 listenaddress=LISTEN_IP listenport=9222 connectaddress=127.0.0.1 connectport=9222
# If Chrome bound IPv6 only:
# netsh interface portproxy add v4tov6 listenaddress=LISTEN_IP listenport=9222 connectaddress=::1 connectport=9222
```

### P0 — Nova on WSL (after Chrome is up)
```bash
export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"
WINHOST=$(awk '/nameserver/{print $2; exit}' /etc/resolv.conf)
curl -sS -m 3 "http://$WINHOST:9222/json/version"
curl -sS -m 3 "http://$WINHOST:9222/json/list"
# Also try Windows host via default route if nameserver fails:
# ip route | awk '/default/{print $3; exit}'
```

Good: JSON with Browser / Protocol-Version. Then Nova applies config (backup first):
```json5
browser: {
  enabled: true,
  defaultProfile: "remote",  // or keep openclaw default; use --browser-profile remote
  profiles: {
    remote: {
      cdpUrl: "http://WINDOWS_HOST_OR_IP:9222",
      attachOnly: true,
      color: "#00AA00",
    },
  },
}
```

### P1 pilot checks
```bash
openclaw browser --browser-profile remote doctor
openclaw browser --browser-profile remote open https://example.com
openclaw browser --browser-profile remote tabs
openclaw browser --browser-profile remote snapshot
```
Jason should see the tab open on Windows and be able to take over the mouse.

### Helper
- `scripts/shared-browser-p0-check.sh` — non-destructive reachability probe from WSL
