# EnPlace Remote Development Architecture

## Overview

This document describes the distributed development environment for the enPlace mobile cooking application. The architecture enables remote development where the user's workstation can remain idle while all development work happens on a cloud-hosted Linux VM.

## System Components

| Component | Location | Platform | Software Stack |
|-----------|----------|----------|----------------|
| User Workstation | Home | Windows | Browser (occasional use), can sleep |
| iPhone | Mobile | iOS | Expo Go app |
| Azure Cloud | Microsoft datacenter | Cloud platform | Virtual Machine hosting |
| Linux VM | Azure | Ubuntu 22.04 | Node.js v22, npm, Expo CLI, ngrok, OpenClaw gateway, git, Python3 |

## Architecture Diagram

```
┌─────────────────────────┐         ┌─────────────────────────────────┐
│   USER WORKSTATION      │         │      AZURE CLOUD PLATFORM       │
│      (Windows)          │         │                                 │
│  ┌───────────────────┐  │         │  ┌─────────────────────────┐   │
│  │ ┌───────────────┐ │  │         │  │    LINUX VM (Ubuntu)    │   │
│  │ │   Browser     │ │  │         │  │    40.117.250.147       │   │
│  │ │  (optional)   │ │  │         │  │                         │   │
│  │ └───────────────┘ │  │         │  │  ┌───────────────────┐  │   │
│  │      (sleeps)     │  │         │  │  │ OpenClaw Gateway  │  │   │
│  └───────────────────┘  │         │  │  │    Port 18789     │  │   │
└──────────┬──────────────┘         │  │  └───────────────────┘  │   │
           │                        │  │                         │   │
           │  HTTP 8082             │  │  ┌───────────────────┐  │   │
           │  (QR code)             │  │  │ Node.js / Expo CLI│  │   │
           │                        │  │  └─────────┬─────────┘  │   │
           ▼                        │  │            │            │   │
┌─────────────────────────┐         │  │            ▼            │   │
│        iPHONE           │◄════════╪══╪════════╦═══════════════╪═══╡
│    (iOS / Expo Go)      │  ngrok   │  │        ║ Expo Dev      │   │
│                         │  tunnel  │  │        ║ Server        │   │
│  ┌───────────────────┐  │          │  │        ║ Port 8081     │   │
│  │ • Scan QR code    │  │          │  │        ╚═══════╦═══════╝   │
│  │ • Load app        │  │          │  │                ║           │
│  │ • Live reload     │◄════════════╪══╪════════════════╪═══════════╡
│  └───────────────────┘  │          │  │        ┌───────╨───────┐   │
└─────────────────────────┘          │  │        │ ngrok Tunnel  │   │
                                     │  │        │   Port 4040   │   │
                                     │  │        └───────────────┘   │
                                     │  └─────────────────────────────┘
                                     └─────────────────────────────────┘
```

## Data Flow

1. **Development on VM**: Code changes made on the Linux VM
2. **Bundle Creation**: Metro bundler creates JS bundle
3. **Tunnel Establishment**: ngrok creates a public URL pointing to port 8081
4. **Client Connection**: iPhone connects via Expo Go using the tunnel URL
5. **Live Reload**: Code changes automatically push updates to the iPhone

## Network Ports & Services

| Port | Service | Purpose |
|------|---------|---------|
| 8081 | Expo Dev Server | Metro bundler, serves JavaScript bundle |
| 8082 | QR Code Server | Python HTTP server serving QR code PNG |
| 4040 | ngrok API | Tunnel management and status |
| 18789 | OpenClaw Gateway | WebSocket control plane for agent |

## Key Design Decisions

### Why This Architecture?

- **Workstation Independence**: The Windows workstation can sleep or be offline since all development happens on the Azure VM
- **Network Flexibility**: The iPhone can connect from any WiFi network using the public ngrok tunnel
- **Zero Local Setup**: No need to install Node.js, Expo, or development tools on the workstation
- **Live Development**: Instant feedback loop with hot reload working across networks

### Security Considerations

- ngrok tunnels are ephemeral and change on each Expo restart
- QR code server (port 8082) provides easy access without typing URLs
- OpenClaw gateway requires authentication token
- All services run on loopback unless explicitly exposed

## Quick Start Commands

```bash
# Start Expo dev server with tunnel
cd /home/azureuser/.openclaw/workspace/app
npx expo start --tunnel --port 8081

# Start QR code server (in separate terminal)
cd /home/azureuser/.openclaw/workspace
python3 -m http.server 8082

# Access QR code
# http://40.117.250.147:8082/qr.png
```

## Troubleshooting

### Tunnel URL Changes

The ngrok tunnel URL rotates each time Expo restarts. The QR code server ensures you always have quick access to the current connection URL.

### Connection Issues

1. Verify Expo dev server is running on port 8081
2. Check ngrok tunnel is established (port 4040)
3. Ensure iPhone has internet access
4. Try re-scanning the QR code from the server

## Future Enhancements

- Add HTTPS support for QR code server
- Implement persistent tunnel URLs (paid ngrok feature)
- Add CI/CD pipeline for automated builds
- Explore EAS (Expo Application Services) for cloud builds
