#!/usr/bin/env bash
set -euo pipefail

echo "Stopping Jekyll server..."

pids=$(pgrep -f "bin/jekyll serve" 2>/dev/null || echo "")

if [ -n "$pids" ]; then
  kill $pids 2>/dev/null || true
  sleep 1
  echo "✅ Jekyll server stopped"
else
  echo "ℹ️  No Jekyll server running"
fi
