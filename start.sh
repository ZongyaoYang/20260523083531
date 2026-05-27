#!/usr/bin/env bash
# PeakAgent Interview — single-command launcher.
# Starts the PHP API and Next.js UI in parallel, opens your browser
# when the UI is ready, and stops both servers cleanly on Ctrl+C.

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Prereq checks ---
command -v php  >/dev/null 2>&1 || { echo "Error: PHP not found. Install with: brew install php";        exit 1; }
command -v node >/dev/null 2>&1 || { echo "Error: Node not found. Install with: brew install node@22"; exit 1; }

# --- First-run UI setup ---
if [ ! -d "$ROOT/_ui/node_modules" ]; then
  echo "[setup] Installing UI dependencies (first run)..."
  (cd "$ROOT/_ui" && npm install)
fi
if [ ! -f "$ROOT/_ui/.env.local" ]; then
  cp "$ROOT/_ui/.env.example" "$ROOT/_ui/.env.local"
  echo "[setup] Created _ui/.env.local from .env.example"
fi

# --- Cleanup on exit ---
PIDS=()
cleanup() {
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "Starting API on http://localhost:8080 and UI on http://localhost:3000"
echo "(Ctrl+C to stop both)"
echo ""

# --- Launch both servers, prefix their output ---
( cd "$ROOT/_api" && php -S localhost:8080 index.php 2>&1 ) | sed -u 's/^/[api] /' &
PIDS+=($!)

( cd "$ROOT/_ui" && npm run dev 2>&1 ) | sed -u 's/^/[ui ] /' &
PIDS+=($!)

# --- Open browser once UI responds ---
(
  for _ in $(seq 1 60); do
    if curl -sf -o /dev/null http://localhost:3000; then
      if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
      fi
      break
    fi
    sleep 1
  done
) &
PIDS+=($!)

wait
