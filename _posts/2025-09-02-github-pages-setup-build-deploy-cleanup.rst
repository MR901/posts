---
layout: post
title: "GitHub Pages: Setup, CI/CD, gh CLI, and Cleanup"
date: 2025-09-02 00:00:00 +0530
categories: [github, pages]
tags: [github, pages, actions, deployment, gh-cli]
pin: false
toc: true
comments: false
math: false
mermaid: false
description: "GitHub Pages setup, CI/CD with Actions, gh CLI management, and safe cleanup of stale deployments."
image:
  path: https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png
  alt: "GitHub Pages: Setup, CI/CD, gh CLI, and Cleanup"
---

GitHub Pages, Explained as Scenarios (Situation → Goal → Tasks → Actions)
===================================================================================

Use these scenario cards to quickly map your Situation to the right Actions. Each card includes clear success signals and rollback notes so you stay in control.


Scenario A — Publish a Project Site (repo: posts)
--------------------------------------------------------------------------------

**Situation**
  You have a project repository (``posts``) and want it live at ``https://mr901.github.io/posts/``.

**Goal**
  Serve the site reliably via GitHub Pages with correct URLs and a repeatable CI/CD build.

**Tasks**
  1. Configure ``_config.yml`` with proper ``url``/``baseurl``
  2. Add a GitHub Actions workflow to build and deploy
  3. Enable Pages → Source = GitHub Actions

**Actions**
  ``_config.yml`` (project site)::

      url: "https://mr901.github.io"
      baseurl: "/posts"

  ``.github/workflows/pages-deploy.yml`` (core steps)::

      name: "Build and Deploy"
      on:
        push:
          branches: [ develop ]
        workflow_dispatch:

      permissions:
        contents: read
        pages: write
        id-token: write

      concurrency:
        group: "pages"
        cancel-in-progress: true

      jobs:
        build:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - id: pages
              uses: actions/configure-pages@v4
            - uses: ruby/setup-ruby@v1
              with:
                ruby-version: 3.4
                bundler-cache: true
            # If you use RST in Jekyll
            - uses: actions/setup-python@v4
              with:
                python-version: '3.x'
            - run: |
                pip install docutils pygments
            - name: Build site
              env:
                JEKYLL_ENV: "production"
              run: |
                bundle exec jekyll clean
                bundle exec jekyll b -d "_site"
            - name: Upload artifact
              uses: actions/upload-pages-artifact@v3
              with:
                path: "_site"

        deploy:
          runs-on: ubuntu-latest
          needs: build
          environment:
            name: github-pages
            url: ${{ steps.deployment.outputs.page_url }}
          steps:
            - id: deployment
              uses: actions/deploy-pages@v4

**Signals of success**
  - Actions tab shows a green Deploy to GitHub Pages
  - Pages (Settings → Pages) shows “Your site is live at …”
  - Opening ``https://mr901.github.io/posts/`` shows current content

**Rollback/Notes**
  - Revert a bad change by pushing a previous commit; Pages re-deploys
  - Use incognito or hard refresh to bypass CDN/browser cache


Scenario B — Inspect/Manage Deployments with gh CLI
--------------------------------------------------------------------------------

**Situation**
  You need visibility into which deployments exist and, if needed, remove one.

**Goal**
  List, inspect, and optionally delete Pages deployments using ``gh``.

**Tasks**
  1. Enumerate repositories and Pages status
  2. List deployments for a repo
  3. Delete a problematic deployment (rare)

**Actions**
  List repositories (selected fields)::

      gh api users/MR901/repos --jq '.[] | {name: .name, full_name: .full_name, has_pages: .has_pages, archived: .archived, disabled: .disabled}'

  List deployments per repo::

      gh api \
        --method GET \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/users/MR901/repos?per_page=70&type=all" | jq -r '.[].full_name' | while read repo; do
          echo "=== $repo ==="
          gh api \
            --method GET \
            -H "Accept: application/vnd.github+json" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "/repos/$repo/deployments" | jq -r '.[] | "\(.id) - \(.environment) - \(.ref)"'
          echo
        done

  List deployments for one repo::

      gh api \
        --method GET \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/mr901/posts/deployments | jq -r '.[] | "\(.id) - \(.environment) - \(.ref)"'

  Delete by deployment ID (use sparingly)::

      gh api \
        --method DELETE \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/MR901/posts/deployments/2944368246

