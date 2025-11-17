Jekyll + Chirpy Starter
=======================

This repository is a Jekyll site powered by the Chirpy theme with first‑class
reStructuredText (RST) support and an attachments workflow. It provides:

- a ready‑to‑use setup for writing posts and pages,
- an opinionated attachments structure for images, articles, and papers,
- helper scripts and Make targets for local development and GitHub Pages.

Quick Start
-----------

- Install dependencies::

    bundle install

- Serve locally (base URL from ``_config.yml``)::

    bundle exec jekyll serve --livereload

  Open ``http://127.0.0.1:4000/posts`` (or run with ``--baseurl ""`` to serve at ``/``).

- Create content:

  - Add a post under ``_posts/``
  - Put shared and per‑post assets under ``attachments/`` (see Attachments)

- Deploy:

  - Pre‑generate attachment data (see GitHub Pages section)
  - Commit and push to your Pages source branch

Attachments
-----------

- Base directory (configurable via ``attachments_dir`` in ``_config.yml``): ``attachments/``
- Use shared buckets for cross‑post assets and per‑post buckets for post‑scoped assets

Recommended structure::

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

RST linking examples::

  .. image:: attachments/general/images/example.png
     :alt: Example image

  .. figure:: attachments/posts/your-post-slug/images/diagram.png
     :alt: Diagram

  `Download the paper <attachments/general/research_papers/paper.pdf>`_

Dev Container (optional)
------------------------

You can develop in a containerized environment using VS Code Dev Containers or
GitHub Codespaces. If you add a ``.devcontainer/`` configuration, use an image
such as ``mcr.microsoft.com/devcontainers/jekyll:2-bullseye`` and run::

  bundle exec jekyll serve --livereload --host 0.0.0.0

If no dev container config is present, use Local Development below.

Local Development
-----------------

Prerequisites
~~~~~~~~~~~~~

- Ruby (3.x recommended) and Bundler
- Node.js (optional, for asset tooling)

Verify your tools::

  ruby -v
  gem install bundler
  bundle -v

Install and run locally
~~~~~~~~~~~~~~~~~~~~~~~

Basic flow::

  bundle install
  bundle exec jekyll serve --livereload

Open ``http://127.0.0.1:4000/posts``.

Serve at root during local preview (ignore configured baseurl)::

  bundle exec jekyll serve --livereload --baseurl ""

Locate installed theme files (optional)::

  bundle info --path jekyll-theme-chirpy

One‑click run options
~~~~~~~~~~~~~~~~~~~~~

- Makefile: ``make serve`` (or ``make serve-root``)
- Script: ``./scripts/serve.sh`` (or ``./scripts/serve.sh --root``)

Writing Content
---------------

See the detailed guide in ``_posts/2025-09-01-jekyll-content-creation-guide.rst``.

New post
~~~~~~~~

Create a file in ``_posts/`` named ``YYYY-MM-DD-your-title.md`` (or ``.rst``/``.markdown``).

Minimal front matter::

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

Extended front matter (optional)::

  ---
  layout: post
  title: "Your Post Title"
  date: 2025-09-01 12:00:00 +0000
  categories: [Category, Subcategory]
  tags: [tag1, tag2]
  description: "Short summary for previews"
  author: your_author_id
  image:
    path: /assets/images/2025-09-01/example.png
    alt: "Descriptive alt text"
  media_subpath: "/assets/images/2025-09-01/"
  pin: false          # Pin to top on home page
  toc: true           # Show table of contents sidebar
  comments: true      # Enable comments for this post
  math: false         # Enable MathJax on this page
  mermaid: false      # Enable Mermaid diagrams on this page
  allow_edit: true    # Custom: see Post Protection section
  published: true     # Set false to skip publishing this post
  # sitemap: false    # Exclude this page from jekyll-sitemap
  ---

RST skeleton::

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

Pages
~~~~~

Create standalone pages (e.g., ``about.md``) at the project root or in a folder.
Use ``layout: page`` or a custom layout.

Conventions
~~~~~~~~~~~

- **Posts**: ``_posts/``, named ``YYYY-MM-DD-title.ext``
- **Categories**: up to two levels, e.g., ``[Tutorial, Jekyll]``
- **Tags**: lowercase, specific topics, e.g., ``[jekyll, static-sites]``
- **Attachments**:

  - Shared: ``attachments/general/{images,articles,research_papers}``
  - Per‑post: ``attachments/posts/<slug>/{images,articles,research_papers}``

- **Accessibility**: always set ``image.alt``

Authoring Workflow (branches, PRs, validation)
----------------------------------------------

Create a new branch::

  git checkout -b feature/your-post-slug

Add post in reStructuredText::

  _posts/
  ├── 2025-09-01-your-post-slug.rst

Add attachments
~~~~~~~~~~~~~~~

- Put shared files under ``attachments/general/...``
- For post‑specific assets, use ``attachments/posts/<your-post-slug>/...``
- Prefer relative paths like ``attachments/...`` in your content so links work with any ``baseurl``

