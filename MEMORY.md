## Personal Preferences

- Favorite sport: Soccer.
- OpenClaw config format: **JSON** (uses `openclaw.json` not YAML)
- **Desktop OS: Windows**
- **Server OS: Linux (Ubuntu)**
- **Communication:** Proactive status updates. When waiting for approval or executing commands, say so immediately. Don't go silent.
- **Model preference:** Can switch between GPT and kimi

## EnPlace – Decisions

- Repository: https://github.com/CryptoPapi7/enPlace.git
- v0.1 scope locked: single-user, mobile-first app focused on calmly cooking one dish end-to-end (single recipe, step-by-step cook mode, local-only, no accounts, no discovery, no backend).
- **Repo location on server:** `/home/azureuser/.openclaw/workspace/app/`
- **Expo dev server:** runs on port 8081 with ngrok tunnel
- **QR code server:** runs on port 8082 for easy phone access
- **Remote development:** Full workflow working — Azure VM runs dev server, user connects via iPhone on any WiFi, live reload works instantly

## Active Sessions

- Main session bridged across Telegram and WebChat (deliveryContext points to telegram, may cause sync quirks)
- Subagent sessions visible in WebChat session switcher

## TODOs

- [ ] **Enable Tailscale on OpenClaw gateway** — allow mobile approvals from phone
  - Needed because approval UI is WebChat-only; currently can't approve while away from computer
  - Config: `gateway.tailscale.mode: "on"` in `/home/azureuser/.openclaw/openclaw.json`

## Key Files

- `TOOLS.md` — local setup notes, URLs, workflows
- `MEMORY.md` — this file, curated long-term memory
- Daily notes in `memory/YYYY-MM-DD.md`
