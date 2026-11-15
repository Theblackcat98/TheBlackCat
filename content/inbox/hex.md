---
title: "Hex — local voice dictation for Mac, Windows and Linux"
contenttype: bookmark
description: "Hold a key, speak, and Hex pastes the transcription into whatever app you're in — speech recognition runs entirely on-device; the first run downloads a model, after that nothing leaves the machine."
source: "https://github.com/anomalyco/hex"
topics:
  - tools
  - ai
tags:
  - speech-to-text
  - voice
  - local-first
  - rust
  - linux
  - open-source
status: inbox
created: 2026-11-14
updated: 2026-11-14
---

## Why I saved this

Local-first dictation that works on Linux (Fedora .rpm build listed) — hold-to-talk transcription pasted into any app, with no cloud round-trip after the initial model download. By anomalyco, the opencode team.

## Notes

- CLI as well as app: `hex transcribe meeting.m4a` prints a transcript for WAV, AIFF, FLAC, MP3, Ogg, WebM and MP4/M4A/MOV, whether or not the app is running.
- Installs: Homebrew cask, AUR (`hex-bin`), a Linux install script, or Nix (`nix profile add github:anomalyco/hex`); stable and dev channels.
- Rust, MIT. ~6,750 stars. They don't take pull requests — issues only, per the README.
