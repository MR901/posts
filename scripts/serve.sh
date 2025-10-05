#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/serve.sh           # serve at /posts (uses config baseurl)
#   ./scripts/serve.sh --root    # serve at /

if [[ "${1:-}" == "--root" ]]; then
  exec bundle exec jekyll serve --livereload --host 0.0.0.0 --baseurl ""
else
  exec bundle exec jekyll serve --livereload --host 0.0.0.0
fi
