#!/bin/bash
# Test Azure TTS with instructions directly

# Load env vars (if you have an env file, source it here)
# source /path/to/.env

# Or set them directly for this test:
export AZURE_OPENAI_ENDPOINT=""
export AZURE_OPENAI_DEPLOYMENT=""
export AZURE_OPENAI_API_KEY=""
export OPENAI_API_VERSION=""

echo "=== Testing Azure TTS with Trinidadian accent instructions ==="

curl -X POST "${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/audio/speech?api-version=${OPENAI_API_VERSION}" \
  -H "api-key: ${AZURE_OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "'"${AZURE_OPENAI_DEPLOYMENT}"'",
    "voice": "alloy",
    "input": "Welcome to the kitchen, we making curry and roti today!",
    "instructions": "Speak in a warm, friendly Trinidadian Creole English accent"
  }' \
  --output /tmp/test-trini.mp3

echo ""
if [ -f /tmp/test-trini.mp3 ] && [ -s /tmp/test-trini.mp3 ]; then
    echo "✅ Audio saved to /tmp/test-trini.mp3 ($(stat -c%s /tmp/test-trini.mp3) bytes)"
    echo "Play it with: ffplay /tmp/test-trini.mp3 (or drag to your computer)"
else
    echo "❌ Failed - audio file empty or missing"
fi
