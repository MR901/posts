# Jekyll + Chirpy Starter

This repository is a Jekyll site powered by the Chirpy theme. It includes a ready-to-write setup plus a comprehensive guide for creating posts and pages.

## Quick Start

- Clone and install:
  ```bash
  bundle install
  ```
- Serve locally:
  ```bash
  bundle exec jekyll serve --livereload
  ```
  Open `http://127.0.0.1:4000/posts` (or run with `--baseurl ""` to serve at `/`).
- Create content:
  - Add a post under `_posts/`
  - Put images and downloads under `attachments/` (see below)
- Deploy: follow the GitHub Pages notes to pre-generate attachment data, then push.

## Attachments

- Base directory: `attachments/` (configurable via `attachments_dir` in `_config.yml`).
- Use shared buckets for cross-post assets and per-post buckets for single-use assets.

```text
attachments/
├── general/
│   ├── images/
│   ├── articles/
│   └── research_papers/
└── posts/
    └── <your-post-slug>/
        ├── images/
        ├── articles/
        └── research_papers/
```

Linking examples (RST):

```rst
.. image:: attachments/general/images/example.png
   :alt: Example image

.. figure:: attachments/posts/your-post-slug/images/diagram.png
   :alt: Diagram

`Download the paper <attachments/general/research_papers/paper.pdf>`_
```

## Table of Contents

- [Jekyll + Chirpy Starter](#jekyll--chirpy-starter)
  - [Quick Start](#quick-start)
  - [Attachments](#attachments)
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
- Create or edit posts under `_posts/` and attachments under `attachments/`.
- Use `attachments/general/{images,articles,research_papers}` for shared files, or `attachments/posts/<your-post-slug>/{images,articles,research_papers}` for post‑scoped files.
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
- **Attachments**: store under `attachments/` (configurable via `attachments_dir` in `_config.yml`):
  - Shared: `attachments/general/{images,articles,research_papers}`
  - Per-post: `attachments/posts/<slug>/{images,articles,research_papers}`
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

- Put shared files under `attachments/general/…`.
- For post-specific assets, use `attachments/posts/<your-post-slug>/…`.
- Prefer relative paths like `attachments/...` in your content so links work with any `baseurl`.

```text
attachments/
├── general/
│   ├── images/
│   ├── articles/
│   └── research_papers/
└── posts/
    └── <your-post-slug>/
        ├── images/
        ├── articles/
        └── research_papers/
```

Examples in RST:

```rst
.. image:: attachments/general/images/example.png
   :alt: Example image

.. figure:: attachments/posts/your-post-slug/images/diagram.png
   :alt: Diagram
```

PDF/article download:

```rst
`Download the paper <attachments/general/research_papers/paper.pdf>`_
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
git add _posts/ attachments/
git commit -m "add(post): your-post-slug with attachments"
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
├── attachments/
│   ├── general/
│   │   ├── images/
│   │   ├── articles/
│   │   └── research_papers/
│   └── posts/
│       └── <slug>/
│           ├── images/
│           ├── articles/
│           └── research_papers/
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
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

## Post Protection

Protect finalized posts from accidental edits using the post protection system.

### How it works

**Two-layer protection:**
1. **Front matter flag**: Add `allow_edit: false` to a post's YAML front matter
2. **IDE ignore**: Add the post path to `.cursorignore` to hide it from Cursor's file search

### Protecting a post

```bash
# 1. Edit the post's front matter - add this field:
#    allow_edit: false

# 2. Edit .cursorignore - add the post path:
#    _posts/2025-09-01-your-post-name.rst

# 3. Commit both changes together
git add _posts/2025-09-01-your-post-name.rst .cursorignore
git commit -m "Protect: your post name"
```

### Unprotecting a post

```bash
# 1. Remove the line from .cursorignore

# 2. Edit the post - change to allow_edit: true (or remove the field)

# 3. Make your edits

# 4. Re-protect if desired (repeat protection steps)
```

### Useful commands

```bash
# Show all currently protected posts
make show-protected

# Show help and instructions
make protect-help
```

### Example front matter

```yaml
---
layout: post
title: "My Finalized Post"
date: 2025-09-01 00:00:00 +0530
categories: [jekyll]

# Prevent accidental edits
allow_edit: false
---
```

**Note:** This is a convenience feature to prevent accidental edits. For true access control, use git branch protection rules.

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
- `attachments_dir` in `_config.yml` controls where attachments live (default: `attachments`).
- Prefer relative paths like `attachments/...` in posts so links work with any `baseurl`.
- The generator respects `_config.yml` `baseurl` when composing absolute URLs for data files.
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

