/**
 * xai-voice — Backend-only MVP
 * Provides xAI STT tool for push-to-talk transcription.
 */

import { readFileSync } from 'fs';
import { withTimeout, startStallDetector, isEnabled } from '../../lib/diagnostics.js';

async function executeStt({ audio, format = 'webm' }, { signal } = {}) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { error: 'XAI_API_KEY not set' };
  }

  let fileBuffer;
  let filename = 'audio.webm';

  if (audio.startsWith('/') || audio.startsWith('./')) {
    try {
      fileBuffer = readFileSync(audio);
      filename = audio.split('/').pop();
    } catch (err) {
      return { error: `Failed to read file: ${err.message}` };
    }
  } else {
    return { error: 'Base64 input not yet supported in MVP' };
  }

  try {
    const form = new FormData();
    form.append('format', 'true');
    form.append('language', 'en');
    form.append('file', new Blob([fileBuffer], { type: 'audio/webm' }), filename);

    const response = await fetch('https://api.x.ai/v1/stt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: form,
      signal
    });

    if (!response.ok) {
      const text = await response.text();
      return { error: `xAI STT error: ${response.status} - ${text}` };
    }

    const result = await response.json();

    return {
      text: result.text || '',
      language: result.language || 'en',
      duration: result.duration || 0,
      words: result.words || []
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      return { error: 'STT request aborted due to timeout' };
    }
    return { error: `STT request failed: ${err.message}` };
  }
}

export default {
  name: 'xai-voice',
  version: '0.1.0',

  tools: [
    {
      name: 'xai_stt',
      description: 'Transcribe audio using xAI Voice STT. Input must be a base64-encoded audio file or local file path.',
      parameters: {
        type: 'object',
        properties: {
          audio: {
            type: 'string',
            description: 'Base64 encoded audio data or absolute file path'
          },
          format: {
            type: 'string',
            enum: ['mp3', 'wav', 'webm'],
            default: 'webm'
          }
        },
        required: ['audio']
      },
      async execute({ audio, format = 'webm' }) {
        const stopStall = startStallDetector();

        try {
          return await withTimeout(executeStt, 30000, 'xai_stt')({ audio, format });
        } finally {
          if (stopStall) stopStall();
        }
      }
    }
  ]
};