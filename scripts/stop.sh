#!/usr/bin/env bash
set -euo pipefail

echo "Stopping Jekyll server..."

found_processes=false

# Method 1: Find Jekyll processes by command name
pids=$(pgrep -f "bin/jekyll serve" 2>/dev/null || echo "")
if [ -n "$pids" ]; then
  echo "  → Found Jekyll processes: $pids"
  kill $pids 2>/dev/null || true
  found_processes=true
fi

# Method 2: Find processes using Jekyll ports (4000 and common LiveReload ports)
# Get livereload port from environment or use defaults
LR_PORT="${JEKYLL_LIVERELOAD_PORT:-35731}"
PORTS="4000 35729 $LR_PORT"

for port in $PORTS; do
  port_pids=$(lsof -ti:$port 2>/dev/null || echo "")
  if [ -n "$port_pids" ]; then
    echo "  → Found processes on port $port: $port_pids"
    kill -9 $port_pids 2>/dev/null || true
    found_processes=true
  fi
done

# Give processes time to terminate
if [ "$found_processes" = true ]; then
  sleep 1

  # Verify ports are now free
  still_in_use=false
  for port in $PORTS; do
    if lsof -ti:$port >/dev/null 2>&1; then
      echo "  ⚠️  Port $port still in use"
      still_in_use=true
    fi
  done

  if [ "$still_in_use" = true ]; then
    echo "⚠️  Some ports may still be in use. Try again in a moment."
  else
    echo "✅ Jekyll server stopped"
  fi
else
  echo "ℹ️  No Jekyll server running"
fi
