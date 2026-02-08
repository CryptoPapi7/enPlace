# EnPlace Remote Development Architecture

## Overview

This document describes the distributed development environment for the enPlace mobile cooking application. The architecture enables remote development where the user's workstation can remain idle while all development work happens on a cloud-hosted Linux VM.

**Last Updated:** 2026-02-08 - Major infrastructure overhaul with Tailscale, Telegram approvals, and systemd services

## System Components

| Component | Location | Platform | Software Stack | Access Method |
|-----------|----------|----------|----------------|---------------|
| User Workstation | Home | Windows | Browser, SSH | Tailscale (100.89.156.81) |
| iPhone | Mobile | iOS | Expo Go app, Telegram | Tailscale + Telegram |
| Azure Cloud | Microsoft datacenter | Cloud platform | Virtual Machine | Public IP |
| Linux VM | Azure | Ubuntu 22.04 | Node.js v22, npm, Expo CLI, OpenClaw, Tailscale, cloudflared | Tailscale IP: 100.102.100.72 |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TAILSCALE NETWORK                                  │
│                         (100.x.x.x mesh VPN)                                 │
│                                                                              │
│  ┌───────────────────┐          ┌──────────────────────────────────────┐   │
│  │  iPhone           │          │     AZURE CLOUD PLATFORM             │   │
│  │  (iOS)            │          │                                      │   │
│  │  100.108.205.65   │          │  ┌──────────────────────────────┐   │   │
│  │                   │          │  │     LINUX VM (Ubuntu)        │   │   │
│  │  ┌─────────────┐  │          │  │     Tailscale: 100.102.100.72│   │   │
│  │  │   Expo Go   │◄═╦═════════╪══╪══╡     Public: 40.117.250.147 │   │   │
│  │  │   App       │  ║          │  │  │                             │   │   │
│  │  └─────────────┘  ║          │  │  │  ┌───────────────────────┐  │   │   │
│  │                   ║          │  │  │  │ OpenClaw Gateway      │  │   │   │
│  │  ┌─────────────┐  ║          │  │  │  │ Port 18789 (LAN)      │  │   │   │
│  │  │  Telegram   │  ║          │  │  │  └───────────────────────┘  │   │   │
│  │  │  Approvals  │◄═╝          │  │  │                             │   │   │
│  │  └─────────────┘             │  │  │  ┌───────────────────────┐  │   │   │
│  └───────────────────┘          │  │  │  │ Expo Dev Server       │  │   │   │
│                                  │  │  │  │ Port 8081             │  │   │   │
│  ┌───────────────────┐          │  │  │  └───────────┬───────────┘  │   │   │
│  │ Windows Desktop   │          │  │  │              │              │   │   │
│  │ 100.89.156.81     │◄═════════╪══╪══╪══════════════╪══════════════╡   │   │
│  │                   │  Tailscale│  │  │              │              │   │   │
│  │  ┌─────────────┐  │   SSH     │  │  │  ┌───────────▼───────────┐  │   │   │
│  │  │  Browser    │  │           │  │  │  │ systemd services:     │  │   │   │
│  │  │  (Webchat)  │◄═╪═══════════╪══╪══╡  │  - expo.service       │  │   │   │
│  │  └─────────────┘  │           │  │  │  │  - tailscaled         │  │   │   │
│  └───────────────────┘           │  │  │  │  - cloudflared        │  │   │   │
│                                    │  │  │  └───────────────────────┘  │   │   │
└────────────────────────────────────┴──┴──┴──────────────────────────────┴───┴───┘

## Access Matrix by Device

### From iPhone

| Service | URL/Method | Notes |
|---------|------------|-------|
| **Expo Go** | `exp://100.102.100.72:8081` | Requires Tailscale app on phone |
| **Telegram Approvals** | Reply `/approve [ID] allow-once` | Full UUID required |
| **QR Code** | http://40.117.250.147:8082/qr.png | Static QR for Expo Go |

### From Windows Desktop

| Service | URL/Method | Notes |
|---------|------------|-------|
| **OpenClaw Webchat** | `http://10.0.0.4:18789` | Via Tailscale (same network) |
| **SSH Access** | `ssh azureuser@40.117.250.147` | Direct to VM |
| **Tailscale Admin** | https://login.tailscale.com | Manage devices |

### From VM Itself

| Command | Purpose |
|---------|---------|
| `tailscale status` | Check VPN connections |
| `sudo systemctl status expo` | Check Expo server |
| `sudo systemctl status tailscaled` | Check Tailscale daemon |
| `qrencode -o qr.png "exp://100.102.100.72:8081"` | Generate QR code |

## Network Ports & Services

| Port | Service | Purpose | Access From |
|------|---------|---------|-------------|
| 8081 | Expo Dev Server | Metro bundler | Tailscale network |
| 8082 | QR Code Server | Python HTTP server | Public internet |
| 18789 | OpenClaw Gateway | WebSocket control plane | LAN + Tailscale |
| 41641 | Tailscale | UDP tunnel traffic | Tailscale mesh |

