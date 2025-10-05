SHELL := /usr/bin/env bash

.PHONY: serve serve-root build clean data pages-prep test

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
	rm -rf .pygments-cache .ruby-lsp .sass-cache


# Generate attachment data files used by GitHub Pages (since custom plugins don't run there)
data:
	python3 scripts/generate_attachment_data.py .

# Convenience target: generate data and build locally to verify
pages-prep: data
	bundle exec jekyll build
	@echo "\n✅ Data generated in _data/attachment_{galleries,references}.yml"
	@echo "→ Commit and push these files to the branch configured in Settings → Pages.\n"


# Build and run htmlproofer with baseurl-aware URL swap for local checks
test:
	@if [ -d _site ]; then rm -rf _site; fi
	@baseurl=$$(grep '^baseurl:' _config.yml | sed "s/.*: *//;s/['\"]//g;s/#.*//") ; \
	  echo "Baseurl: $$baseurl" ; \
	  JEKYLL_ENV=production bundle exec jekyll build -d _site ; \
	  if [ -n "$$baseurl" ]; then \
	    swap_from=$${baseurl#/}/ ; \
	    bundle exec htmlproofer _site --disable-external --url-swap "/$${swap_from}:/" \
	      --ignore-urls "/^http:\/\/127.0.0.1/,/^http:\/\/0.0.0.0/,/^http:\/\/localhost/" ; \
	  else \
	    bundle exec htmlproofer _site --disable-external \
	      --ignore-urls "/^http:\/\/127.0.0.1/,/^http:\/\/0.0.0.0/,/^http:\/\/localhost/" ; \
	  fi


