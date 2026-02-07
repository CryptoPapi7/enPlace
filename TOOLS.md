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

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.
