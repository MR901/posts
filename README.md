# Jekyll + Chirpy Starter

This repository is a Jekyll site powered by the Chirpy theme. It includes a ready-to-write setup plus a comprehensive guide for creating posts and pages.

## Table of Contents

- [Jekyll + Chirpy Starter](#jekyll--chirpy-starter)
  - [Table of Contents](#table-of-contents)
  - [Dev Container (recommended)](#dev-container-recommended)
    - [Open in Dev Container](#open-in-dev-container)
    - [Run the site inside the container](#run-the-site-inside-the-container)
    - [One-click run options](#one-click-run-options)
    - [Content workflow in container](#content-workflow-in-container)
    - [Notes](#notes)
  - [Local Development](#local-development)
    - [Prerequisites](#prerequisites)
    - [Install and run locally](#install-and-run-locally)
  - [Writing Content](#writing-content)
    - [New post](#new-post)
    - [Pages](#pages)
    - [Conventions](#conventions)
  - [Authoring Workflow (branches, PRs, validation)](#authoring-workflow-branches-prs-validation)
    - [Create a new branch](#create-a-new-branch)
    - [Add post in reStructuredText](#add-post-in-restructuredtext)
    - [Add attachments (images, downloads)](#add-attachments-images-downloads)
    - [Preview and validate locally](#preview-and-validate-locally)
    - [Commit, push, and open PR](#commit-push-and-open-pr)
    - [Merge into base branch](#merge-into-base-branch)
  - [Project Structure](#project-structure)
  - [Useful Commands](#useful-commands)
  - [Attachment references on GitHub Pages](#attachment-references-on-github-pages)
  - [Troubleshooting](#troubleshooting)
  - [Documentation and Links](#documentation-and-links)

## Dev Container (recommended)

Develop and preview the site in an isolated container using VS Code Dev Containers or GitHub Codespaces. This avoids changing your local Ruby setup and ensures consistent builds.

### Open in Dev Container
1. Install the "Dev Containers" extension in VS Code.
2. Open this repository in VS Code.
3. When prompted, select "Reopen in Container" (or run: Command Palette → Dev Containers: Reopen in Container).
   - The container image `mcr.microsoft.com/devcontainers/jekyll:2-bullseye` is used.
   - Dependencies are installed automatically (`bundle install`).
   - Ports 4000 (site) and 35729 (LiveReload) are auto-forwarded.

### Run the site inside the container

```bash
bundle exec jekyll serve --livereload --host 0.0.0.0
```

Manual start is expected; the container does not auto-start Jekyll. After running the command, open the forwarded URL (typically `http://127.0.0.1:4000/posts`).

Alternatively, override the base URL during local preview to serve at `/`:

```bash
bundle exec jekyll serve --livereload --host 0.0.0.0 --baseurl ""
```

### One-click run options

- VS Code: Run Task → "Jekyll: Serve" (or "Jekyll: Serve (root baseurl)").
- Makefile: `make serve` (or `make serve-root`).
- Script: `./scripts/serve.sh` (or `./scripts/serve.sh --root`).

### Content workflow in container
- Create or edit posts under `_posts/` and assets under `assets/images/`.
- Use `media_subpath` in front matter to keep images organized per post.
- Verify build output and links before opening a PR to `develop`.

### Notes
- First run may take a few minutes to pull the image and install gems.
- If livereload doesn’t trigger, hard refresh the browser or ensure port 35729 is forwarded.

## Local Development

### Prerequisites
- Ruby (3.x recommended) and Bundler
- Node.js (optional, for asset tooling)

Verify your tools:

```bash
ruby -v
gem install bundler
bundle -v
```

### Install and run locally

```bash
bundle install
bundle exec jekyll serve --livereload
```

Then open `http://127.0.0.1:4000/posts`.

Alternatively, ignore the configured `baseurl` during local preview to serve at `/`:

```bash
bundle exec jekyll serve --livereload --baseurl ""
```

Locate installed theme files (optional):

```bash
bundle info --path jekyll-theme-chirpy
```

## Writing Content

See the detailed guide: `_posts/2025-09-01-jekyll-content-creation-guide.rst`.

### New post
Create a file in `_posts/` named `YYYY-MM-DD-your-title.md` (or `.rst`/`.markdown`).

Minimal front matter:

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-09-01 12:00:00 +0000
categories: [Category, Subcategory]
tags: [tag1, tag2]
description: "Short summary for previews"
image:
  path: /assets/images/2025-09-01/example.png
  alt: "Descriptive alt text"
media_subpath: "/assets/images/2025-09-01/"
pin: false
toc: true
---
```

Write in Markdown or reStructuredText. Use headers, lists, code blocks, and links for scannability.

### Pages
Create standalone pages (e.g., `about.md`) at the project root or in a folder. Use `layout: page` or a custom layout.

### Conventions
- **Posts**: `_posts/`, named `YYYY-MM-DD-title.ext`
- **Categories**: up to two levels, e.g., `[Tutorial, Jekyll]`
- **Tags**: lowercase, specific topics, e.g., `[jekyll, static-sites]`
- **Images**: keep under `assets/images/`, set `media_subpath` per post
- **Accessibility**: always set `image.alt`

## Authoring Workflow (branches, PRs, validation)

### Create a new branch

```bash
git checkout -b feature/your-post-slug
```

Use a short, kebab-cased branch name matching your post slug.

### Add post in reStructuredText

Create a new RST file under `_posts/` with the required name format `YYYY-MM-DD-your-post-slug.rst`.

```text
_posts/
├── 2025-09-01-your-post-slug.rst
```

Start with front matter and a top-level title:

```rst
---
layout: post
title: "Your Post Title"
date: 2025-09-01 10:00:00 +0000
categories: [Tutorial, Jekyll]
tags: [jekyll, rst]
description: "What readers will learn"
image:
  path: /assets/images/2025-09-01/cover.png
  alt: "Cover image alt text"
media_subpath: "/assets/images/2025-09-01/"
toc: true
---

Your Post Title
===============

Introduction paragraph...
```

### Add attachments (images, downloads)

- Put images under `assets/images/YYYY-MM-DD/` that matches the post date.
- Reference images in RST using standard Markdown image syntax or HTML, the front matter `media_subpath` will simplify relative paths.
- For downloads, use `assets/downloads/` and link directly.

```text
assets/
├── images/
│   └── 2025-09-01/
│       ├── cover.png
│       └── diagram.png
└── downloads/
    └── your-asset.pdf
```

### Preview and validate locally

- Dev Container: run `bundle exec jekyll serve --livereload --host 0.0.0.0` and open the forwarded URL.
- Local: run `bundle exec jekyll serve --livereload` and open `http://127.0.0.1:4000`.
- Validate links and images, skim the layout, and check the console for build warnings.

Optional link check (CI-style):

```bash
bundle exec jekyll build
bundle exec htmlproofer --disable-external _site
```

### Commit, push, and open PR

```bash
git add _posts/ assets/
git commit -m "add(post): your-post-slug in RST with assets"
git push -u origin feature/your-post-slug
```

Open a Pull Request to the `develop` branch. Include a short summary and screenshots if relevant.

### Merge into base branch

- After review passes and checks are green, squash-merge the PR into `develop`.
- If your workflow deploys from `main`, create a follow-up PR from `develop` → `main` when ready to publish.

## Project Structure

```text
.
├── _config.yml
├── _posts/
├── _tabs/
├── assets/
│   └── images/
├── index.html
└── README.md
```

## Useful Commands

```bash
# Install dependencies
bundle install

# Run locally with live reload
bundle exec jekyll serve --livereload

# Build the site
bundle exec jekyll build

# Update gems (if needed)
bundle update
```

Test the built site (baseurl-aware htmlproofer):

```bash
make test
```

## Attachment references on GitHub Pages

GitHub Pages runs Jekyll in safe mode and will not execute custom plugins. This site ships a custom attachment scanner/generator, so you must pre-generate and commit the data files that power the “Referenced in” panel on the `Attachments` tab.

What to do before pushing to the branch that Pages builds from (e.g., `main`):

```bash
# Generate `_data/attachment_{galleries,references}.yml`
make data

# Optionally build locally to verify
make pages-prep

# Commit the generated data files
git add _data/attachment_galleries.yml _data/attachment_references.yml
git commit -m "chore(data): update attachment data for Pages"
git push origin <pages-source-branch>  # e.g., main
```

Notes
- The Pages source branch/folder is shown in GitHub → Settings → Pages → Build and deployment → Source. Ensure the generated `_data/*.yml` exist in that branch and folder.
- The generator respects `_config.yml` `baseurl`. This repo uses `baseurl: "/posts"`, so generated post URLs look like `/posts/<slug>/`.
- In CI (GitHub Actions), run `python3 scripts/generate_attachment_data.py .` before `jekyll build` and deploy the output.

## Troubleshooting
- **Gem or dependency errors**: run `bundle update`, then `bundle install`.
- **Ruby version mismatch**: ensure your local Ruby matches the Gemfile requirements (Ruby 3.x recommended).
- **Port already in use**: `bundle exec jekyll serve -P 4001`.
- **Pages not rendering locally**:
  - Ensure you are opening `http://127.0.0.1:4000/posts` (matches `_config.yml` `baseurl: "/posts"`).
  - Or serve with `--baseurl ""` to preview at root.
  - Make sure every post has valid front matter (`---` at top) and correct filename `YYYY-MM-DD-title.rst`.
  - Clear cache and rebuild: `bundle exec jekyll clean && bundle exec jekyll serve`.
  - Run with `--trace` for detailed error logs.
  - For RST, verify the converter plugin loads (files under `_plugins/jekyll-rst/`) and that the `RbST` gem is installed.
- **Theme files location**: `bundle info --path jekyll-theme-chirpy`.

## Documentation and Links
- Chirpy theme docs: https://github.com/cotes2020/jekyll-theme-chirpy/wiki
- Jekyll docs: https://jekyllrb.com/docs/

