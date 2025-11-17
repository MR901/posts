#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/serve.sh           # serve at /posts (uses config baseurl)
#   ./scripts/serve.sh --root    # serve at /

# Allow overriding livereload port to avoid conflicts; default to 35731
LR_PORT="${JEKYLL_LIVERELOAD_PORT:-35731}"

if [[ "${1:-}" == "--root" ]]; then
  exec bundle exec jekyll serve --livereload --livereload-port "$LR_PORT" --host 0.0.0.0 --baseurl ""
else
  exec bundle exec jekyll serve --livereload --livereload-port "$LR_PORT" --host 0.0.0.0
fi
