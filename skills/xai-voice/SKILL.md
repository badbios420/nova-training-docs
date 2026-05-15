# xai-voice — Realtime Voice Input via xAI STT

**Owner**: Nova Bethurum  
**Created**: May 6, 2026  
**Purpose**: Enable push-to-talk voice input using xAI's STT (Speech-to-Text) while keeping Eve TTS for output.

## Current Status (v0.1)
- Push-to-talk mode (hold-to-speak)
- Routes transcription directly into user input
- Uses xAI Voice API for STT
- Falls back to browser Web Speech API if xAI STT fails

## Planned Features
- Full realtime streaming (bidirectional)
- Voice activity detection
- Seamless integration with Eve TTS output

## Activation
```bash
openclaw skill reload xai-voice
```

This skill extends the existing `tts` pipeline (already configured for xAI Eve).