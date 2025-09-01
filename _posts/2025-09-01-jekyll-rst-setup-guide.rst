---
layout: post
title: "Jekyll RST Setup Guide: Essential Configuration and Commands"
date: 2025-09-01 12:00:00 +0530
categories: [jekyll, documentation, rst]
tags: [jekyll, restructuredtext, setup, bundler, commands]
---

Jekyll RST Setup Guide: Essential Configuration and Commands
============================================================

This guide covers the essential setup and usage of Jekyll with reStructuredText (RST) support, focusing on practical commands and configurations you need to know.

Repository Overview
===================

This Jekyll site supports both Markdown and reStructuredText posts with:

* **Jekyll 4.4.1** with Chirpy theme
* **Custom RST plugin** in ``_plugins/jekyll-rst/``
* **RbST gem** for RST processing
* **Python dependencies** for docutils and pygments

Essential File Structure
------------------------

::

    /workspaces/mr9/
    ├── _config.yml              # Main Jekyll configuration
    ├── Gemfile                  # Ruby dependencies
    ├── _plugins/jekyll-rst/     # Custom RST processing plugin
    ├── _posts/                  # Blog posts (.md and .rst)
    ├── assets/                  # Static assets (images, CSS, JS)
    └── _site/                   # Generated site (build output)

Quick Setup
===========

System Dependencies
-------------------

Install required system packages::

    # Ubuntu/Debian
    sudo apt update
    sudo apt install ruby-full python3-docutils python3-pygments

    # Create python symlink (CRITICAL for RbST compatibility)
    sudo ln -s /usr/bin/python3 /usr/bin/python

Ruby Dependencies
-----------------

Install Jekyll and gems::

    bundle install

Essential Jekyll Commands
=========================

Understanding Bundle Exec
--------------------------

**What is ``bundle exec``?**

``bundle exec`` ensures commands run with the exact gem versions specified in your ``Gemfile.lock``. This prevents version conflicts and ensures consistent behavior across different environments.

**Why use it?**

* **Version consistency**: Uses locked gem versions
* **Dependency isolation**: Avoids conflicts with system gems
* **Reproducible builds**: Same behavior everywhere

Core Jekyll Commands
--------------------

**1. Build the Site**::

    bundle exec jekyll build

**What it does:**
- Processes all source files (Markdown, RST, HTML)
- Applies layouts and includes
- Generates static HTML in ``_site/`` directory
- Copies assets to ``_site/``
- Creates feeds and sitemaps

**When to use:** Before deployment, or to test build process

**2. Serve Locally**::

    bundle exec jekyll serve

**What it does:**
- Builds the site (like ``build``)
- Starts a local web server on http://localhost:4000
- Watches for file changes and rebuilds automatically
- Serves the site from ``_site/`` directory

**When to use:** During development for live preview

**3. Serve with Options**::

    # For containers/codespaces (accessible from outside)
    bundle exec jekyll serve --host 0.0.0.0 --port 4000

    # With live reload (auto-refresh browser)
    bundle exec jekyll serve --livereload

    # Incremental builds (faster for large sites)
    bundle exec jekyll serve --incremental

**4. Clean Build**::

    bundle exec jekyll clean

**What it does:**
- Removes ``_site/`` directory
- Clears ``.jekyll-cache/`` and ``.jekyll-metadata``
- Resets build state

**When to use:** When builds seem corrupted or cached incorrectly

**5. Build with Debugging**::

    bundle exec jekyll build --trace

**What it does:**
- Shows detailed error messages
- Displays full stack traces
- Helps identify build problems

**When to use:** When troubleshooting build errors

Development Workflow Commands
-----------------------------

**Typical Development Session**::

    # 1. Start development server
    bundle exec jekyll serve --host 0.0.0.0 --livereload

    # 2. Edit files in _posts/, assets/, etc.
    # 3. Jekyll automatically rebuilds and refreshes browser

**Production Build**::

    # Set production environment
    JEKYLL_ENV=production bundle exec jekyll build

**Clean and Rebuild**::

    bundle exec jekyll clean
    bundle exec jekyll build

Understanding Jekyll's Build Process
====================================

The `_site` Directory
---------------------

**What is `_site`?**

The ``_site`` directory is Jekyll's **build output** - it contains the final static website.

**Key Points:**

* **Temporary**: Regenerated on every build
* **Never edit directly**: Always edit source files
* **Git ignored**: Not committed to version control
* **Deployment ready**: Contents get served to users

**Build Process Flow**::

    Source Files → Jekyll Processing → _site Directory

    _posts/my-post.rst     →  _site/posts/my-post/index.html
    assets/img/icon.png    →  _site/assets/img/icon.png
    _config.yml            →  (configuration, not copied)

Working with RST Files
======================

Creating RST Posts
-------------------

**File Naming**: ``YYYY-MM-DD-post-title.rst``

**Location**: ``_posts/`` directory

**Front Matter**: Required YAML header::

    ---
    layout: post
    title: "Your Post Title"
    date: 2025-09-01 12:00:00 +0530
    categories: [category1, category2]
    tags: [tag1, tag2, tag3]
    ---

