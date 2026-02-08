#!/bin/bash
set -e

echo "=== Setting up Expo + Cloudflared as services ==="

# Install services
sudo cp /home/azureuser/.openclaw/workspace/expo.service /etc/systemd/system/
sudo cp /home/azureuser/.openclaw/workspace/cloudflared.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable both services
sudo systemctl enable expo cloudflared

# Stop any manual processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "cloudflared" 2>/dev/null || true
sleep 2

# Start services (Expo first, then cloudflared)
sudo systemctl start expo
sleep 15
echo "Expo started, waiting for it to be ready..."
sudo systemctl start cloudflared

echo ""
echo "✅ Services installed and started!"
echo ""
echo "Check status:"
sudo systemctl status expo --no-pager
sudo systemctl status cloudflared --no-pager
