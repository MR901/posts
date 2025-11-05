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
allow_edit: true
---

GitHub Pages, Explained as Scenarios (Situation → Goal → Tasks → Actions)
=========================================================================

Use these scenario cards to quickly map your situation to the right actions. Each card focuses on outcomes and concise steps.


Scenario A — CI/CD pipeline setup (generator‑agnostic)
------------------------------------------------------

**Situation**

  You want to automatically build and deploy a static site (any generator) to GitHub Pages.

**Goal**

  Establish a minimal, repeatable CI/CD workflow that builds your site and deploys it on every push.

**Tasks**
  1. Decide your build step so it outputs a single folder (e.g., ``dist``)

  2. Add a GitHub Actions workflow to build and upload that folder as the Pages artifact

  3. Enable Pages → Source = GitHub Actions


**Actions**

  .. code-block:: yaml
     :caption: .github/workflows/pages-deploy.yml (generic)

      name: "Build and Deploy"
      on:

        push:

          branches: [ main ]   # adjust as needed
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


            # Choose ONE build path below

            # A) Plain static content already in repo root
            # - name: Prepare static folder
            #   run: mkdir -p dist && cp -r * dist/

            # B) Node-based static site (Vite, Next export, Astro, etc.)
            # - uses: actions/setup-node@v4
            #   with:
            #     node-version: '20'
            # - run: npm ci && npm run build   # ensure output is ./dist

            # C) Jekyll (example)
            # - uses: ruby/setup-ruby@v1
            #   with:
            #     ruby-version: '3.2'
            #     bundler-cache: true
            # - run: bundle exec jekyll build -d _site && mv _site dist

            - name: Upload artifact
              uses: actions/upload-pages-artifact@v3
              with:

                path: "dist"   # change if your output folder differs


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
  - Actions run is green; the job has a “View deployment”/page URL

  - Settings → Pages shows “Your site is live at …”

  - Opening the live URL shows the new content


**Rollback/Notes**
  - Revert a change by pushing a previous commit; Pages re-deploys

  - If content looks cached, try a private window or a hard refresh



Attachment references data on GitHub Pages (important)
------------------------------------------------------

**GitHub Pages runs Jekyll in safe mode and does not execute custom plugins. This site uses a custom attachment data generator to power the "Referenced in" panel on the ``Attachments`` tab. Before pushing to the branch that Pages builds from, pre-generate and commit the data files**

::

   make data           # generates _data/attachment_{galleries,references}.yml
   make pages-prep     # optional: builds locally to verify
   git add _data/attachment_galleries.yml _data/attachment_references.yml
   git commit -m "chore(data): update attachment data for Pages"
   git push origin <pages-source-branch>

Where to confirm the branch/folder: GitHub → Settings → Pages → Build and deployment → Source. Ensure the generated files exist in that branch (e.g., ``main``) and folder (root or ``/docs``).


Scenario B — Inspect/Manage Deployments with gh CLI
---------------------------------------------------

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

  .. code-block:: shell
     :caption: List repositories (selected fields)

      gh api users/<USER>/repos --jq '.[] | {name: .name, full_name: .full_name, has_pages: .has_pages, archived: .archived, disabled: .disabled}'

  List deployments per repo::

      gh api \

        --method GET \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/users/<USER>/repos?per_page=70&type=all" | jq -r '.[].full_name' | while read repo; do

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
        /repos/<USER>/<REPO>/deployments | jq -r '.[] | "\(.id) - \(.environment) - \(.ref)"'

  Delete by deployment ID (use sparingly)::

  .. code-block:: shell
     :caption: Delete by deployment ID (use sparingly)

      gh api \

        --method DELETE \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/<USER>/<REPO>/deployments/<ID>

**Signals of success**
  - ``gh`` returns expected JSON; the listed item is removed after delete


**Rollback/Notes**
  - Deleting a deployment does not delete the site; re-run your deployment workflow to publish again



Scenario C — Clear Old Pages Content / Shut Down a Site
-------------------------------------------------------

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

      # User site variant (served from <USER>.github.io)
      git clone https://github.com/<USER>/<USER>.github.io.git
      cd <USER>.github.io
      echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reset</title></head><body><h1>Site reset</h1></body></html>' > index.html
      git add index.html && git commit -m "reset site" && git push origin main

      # Project site variant (served from <USER>.github.io/<REPO>/)
      # git clone https://github.com/<USER>/<REPO>.git
      # cd <REPO>
      # echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reset</title></head><body><h1>Site reset</h1></body></html>' > index.html
      # git add index.html && git commit -m "reset site" && git push origin main

  Then disable Pages (UI) or via API::

  .. code-block:: shell
     :caption: Then disable Pages (UI) or via API

      gh api -X DELETE \

        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        /repos/<USER>/<REPO>/pages

**Signals of success**
  - Live site shows new dummy page, then becomes unavailable after disable


**Rollback/Notes**
  - Re-enable Pages anytime and push real content again

  - CDN/browser caching can delay visibility; hard refresh or incognito helps



Scenario D — Pages Looks Out of Sync After a Successful Deploy
--------------------------------------------------------------

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
----------------------------------------------------

