SHELL := /usr/bin/env bash

.PHONY: serve serve-root build clean

# Ensure local shims (e.g., python -> python3) are available during make targets
export PATH:=$(PWD)/tools/shims:$(PATH)

serve:
	./scripts/serve.sh

serve-root:
	./scripts/serve.sh --root

build:
	bundle exec jekyll build

clean:
	bundle exec jekyll clean


