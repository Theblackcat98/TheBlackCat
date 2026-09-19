---
title: "VoxCtrl"
contenttype: bookmark
description: "Rust/Tauri voice-to-text dictation app and programmable voice command broker: on-device STT (whisper.cpp, Moonshine, Parakeet) with 11 configurable output routing targets."
source: "https://github.com/JRufer/VoxCtrl"
topics:
  - ai
tags:
  - rust
  - speech-to-text
  - tts
  - voice
  - linux
status: inbox
created: 2026-09-16
updated: 2026-09-16
---

## Why I saved this

Self-contained, privacy-first local voice tooling — 100% on-device (or BYO homelab STT endpoint), zero telemetry. Fits the taste for tools that don't chain a dozen outside services.

## Notes

- Rust + Tauri 2 + Svelte 5 desktop app for Linux (Wayland/X11) and Windows (early beta). Project page: https://jrufer.com/voxctrl/
- STT engines: whisper.cpp (GGUF, Vulkan/CUDA), Moonshine (streaming ONNX), Parakeet TDT (fast non-autoregressive), plus a remote mode targeting any OpenAI-compatible `/v1/audio/transcriptions` endpoint.
- Ships an on-device cleanup pass (Superwhisper s1-mini via llama.cpp sidecar) that fixes punctuation/casing and strips filler words while preserving command keywords.
- Output router (`targets.toml`) with 11 delivery targets: window inject, clipboard, shell exec, FIFO pipe, TCP/Unix socket, file append, DBus, HTTP, HMAC-signed webhook, TTS speak-back, and OpenAI-compatible chat. Spoken commands ("VoxCtrl notes, ...") dispatch dynamically; one hotkey can broadcast to multiple targets.
- TTS suite: 6 offline engines (Piper, Pocket-TTS, Breeze-TTS-2, VoxCPM2, Inflect-Micro-v2, eSpeak-NG) with idle unload to free RAM/VRAM.
- Extras: XDG GlobalShortcuts portal hotkeys (no keystroke monitoring), built-in MCP server on a local socket (`transcribe_voice`, `speak_text`, `get_status`), 7-step setup wizard, SHA-256-verified self-updater.
- License MIT; 21 stars at time of saving; actively pushed (2026-09-16).
- Candidate for a de-slop fork (UI overhaul) or clean-room rebuild; logged in the offline GitHub-stars triage build list as item 3.7.
