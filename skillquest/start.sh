#!/usr/bin/env sh
# Start XPedition on macOS or Linux: ./start.sh   (then open http://localhost:8000)
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18 or newer is required. Install it from https://nodejs.org and try again."
  exit 1
fi
exec node server.js
