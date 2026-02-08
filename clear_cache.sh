#!/bin/bash
echo "=== Clearing Metro cache ==="
pkill -9 -f "expo|node"
sleep 2
rm -rf /home/azureuser/.openclaw/workspace/app/node_modules/.cache
npx expo start --port 8081 --clear &
echo "Starting with fresh cache..."
sleep 20
echo "Done! Check browser in 10 seconds."