**Signals of success**
  - ``gh`` returns expected JSON; deployment removed when deleted

**Rollback/Notes**
  - Deleting a deployment does not delete the site; redeploy via Actions


Scenario C — Clear Old Pages Content / Shut Down a Site
--------------------------------------------------------------------------------

**Situation**
  You deleted or plan to delete a repository, but the old Pages site persists.

**Goal**
  Ensure the CDN flushes and the site is removed or overwritten.

**Tasks**
  1. Push a guaranteed-successful dummy site
  2. Verify live content changed
  3. Disable Pages (and optionally delete repo)

**Actions**
  Push a minimal site to force a fresh deploy::

      git clone https://github.com/mr901/mr901.github.io.git
      cd mr901.github.io
      echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reset</title></head><body><h1>Site reset</h1></body></html>' > index.html
      git add index.html && git commit -m "reset site" && git push origin main

  Then disable Pages (UI) or via API::

      gh api -X DELETE \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/mr901/mr901.github.io/pages

**Signals of success**
  - Live site shows new dummy page, then becomes unavailable after disable

**Rollback/Notes**
  - Re-enable Pages anytime; push real content again
  - CDN/browser caching can delay; hard refresh or incognito helps


Scenario D — Pages Looks Out of Sync After a Successful Deploy
--------------------------------------------------------------------------------

**Situation**
  Actions is green, but the live site seems unchanged.

**Goal**
  Confirm deployment source and purge visible cache.

**Tasks**
  1. Verify Settings → Pages → Source = GitHub Actions (or correct branch/folder)
  2. Open the deployment’s “View deployment” URL from Actions
  3. Hard refresh or incognito test

**Actions**
  - Change content in ``index.html`` (e.g., add a version string) and push again
  - Validate the “Visit site” link in Pages settings matches your expected URL

**Signals of success**
  - Live site reflects the new versioned content

**Rollback/Notes**
  - CDN propagation can take minutes; another deploy often invalidates cache faster


Scenario E — Authoring Content that Survives baseurl
--------------------------------------------------------------------------------

**Situation**
  Internal links or assets are breaking under ``baseurl: "/posts"``.

**Goal**
  Write paths that work both locally and in production.

**Tasks**
  1. Use relative paths for images inside posts (e.g., ``assets/attachments/...``)
  2. Link to posts using their live slugs under ``/posts/slug/``

**Actions**
  RST image in a post::

      .. image:: assets/attachments/images/repo_icon.png
         :alt: Example

  Internal post links (examples)::

      * `Fundamentals </posts/jekyll-fundamentals-setup/>`_
      * `Content Creation </posts/jekyll-content-creation-guide/>`_

**Signals of success**
  - ``htmlproofer`` passes, images and links resolve on the live site

**Rollback/Notes**
  - Avoid absolute ``/assets/...`` in content; prefer relative paths within posts


Cheat Sheet
--------------------------------------------------------------------------------

* Project site → ``baseurl: "/<repo>"``; user site → ``baseurl: ""``
* Actions deploys are the most reliable source for Pages
* ``gh api`` helps list and manage deployments and disable Pages if needed
* When in doubt: change content, redeploy, hard refresh, confirm “View deployment” URL


Visual Walkthrough
--------------------------------------------------------------------------------


.. figure:: assets/attachments/images/github_actions_successful_build.png
   :alt: Successful GitHub Actions build steps

.. figure:: assets/attachments/images/github_actions_successful_deploy.png
   :alt: Successful GitHub Actions deploy with page URL

.. figure:: assets/attachments/images/github_settings_page.png
   :alt: GitHub Pages settings showing source and live URL

.. figure:: assets/attachments/images/github_code_successful_deployment.png
   :alt: Repository deployments view showing github-pages environment

.. figure:: assets/attachments/images/github_page_active_live.png
   :alt: Live site rendering after deployment


