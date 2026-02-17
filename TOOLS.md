# TOOLS.md - Local Notes

## EnPlace Repository
- **GitHub:** https://github.com/CryptoPapi7/enPlace.git
- **Description:** Mobile-first cooking app (React Native + Expo)

## Remote Development Workflow

**Architecture:** This Azure VM runs the dev server. User connects via iPhone on different WiFi.

### Starting the Expo Dev Server

```bash
cd /home/azureuser/.openclaw/workspace/app
npm install  # install deps
npx expo start --tunnel --port 8081
```

### QR Code Sharing Trick

When ngrok tunnel is running, serve the QR code via HTTP:

```bash
# In one terminal - start simple http server in workspace
cd /home/azureuser/.openclaw/workspace
python3 -m http.server 8082

# Generate QR code
qrencode -o qr.png "exp://TUNNEL-URL.exp.direct"

# Access at: http://VM-IP:8082/qr.png
```

### Current Expo Instance
- Dev server runs on port 8081
- Tunnel URL: `https://knyrmhy-anonymous-8081.exp.direct` (rotates each restart)
- QR server on port 8082
- **CRITICAL:** Expo runs as **system service** — not interactive terminal
  - User **cannot** press "R" or run `expo start` directly
  - User reloads via service restart or their own mechanism
  - I should NEVER suggest "press R" or terminal commands

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Critical Config Backup Protocol

**RULE: Backup BEFORE editing any of these files:**
- `/home/azureuser/.openclaw/openclaw.json`
- `/home/azureuser/.openclaw/litellm_config.yaml`
- Any systemd service files

**ALWAYS tell the user the exact backup path immediately after creating it.**

**Command pattern:**
```bash
BACKUP="/path/to/backups/file.$(date +%Y%m%d-%H%M%S).bak"
cp /path/to/file "$BACKUP"
echo "✅ Backed up to: $BACKUP"
echo "To restore: cp $BACKUP /path/to/file"
```

**Never skip this. Ever. TELL THEM THE PATH EVERY TIME.**
