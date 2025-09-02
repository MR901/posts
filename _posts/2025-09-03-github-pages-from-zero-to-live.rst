---
layout: post
title: "GitHub Pages: From Zero to Live"
date: 2025-09-03 00:00:00 +0530
categories: [github, pages]
tags: [github, pages, actions, deployment, gh-cli]
pin: false
toc: true
comments: false
math: false
mermaid: false
description: "Understand GitHub Pages, set it up from scratch, add a minimal GitHub Actions deploy, verify, and keep deployments clean with gh CLI."
image:
  path: https://miro.medium.com/v2/resize:fit:720/format:webp/1*_M3PH26KMfxZ2hBpC2I3_A.jpeg
  alt: "GitHub Pages: From Zero to Live"
---

Why this guide (a short story)
===================================================================================

I wanted one lean, repeatable way to publish any static site from any repository—no theme lock‑in, no tool bias. This page is my own checklist, notes to setup on a fresh repo and be live in minutes. I'll keep this simple, show the moving parts, and point the places where things go wrong.


What is GitHub Pages?
===================================================================================

GitHub Pages serves static files (HTML, CSS, JS, images) from your repository on a global CDN.

Two flavors:

* **User site** → ``https://<user>.github.io`` (repo name must be ``<user>.github.io``)
* **Project site** → ``https://<user>.github.io/<repo>/`` (any repo name)

You can deploy either by picking a branch/folder as the source, or (recommended) by letting **GitHub Actions** build and deploy your static folder on every push.


Five‑minute setup (no build step)
===================================================================================

Goal: put a single page live fast.

Steps:
1. Create a repository and add ``index.html`` at the root::

      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Hello</title></head>
      <body><h1>Hello, Pages!</h1></body>
      </html>

2. Repository → **Settings → Pages**
   - Build and deployment → Source = "Deploy from a branch"
   - Branch = ``main``; Folder = ``/(root)``

3. Visit the live URL shown on the Pages screen (incognito/hard‑refresh if needed).

.. figure:: assets/attachments/images/github_settings_page.png
   :alt: GitHub Pages settings showing source and live URL


Minimal CI/CD with GitHub Actions (generator‑agnostic)
===================================================================================

Goal: build static files (from any tool) and deploy on each push.

Create ``.github/workflows/pages-deploy.yml`` with one build path of your choice.

.. code-block:: yaml

   name: Build and Deploy
   on:
     push:
       branches: [ main ]   # or develop
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: pages
     cancel-in-progress: true

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - id: pages
           uses: actions/configure-pages@v4

         # Example A: plain HTML already in repo root
         # - name: Prepare static folder
         #   run: mkdir -p dist && cp -r * dist/

         # Example B: Node-based static build (Next.js export, Vite, Astro, etc.)
         # - uses: actions/setup-node@v4
         #   with:
         #     node-version: '20'
         # - run: npm ci && npm run build
         #   # ensure the final site is in ./dist

         # Example C: Jekyll/Hugo/MkDocs — adapt as needed
         # - uses: ruby/setup-ruby@v1
         #   with:
         #     ruby-version: '3.2'
         #     bundler-cache: true
         # - run: bundle exec jekyll build -d _site && mv _site dist

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: dist   # change if your output folder differs

     deploy:
       runs-on: ubuntu-latest
       needs: build
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4

.. figure:: assets/attachments/images/github_actions_successful_build.png
   :alt: Successful GitHub Actions build steps

.. figure:: assets/attachments/images/github_actions_successful_deploy.png
   :alt: Successful GitHub Actions deploy with page URL


Verify and monitor
============================================================

1. Actions → latest run → job “Deploy to GitHub Pages” should be green; open the page URL.
2. Settings → Pages shows the same live URL.
3. Use a hard refresh (Ctrl+Shift+R) or incognito to bypass caches.

.. figure:: assets/attachments/images/github_code_successful_deployment.png
   :alt: Repository deployments view showing github-pages environment

.. figure:: assets/attachments/images/github_page_active_live.png
   :alt: Live site rendering after deployment


Keep deployments tidy with gh CLI
===================================================================================

Sometimes old/failed deployments clutter history. Use the GitHub CLI to list and remove.

Install gh CLI, go to the official site `here <https://cli.github.com/>`_.

Run ``gh auth login`` to authenticate with your GitHub account. Alternatively, gh will respect the ``GITHUB_TOKEN`` environment variable.

List selected fields from all repositories::

    gh api users/<user>/repos --jq '.[] | {name: .name, full_name: .full_name, has_pages: .has_pages, archived: .archived, disabled: .disabled}'

List deployments for a repository::

    gh api \
      --method GET \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      /repos/<user>/<repo>/deployments | jq -r '.[] | "\(.id) - \(.environment) - \(.ref)"'

Delete a specific deployment by ID (use with care)::

    gh api \
      --method DELETE \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      /repos/<user>/<repo>/deployments/<id>

Enumerate all repos, then list deployments for each::

    gh api \
      --method GET \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "/users/<USER>/repos?per_page=70&type=all" | jq -r '.[].full_name' | while read repo; do
        echo "=== $repo ===";
        gh api --method GET -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" \
          "/repos/$repo/deployments" | jq -r '.[] | "\(.id) - \(.environment) - \(.ref)"';
        echo; done

Reference: GitHub housekeeping approach inspired by `this article <https://dhanushkac.medium.com/github-housekeeping-remove-unwanted-deployments-in-minutes-a57a52969eb2>`_.


Troubleshooting (fast fixes)
===================================================================================

* Green deploy but old content → hard refresh, private window, or push a tiny change and redeploy
* Wrong live URL → Settings → Pages → confirm Source and Branch/Folder
* 404s on a project site under ``/<repo>`` → ensure your generator includes the base path in internal links, or use relative links for assets (``assets/...``)
* Verify that your build outputs to the folder you upload (``dist`` above)


Appendix: three minimal workflows
===================================================================================

Plain HTML (copy static files)::

    - name: Prepare static folder
      run: mkdir -p dist && cp -r * dist/

Node (example: Vite)::

    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci && npm run build   # outputs to ./dist

Jekyll (one liner)::

    - uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.2'
        bundler-cache: true
    - run: bundle exec jekyll build -d _site && mv _site dist


Checklist
===================================================================================

* Create repo → add ``index.html`` (or buildable project)
* Add the CI workflow → ensure your output folder matches the upload step
* Push → check Actions “Deploy to GitHub Pages” and open the page URL
* Hard refresh to verify; repeat small changes to confirm cache invalidation
* Use ``gh api`` to list/delete stale deployments when needed


