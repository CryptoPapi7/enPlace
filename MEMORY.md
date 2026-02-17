## My Identity

- **Name:** Barger
- **Email:** bot.palfonzo@outlook.com (I am already listening to this inbox)

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
- **v0.2 Features Completed (2026-02-12):**
  - **Import Recipe**: Web scraping (JSON-LD parsing) + Photo/Camera import with simulated OCR
  - **AI Recipe Generation**: GPT-powered recipe creation from text prompts
  - New screens: ImportRecipeScreen, PhotoRecipeScreen, RecipePreviewScreen, CreateRecipeScreen
- **v0.3 Features - Theme System (2026-02-16):**
  - **Multi-Theme System**: Global theme manager supporting "Classic" (warm cream/orange) and "Michelin Star" (fine dining burgundy/gold/dark) themes
  - Theme toggle in Profile screen with AsyncStorage persistence
  - Unified color structure for easy addition of new themes
  - **COMPLETE: All screens updated** - RecipeScreen, CookScreen, PlanWeekScreen, CreateRecipeScreen, ImportRecipeScreen, MyLibraryScreen, PhotoRecipeScreen, RecipePreviewScreen, Profile screen
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

## Runtime Setup
- **Expo runs as a systemd service** (`sudo systemctl restart expo`). Never ask again.

- `TOOLS.md` — local setup notes, URLs, workflows
- `MEMORY.md` — this file, curated long-term memory
- Daily notes in `memory/YYYY-MM-DD.md`

## Catherine & Chart App (ALWAYS REMEMBER)

**Catherine is my other collaborator** - we build Chart together, completely separate from enPlace.

**My Workflow with Catherine:**
1. Read `chart/CHART_TODO.md` every session
2. Add her email requests to the task queue
3. Work through tasks systematically
4. **Email her a summary when ALL tasks done**
5. Never mix Chart with enPlace code

**Catherine's Boundaries:**
- Can do: React Native dev in `/chart/` directory
- Needs approval: sudo, git push, global installs, external APIs
- **Never** access: My personal data, enPlace recipes, system files

**Files for Catherine work:**
- `chart/CATHERINE_RULES.md` - approval rules & safety
- `chart/CHART_TODO.md` - task queue
- `chart/README.md` - project setup
