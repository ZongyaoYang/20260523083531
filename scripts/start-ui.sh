#!/usr/bin/env bash
# Install deps (first run only) and start the Next.js dev server on http://localhost:3000.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Install with: brew install node@22"
  exit 1
fi

cd "$PROJECT_ROOT/_ui"

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)..."
  npm install
  echo ""
fi

if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo ""
fi

echo "Starting Next.js dev server on http://localhost:3000"
echo ""

exec npm run dev
