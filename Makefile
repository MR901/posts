SHELL := /usr/bin/env bash

.PHONY: serve serve-root serve-stop build clean rst-format rst-validate rst-prep data pages-prep test show-protected protect-help

# Ensure local shims (e.g., python -> python3) are available during make targets
export PATH:=$(PWD)/tools/shims:$(PATH)

serve:
	./scripts/serve.sh

serve-root:
	./scripts/serve.sh --root

serve-stop:
	@./scripts/stop.sh

build:
	bundle exec jekyll build

# Build target for Cloudflare Pages / CI deployment
deploy:
	@echo "Installing Python dependencies..."
	python3 -m pip install --user -r requirements.txt || pip3 install -r requirements.txt || pip install -r requirements.txt
	@echo "Installing Ruby dependencies..."
	bundle install
	@echo "Building Jekyll site..."
	LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 bundle exec jekyll build

clean:
	bundle exec jekyll clean
	rm -rf .pygments-cache .ruby-lsp .sass-cache debug_site


# Apply minimal formatting fixes to RST files (heading underlines, front matter)
rst-format:
	python3 scripts/format_rst.py
	@echo "\n✅ RST formatting complete"
	@echo "→ Review changes and commit if satisfied.\n"

# Validate RST files for errors (warnings are expected and handled gracefully)
rst-validate:
	@echo "Validating RST files for errors..."
	@echo "(Note: Warnings are normal and handled by preprocessing)"
	@bundle exec jekyll build 2>&1 | grep "ERROR" | grep "\.rst:" || echo "✅ No RST errors found!"
	@echo ""

# Convenience target: format RST files and then build to verify
rst-prep: rst-format
	@echo "Building site to verify RST formatting..."
	@bundle exec jekyll build
	@echo "\n✅ RST files formatted and site built successfully"
	@echo "→ Check output above for any remaining issues.\n"


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
	    bundle exec htmlproofer _site --disable-external --swap-urls "^/$$swap_from:/" \
	      --ignore-urls "/^http:\/\/127.0.0.1/,/^http:\/\/0.0.0.0/,/^http:\/\/localhost/" ; \
	  else \
	    bundle exec htmlproofer _site --disable-external \
	      --ignore-urls "/^http:\/\/127.0.0.1/,/^http:\/\/0.0.0.0/,/^http:\/\/localhost/" ; \
	  fi


# =============================================
# Post Protection
# =============================================

# Show all protected posts
show-protected:
	@echo "🔒 Protected posts:"
	@if grep -q "^_posts/.*\.rst$$" .cursorignore 2>/dev/null; then \
		grep "^_posts/.*\.rst$$" .cursorignore | sed 's/^/  - /'; \
	else \
		echo "  (none)"; \
	fi
	@echo ""

# Show help for protecting/unprotecting posts
protect-help:
	@echo "Post Protection System"
	@echo "====================="
	@echo ""
	@echo "To PROTECT a post:"
	@echo "  1. Add 'allow_edit: false' to the post's front matter"
	@echo "  2. Add '_posts/<filename>' to .cursorignore"
	@echo "  3. Commit both changes together"
	@echo ""
	@echo "To UNPROTECT a post:"
	@echo "  1. Remove the line from .cursorignore"
	@echo "  2. Set 'allow_edit: true' in front matter (or remove the field)"
	@echo "  3. Make your edits"
	@echo ""
	@echo "Commands:"
	@echo "  make show-protected  - List all protected posts"
	@echo "  make protect-help    - Show this help"