**Situation**

  Internal links or assets are breaking under a project site's base path (e.g., ``baseurl: "/<repo>"``).

**Goal**

  Write paths that work both locally and in production.

**Tasks**
  1. Prefer relative paths for images/assets inside posts (e.g., ``attachments/general/...``)

  2. Use live URLs that include the base path when linking between pages


**Actions**

  RST image in a post::

      .. image:: attachments/general/images/repo_icon.png

         :alt: Example


  Internal post links (examples):

**# User site (https://<user>.github.io)**
      - ``/`` → Home

      - ``/post-a/`` → Post A


**# Project site (https://<user>.github.io/REPO/)**
      - ``/REPO/`` → Home

      - ``/REPO/post-a/`` → Post A


**Signals of success**
  - ``htmlproofer`` (or your checks) pass; images and links resolve on the live site


**Rollback/Notes**
  - Avoid absolute ``/assets/...`` in content; prefer relative paths within posts



Scenario F — User vs Project site quick reference
-------------------------------------------------

**User site**
  - Live base URL: ``https://<user>.github.io``

  - Typically no base path (``baseurl: ""``)

  - Link root is ``/``


**Project site**
  - Live base URL: ``https://<user>.github.io/<repo>/``

  - Base path is usually the repo name (``baseurl: "/<repo>"``)

  - Link root is ``/<repo>/``


Scenario G — Custom domain and HTTPS
------------------------------------

**Situation**

  You want your site served at a custom domain with HTTPS.

**Goal**

  Connect a custom domain, validate DNS, and enforce HTTPS in Pages settings.

**Tasks**
  1. Add a ``CNAME`` file to the site output with your domain (e.g., ``www.example.com``)

  2. Configure DNS: CNAME for ``www``; ALIAS/ANAME (or A records) for apex

  3. In Settings → Pages, set the custom domain and enable “Enforce HTTPS”


**Actions**

  Add ``CNAME`` to your site source (copied to output)::

      echo 'www.example.com' > CNAME

  DNS guidance::

      # Subdomain (www):
      #   CNAME www → <user>.github.io
      # Apex (example.com):
      #   Prefer ALIAS/ANAME example.com → <user>.github.io
      #   Or A records to GitHub Pages IPs (check GitHub docs for current list)

**Signals of success**
  - Pages shows your custom domain and HTTPS status is “Enforced”


**Rollback/Notes**
  - DNS changes may take time; re-validate domain in Pages settings if needed



Scenario H — PR preview builds (artifacts & Job Summary)
--------------------------------------------------------

**Situation**

  Reviewers want to preview a PR build without merging.

**Goal**

  Build the site on pull_request, upload the output as an artifact, and link it in the job summary.

**Actions**

  .. code-block:: yaml
     :caption: .github/workflows/preview.yml (excerpt)

      name: "PR Preview"
      on:

        pull_request:

          branches: [ main ]

      jobs:

        preview:

          runs-on: ubuntu-latest

          steps:
            - uses: actions/checkout@v4

            # build your site to ./dist
            # - uses: actions/setup-node@v4
            # - run: npm ci && npm run build
            - uses: actions/upload-artifact@v4
              with:

                name: site-preview
                path: dist

            - name: Add summary
              run: |

                echo "PR preview artifact: site-preview" >> "$GITHUB_STEP_SUMMARY"


**Notes**
  - Artifacts can be downloaded from the workflow run; they’re ephemeral



Scenario I — Monorepo subdirectory deployments
----------------------------------------------

**Situation**

  Your site lives under a subdirectory in a monorepo (e.g., ``apps/docs``).

**Goal**

  Build from a subdirectory and upload only that output folder as the Pages artifact.

**Actions**

  ``.github/workflows/pages-deploy.yml`` (excerpt)::

      jobs:

        build:

          runs-on: ubuntu-latest
          defaults:

            run:

              working-directory: apps/docs

          steps:
            - uses: actions/checkout@v4

            # build in apps/docs → outputs to apps/docs/dist
            # - uses: actions/setup-node@v4
            # - run: npm ci && npm run build
            - name: Upload artifact
              uses: actions/upload-pages-artifact@v3
              with:

                path: apps/docs/dist


**Notes**
  - Alternatively, ``cd apps/docs`` per step; ensure the artifact path points to the built folder



Scenario J — Cache‑busting and version stamping
-----------------------------------------------

**Situation**

  Browsers cache your static assets aggressively.

**Goal**

  Add a short revision id to asset URLs to force cache refresh on deploys.

**Actions**

  Generic approach in CI::

      - name: Compute short rev
        id: rev
        run: echo "rev=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT


      - name: Inject rev into HTML
        run: |

          find dist -name '*.html' -print0 | xargs -0 sed -i "s/\[REV\]/${{ steps.rev.outputs.rev }}/g"


  Then author asset URLs like::

      <link rel="stylesheet" href="/assets/site.css?[REV]">
      <script src="/assets/site.js?[REV]"></script>

**Notes**
  - Many frameworks offer built‑in hashing; prefer those when available
