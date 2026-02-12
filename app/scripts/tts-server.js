const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));

/**
 * =========================
 * Configuration
 * =========================
 */
const PORT = 3001;

const ENPLACE_SECRET = process.env.ENPLACE_SECRET;

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const OPENAI_API_VERSION = process.env.OPENAI_API_VERSION;

/**
 * =========================
 * Env validation (fail fast)
 * =========================
 */
if (!ENPLACE_SECRET) {
  console.error('ENPLACE_SECRET is not set');
  process.exit(1);
}

if (
  !AZURE_OPENAI_ENDPOINT ||
  !AZURE_OPENAI_DEPLOYMENT ||
  !AZURE_OPENAI_API_KEY ||
  !OPENAI_API_VERSION
) {
  console.error('Azure OpenAI environment variables are missing');
  process.exit(1);
}

/**
 * =========================
 * Optional: serve QR code
 * =========================
 */
app.get('/qr.png', (req, res) => {
  const qrPath = path.join(__dirname, '..', '..', 'qr.png');
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).end();
  }
});

/**
 * =========================
 * TTS endpoint
 * =========================
 */
app.post('/tts', async (req, res) => {
  // Simple shared-secret auth
  if (req.headers['x-enplace-secret'] !== ENPLACE_SECRET) {
    return res.status(401).end();
  }

  const { text, instructions, voice, style } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const url =
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}` +
      `/audio/speech?api-version=${OPENAI_API_VERSION}`;

    // FALLBACK: Azure doesn't support 'instructions' parameter yet
    // So we embed style cues directly in the input text
    const voiceStyle = style || instructions || 'trini';
    let styledText = text;
    
    if (voiceStyle.includes('trinidad') || voiceStyle.includes('trini')) {
      // Azure TTS style: Use brackets at start, might be interpreted as SSML-like directive
      styledText = `[Speak in a warm, friendly Trinidadian Creole English accent] ${text}`;
    } else if (voiceStyle) {
      // Generic style fallback
      styledText = `[${voiceStyle}] ${text}`;
    }

    const requestBody = {
      model: AZURE_OPENAI_DEPLOYMENT,
      voice: voice || 'alloy',
      input: styledText,
    };

    console.log('TTS Request:', { 
      url, 
      apiVersion: OPENAI_API_VERSION, 
      originalText: text,
      styledText: styledText,
      style: voiceStyle 
    });

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': AZURE_OPENAI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Azure TTS error:', errText);
      return res.status(500).send(errText);
    }
    
    // Log response headers to check for warnings
    console.log('Azure response headers:', Object.fromEntries(r.headers.entries()));

    res.setHeader('Content-Type', 'audio/mpeg');
    r.body.pipe(res);
  } catch (err) {
    console.error('TTS exception:', err);
    res.status(500).end();
  }
});

/**
 * =========================
 * Start server
 * =========================
 */
app.listen(PORT, () => {
  console.log(`EnPlace TTS server listening on port ${PORT}`);
});