## Infrastructure Components

### 1. Tailscale (VPN Mesh)

**Purpose:** Secure private network connecting all devices
- **VM:** `100.102.100.72`
- **Windows Desktop:** `100.89.156.81`
- **iPhone:** `100.108.205.65`
- **Tailnet:** CryptoPapi7's network

**Why Tailscale?**
- Expo Go requires `exp://` URLs (not HTTP/HTTPS)
- ngrok free tier now requires verified account
- Tailscale gives direct IP access within private mesh
- No port forwarding or firewall changes needed

### 2. Cloudflared (HTTPS Tunnels)

**Purpose:** Public HTTPS access for web services
- **Ephemeral tunnels** created on-demand
- **Use case:** Share development URLs temporarily
- **Note:** Free tunnels rotate URLs on restart

### 3. Systemd Services (Auto-start)

| Service | Auto-starts | Status Command |
|---------|-------------|----------------|
| `expo` | ✅ On boot | `sudo systemctl status expo` |
| `cloudflared` | ✅ On boot | `sudo systemctl status cloudflared` |
| `tailscaled` | ✅ On boot | `sudo systemctl status tailscaled` |
| `openclaw-gateway` | ✅ On boot | `sudo systemctl status openclaw-gateway` |

### 4. Telegram Approvals

**Configuration:** Added to `openclaw.json`:
```json
"approvals": {
  "exec": {
    "enabled": true,
    "mode": "targets",
    "agentFilter": ["main"],
    "targets": [
      { "channel": "telegram", "to": "8219560186" }
    ]
  }
}
```

**How to approve from phone:**
1. Wait for "Approval required (id xxxxxxxx-xxxx-..." message
2. Reply with: `/approve xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx allow-once`
3. Use `allow-always` to whitelist the command pattern
4. **Important:** Use the FULL UUID, not just the short ID

## Quick Reference Commands

### Start/Stop Services
```bash
# Expo dev server (systemd)
sudo systemctl start expo
sudo systemctl stop expo
sudo systemctl restart expo

# Tailscale
sudo tailscale up
tailscale status

# All services
sudo systemctl status expo tailscaled openclaw-gateway
```

### Generate QR Code
```bash
cd /home/azureuser/.openclaw/workspace
qrencode -o qr.png "exp://100.102.100.72:8081"
# Access at: http://40.117.250.147:8082/qr.png
```

### Backup Config (REQUIRED before edits)
```bash
BACKUP="$HOME/.openclaw/backups/openclaw.json.$(date +%Y%m%d-%H%M%S).bak"
cp "$HOME/.openclaw/openclaw.json" "$BACKUP"
echo "✅ Backed up to: $BACKUP"
```

## Key Design Decisions

### Why Tailscale over ngrok?
- **ngrok free tier:** Now requires verified account + authtoken (ERR_NGROK_4018)
- **Expo Go:** Requires `exp://` protocol which ngrok can't provide
- **Tailscale:** Direct IP access, no URL rotation, works with Expo Go

### Why systemd services?
- VM reboots don't break development environment
- Auto-restart on crash
- Logs available via `journalctl`
- Production-grade process management

### Why Telegram approvals?
- Mobile-friendly (already have Telegram on phone)
- No web UI needed for approvals
- Audit trail in chat history
- Works from anywhere with internet

## Troubleshooting

### Expo Go won't connect
1. Check Tailscale app is running on phone
2. Verify phone has Tailscale IP: `tailscale status` on VM
3. Ensure phone and VM are in same tailnet (CryptoPapi7)
4. Try refreshing Tailscale connection on phone

### Telegram approval "unknown ID"
- Approval IDs expire after ~30 seconds
- Use FULL UUID format (with dashes)
- Type `/approve` command quickly

### Can't access webchat on desktop
- Ensure Windows machine has Tailscale installed
- Check same account logged in
- Verify status: `tailscale status` should show both devices

### Service won't start
```bash
# Check logs
sudo journalctl -u expo -n 50
sudo journalctl -u openclaw-gateway -n 50

# Validate config
openclaw gateway config  # Will show errors
```

## Security Notes

- **Tailscale:** Private mesh, no exposed ports to internet
- **Expo:** Only accessible within Tailscale network
- **Gateway:** Requires auth token even on LAN
- **Backups:** Always created before config changes at `~/.openclaw/backups/`
- **Approval system:** All exec commands require explicit approval

## Future Enhancements

- [ ] Persistent cloudflared tunnel with custom domain
- [ ] HTTPS certificates via Tailscale for gateway
- [ ] Discord integration for multi-agent setup
- [ ] CI/CD pipeline for automated test builds
- [ ] EAS (Expo Application Services) integration
