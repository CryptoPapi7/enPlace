#!/bin/bash
cd /home/azureuser/.openclaw/workspace/app/assets

# 1. Extract animation JSON from .lottie
unzip -p stirring.lottie animations/*.json > stirring_backup.json

# 2. Extract all images
rm -rf images 2>/dev/null
unzip -o stirring.lottie "images/*"

# 3. Convert images to base64 and embed in JSON
python3 << 'PYEOF'
import json
import base64
import os

# Read the JSON
with open('stirring_backup.json', 'r') as f:
    data = json.load(f)

# Convert images to base64 and embed
for asset in data.get('assets', []):
    img_path = f"images/{asset['p']}"
    try:
        with open(img_path, 'rb') as img:
            encoded = base64.b64encode(img.read()).decode('utf-8')
            asset['p'] = f"data:image/png;base64,{encoded}"
            asset['u'] = ""
            asset['e'] = 1
        print(f"Embedded: {img_path}")
    except FileNotFoundError:
        print(f"Missing: {img_path}")

# Write back
with open('stirring.json', 'w') as f:
    json.dump(data, f)

print("\n✅ stirring.json updated with professional animation!")
print(f"Animation name: {data.get('nm', 'unknown')}")
PYEOF

echo "Done!"