Preview and validate locally
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Dev Container: ``bundle exec jekyll serve --livereload --host 0.0.0.0``
- Local: ``bundle exec jekyll serve --livereload`` and open ``http://127.0.0.1:4000``
- Validate links and images, skim the layout, and check build warnings

Optional link check (CI‑style)::

  bundle exec jekyll build
  bundle exec htmlproofer --disable-external _site

Commit, push, and open PR::

  git add _posts/ attachments/
  git commit -m "add(post): your-post-slug with attachments"
  git push -u origin feature/your-post-slug

Merge into base branch
~~~~~~~~~~~~~~~~~~~~~~

- After review passes and checks are green, squash‑merge into ``develop``
- If you deploy from ``main``, create a follow‑up PR from ``develop`` → ``main``

Project Structure
-----------------

High‑level layout::

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
  └── README.rst

Useful Commands
---------------

Common tasks::

  # Install dependencies
  bundle install

  # Run locally with live reload
  bundle exec jekyll serve --livereload

  # Build the site
  bundle exec jekyll build

  # Update gems (if needed)
  bundle update

Make targets::

  make serve         # Serve using scripts/serve.sh
  make serve-root    # Serve with baseurl ""
  make clean         # Clean caches and build output
  make test          # Build + htmlproofer with baseurl-aware swap
  make data          # Generate attachment data for GitHub Pages
  make pages-prep    # data + local build to verify

Post Protection
---------------

Protect finalized posts from accidental edits using two layers:

1. Front matter flag: add ``allow_edit: false`` to the post’s YAML
2. IDE ignore: add the post path to ``.cursorignore`` (to hide from fuzzy search)

Protect a post::

  # 1. Edit the post's front matter - add:
  #    allow_edit: false
  #
  # 2. Edit .cursorignore - add the post path:
  #    _posts/2025-09-01-your-post-name.rst
  #
  # 3. Commit both changes together
  git add _posts/2025-09-01-your-post-name.rst .cursorignore
  git commit -m "Protect: your post name"

Unprotect a post::

  # 1. Remove the line from .cursorignore
  # 2. Change to allow_edit: true (or remove the field)
  # 3. Make your edits
  # 4. Re-protect if desired

Attachment references on GitHub Pages
-------------------------------------

GitHub Pages runs Jekyll in safe mode and will not execute custom plugins.
This site ships a custom attachment scanner/generator, so you must pre‑generate
and commit the data files that power the “Referenced in” panel on the ``Attachments`` tab.

Before pushing to your Pages source branch (e.g., ``main``)::

  # Generate `_data/attachment_{galleries,references}.yml`
  make data

  # Optionally build locally to verify
  make pages-prep

  # Commit the generated data files
  git add _data/attachment_galleries.yml _data/attachment_references.yml
  git commit -m "chore(data): update attachment data for Pages"
  git push origin <pages-source-branch>  # e.g., main

Notes
~~~~~

- ``attachments_dir`` in ``_config.yml`` controls where attachments live (default: ``attachments``)
- Prefer relative paths like ``attachments/...`` in posts so links work with any ``baseurl``
- The generator respects ``_config.yml`` ``baseurl`` when composing absolute URLs for data files
- In CI, run ``python3 scripts/generate_attachment_data.py .`` before ``jekyll build`` and deploy the output

Use in Your Own Jekyll Site
---------------------------

Option A: Use this repository
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Fork the repo
2. Update ``_config.yml``:

   - ``url`` to your domain (e.g., ``https://username.github.io``)
   - ``baseurl`` to your site path (e.g., ``/posts`` or leave empty for root)
   - social links and metadata

3. Generate attachment data (see GitHub Pages section) and commit
4. Configure GitHub Pages (Settings → Pages) to build from your selected branch

Option B: Add RST + attachments to an existing site
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

1. Copy ``_plugins/jekyll-rst/`` into your project
2. Add to your ``Gemfile``::

     gem 'RbST'

3. Allow RST files in ``_config.yml``::

     include:
       - "*.rst"

4. Create the ``attachments/`` directory and set ``attachments_dir`` in ``_config.yml``
5. Add the attachment data generator to CI::

     python3 scripts/generate_attachment_data.py .
     bundle exec jekyll build

Troubleshooting
---------------

- Gem or dependency errors: run ``bundle update``, then ``bundle install``
- Ruby version mismatch: ensure your Ruby matches Gemfile requirements (Ruby 3.x recommended)
- Port already in use: run ``bundle exec jekyll serve -P 4001``
- Pages not rendering locally:

  - Open ``http://127.0.0.1:4000/posts`` (matches configured ``baseurl``)
  - Or serve with ``--baseurl ""`` to preview at root
  - Ensure every post has valid front matter (``---``) and correct filename ``YYYY-MM-DD-title.rst``
  - Clear cache and rebuild: ``bundle exec jekyll clean && bundle exec jekyll serve``
  - Run with ``--trace`` for detailed error logs
  - For RST, verify the converter plugin loads (files under ``_plugins/jekyll-rst/``) and the ``RbST`` gem is installed

Documentation and Links
-----------------------

- Chirpy theme docs: https://github.com/cotes2020/jekyll-theme-chirpy/wiki
- Jekyll docs: https://jekyllrb.com/docs/