**RST Content Example**::

    My Post Title
    =============

    This is my content with **bold** and *italic* text.

    Code Example
    ------------

    .. code-block:: python

       def hello_world():
           print("Hello from RST!")

RST Syntax Quick Reference
---------------------------

**Headers**::

    Main Title
    ==========

    Section
    -------

    Subsection
    ~~~~~~~~~~

**Text Formatting**::

    **Bold text**
    *Italic text*
    ``Inline code``

**Code Blocks**::

    .. code-block:: python

       def hello():
           print("Hello, World!")

**Lists**::

    * Bullet point
    * Another point

    1. Numbered list
    2. Second item

**Links**::

    `Link text <https://example.com>`_

Configuration Files
===================

Key Configuration (_config.yml)
-------------------------------

Essential settings for RST support::

    # Plugins
    plugins:
      - jekyll-paginate
      - jekyll-seo-tag
      # Note: We use custom RST plugin, not jekyll-rst gem

    # Include RST files
    include:
      - "*.rst"

Gemfile Dependencies
--------------------

Required gems::

    gem 'jekyll', '~> 4.4.1'
    gem 'RbST'  # For RST processing

Dev Container Setup (Optional)
===============================

For consistent development environment, create ``.devcontainer/devcontainer.json``::

    {
      "name": "Jekyll RST Development",
      "image": "mcr.microsoft.com/devcontainers/ruby:3.1",
      "features": {
        "ghcr.io/devcontainers/features/python:1": {}
      },
      "postCreateCommand": "sudo apt update && sudo apt install -y python3-docutils python3-pygments && sudo ln -s /usr/bin/python3 /usr/bin/python && bundle install",
      "forwardPorts": [4000]
    }

Testing Your Setup
==================

Verification Steps
------------------

**1. Test Python Setup**::

    python --version
    python -c "import docutils, pygments; print('Dependencies OK')"

**2. Test Jekyll Build**::

    bundle exec jekyll build --trace

**3. Test Local Server**::

    bundle exec jekyll serve --host 0.0.0.0

**4. Test RST Processing**::

    # Create a test RST file and build
    echo "Test\n====" > _posts/$(date +%Y-%m-%d)-test.rst
    bundle exec jekyll build

Common Quick Fixes
==================

**Site not loading**: Clean and rebuild::

    bundle exec jekyll clean
    bundle exec jekyll serve --host 0.0.0.0

**RST files not processing**: Check Python setup::

    python --version  # Should work
    which python       # Should point to python3

**Build errors**: Use trace for details::

    bundle exec jekyll build --trace

**Changes not appearing**: Hard refresh or clean build::

    bundle exec jekyll clean && bundle exec jekyll serve

Summary
=======

**Essential Commands to Remember:**

* ``bundle exec jekyll serve`` - Development server
* ``bundle exec jekyll build`` - Build site
* ``bundle exec jekyll clean`` - Clean build

**Key Concepts:**

* ``_site/`` is temporary build output
* Always edit source files, never ``_site/``
* Use ``bundle exec`` for consistent gem versions
* RST files need Python with docutils/pygments

**Development Workflow:**

1. Edit source files in ``_posts/``, ``assets/``, etc.
2. Run ``bundle exec jekyll serve`` for live preview
3. Jekyll automatically rebuilds on file changes
4. Use ``bundle exec jekyll clean`` if issues arise

Understanding Jekyll Cache Files
================================

The `.jekyll-cache` Directory
-----------------------------

**What is `.jekyll-cache`?**

The ``.jekyll-cache`` directory is Jekyll's **performance optimization cache** that stores:

* **Processed content**: Pre-compiled Markdown/RST → HTML conversions
* **Plugin outputs**: Cached results from plugins and converters
* **Build artifacts**: Intermediate processing results

**Key Points:**

* **Temporary**: Can be safely deleted anytime
* **Regenerated**: Jekyll recreates it automatically
* **Performance**: Speeds up builds by avoiding reprocessing
* **Git ignored**: Already excluded from version control

**Cache Management:**

* Cleared automatically by ``jekyll clean``
* Can be deleted manually: ``rm -rf .jekyll-cache``
* First build after deletion will be slower (recreates cache)
* Subsequent builds will be faster (uses cache)

Repository Cleanup
==================

Files You Don't Need
---------------------

**Already Properly Excluded:**

* ``_site/`` - Build output (temporary)
* ``.jekyll-cache/`` - Performance cache (temporary)
* ``.jekyll-metadata`` - Build metadata (temporary)

**Files You Can Remove:**

* ``__pycache__/`` directories - Python cache files
* ``.git`` files in plugin directories - Git submodule artifacts
* Plugin documentation files (README, LICENSE) - If not needed

**Updated .gitignore:**

The repository now properly excludes::

    # Jekyll cache
    .jekyll-cache
    .jekyll-metadata
    _site

    # Python cache
    __pycache__/
    *.py[cod]
    *$py.class

This setup provides a robust Jekyll environment with RST support for technical documentation and blogging.
