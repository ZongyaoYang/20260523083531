#!/usr/bin/env bash
# Start the PHP API server on http://localhost:8080.
# All requests route through _api/index.php.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if ! command -v php >/dev/null 2>&1; then
  echo "Error: PHP is not installed. Install with: brew install php"
  exit 1
fi

cd "$PROJECT_ROOT/_api"

echo "Starting PHP API on http://localhost:8080"
echo "Health check: http://localhost:8080/handlers/front/init"
echo ""

exec php -S localhost:8080 index.php
