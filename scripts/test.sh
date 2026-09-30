#!/usr/bin/env bash
# Build the site under a sub-path (like GitHub Pages), serve it, and run the browser checks.
# Needs: hugo, python3 + playwright (+ chromium), pyyaml, and axe-core (npm i axe-core, or AXE_JS=/path/axe.min.js).
set -euo pipefail
cd "$(dirname "$0")/.."
PORT="${PORT:-8123}"
TMP="$(mktemp -d)"; trap 'kill "${SRV:-0}" 2>/dev/null || true; rm -rf "$TMP"' EXIT
hugo --gc --minify --panicOnWarning --baseURL "http://127.0.0.1:$PORT/TheBlackCat/" -d "$TMP/TheBlackCat" >/dev/null
python3 -m http.server "$PORT" --bind 127.0.0.1 -d "$TMP" >/dev/null 2>&1 & SRV=$!
sleep 1
BASE="http://127.0.0.1:$PORT/TheBlackCat"
python3 scripts/interact.py "$BASE" "${SHOTS:-$TMP/shots}"
AXE="${AXE_JS:-node_modules/axe-core/axe.min.js}"
python3 scripts/a11y.py "$AXE" "$BASE"
