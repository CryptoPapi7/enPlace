#!/bin/bash
cd /home/azureuser/.openclaw/workspace/app/assets/images

# Create missing logo files (1x1 transparent PNG)
echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > react-logo.png
cp react-logo.png partial-react-logo.png

echo "Created placeholder images"
ls -la react-logo.png partial-react-logo.png
