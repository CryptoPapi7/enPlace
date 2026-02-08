#!/bin/bash
set -e

echo "=== Setting up Expo as a systemd service ==="

# 1. Install the service
sudo cp /home/azureuser/.openclaw/workspace/expo.service /etc/systemd/system/

# 2. Reload systemd
sudo systemctl daemon-reload

# 3. Enable service to start on boot
sudo systemctl enable expo

# 4. Stop any running expo manually
pkill -f "expo start" 2>/dev/null || true

# 5. Start the service
sudo systemctl start expo

# 6. Check status
sleep 3
sudo systemctl status expo --no-pager

echo ""
echo "✅ Expo service installed!"
echo "Commands:"
echo "  sudo systemctl start expo    - Start Expo"
echo "  sudo systemctl stop expo     - Stop Expo"
echo "  sudo systemctl restart expo  - Restart Expo"
echo "  sudo systemctl status expo   - Check status"
echo "  sudo journalctl -u expo -f   - View logs"
