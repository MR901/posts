---
layout: post
title: "Jekyll Fundamentals: Setup and Environment Configuration"
date: 2025-09-01 00:00:00 +0530
categories: [jekyll, setup]
tags: [jekyll, setup]
pin: false
toc: true
comments: false
math: false
mermaid: false
description: "This post covers the fundamentals of Jekyll, from creating your first repository to setting up development environments."
author: "Mohit Rajput"
image:
  path: https://jekyllrb.com/img/logo-2x.png
  alt: "Jekyll Fundamentals: Setup and Environment Configuration"
.. media_subpath: '/assets/images/2025-09-01/'
---

Jekyll Fundamentals: Setup and Environment Configuration
========================================================

This comprehensive guide covers Jekyll fundamentals, from creating your first repository to setting up development environments. Whether you're new to Jekyll or setting up a new environment, this guide provides everything you need to get started.

Understanding Jekyll
====================

What is Jekyll?
---------------

Jekyll is a **static site generator** that transforms plain text files into static websites and blogs. It's particularly popular for:

* **GitHub Pages** integration
* **Markdown and RST** support
* **Theme-based** customization
* **Blog-aware** features
* **Fast, secure** static sites

Key Concepts
------------

**Static Site Generation:**
- Source files → Processing → Static HTML/CSS/JS
- No database or server-side processing needed
- Fast loading and secure deployment

**Content Structure:**
- ``_posts/`` - Blog posts and articles
- ``_config.yml`` - Site configuration
- ``assets/`` - Images, CSS, JavaScript
- ``_site/`` - Generated output (temporary)

Creating Your Jekyll Site
==========================

Repository Setup Options
-------------------------

**Option 1: Using Jekyll Starter (Recommended)**

This approach simplifies upgrades and focuses on content creation:

1. **Create from Template:**

   * Navigate to Jekyll theme starter repository
   * Click "Use this template" → "Create a new repository"
   * Name it ``<username>.github.io`` for GitHub Pages

2. **Benefits:**

   * Simplified upgrade process
   * Clean, minimal setup
   * Focus on writing content
   * Automatic theme updates

**Option 2: Forking a Theme**

For users who want to modify the theme extensively:

1. **Fork the Repository:**

   * Fork the theme repository on GitHub
   * Name it ``<username>.github.io``
   * Clone to your local machine

2. **Considerations:**

   * More control over customization
   * Harder to upgrade theme
   * Requires Jekyll knowledge
   * Good for heavy modifications

Environment Setup
=================

Development Environment Options
-------------------------------

**Option 1: Dev Containers (Recommended for Windows)**

Dev Containers provide isolated, consistent environments using Docker:

**Prerequisites:**

* Docker Desktop (Windows/macOS) or Docker Engine (Linux)
* VS Code with Dev Containers extension

**Setup Steps:**

1. **Install Docker:**

   * Windows/macOS: Install Docker Desktop
   * Linux: Install Docker Engine

2. **Install VS Code Extensions:**

   * Dev Containers extension
   * Remote development support

3. **Clone and Open:**

   * Docker Desktop: Clone in container volume
   * Docker Engine: Clone locally, open in container

4. **Benefits:**

   * Isolated environment
   * Consistent across machines
   * No system dependency conflicts
   * Easy cleanup and reset

**Option 2: Native Setup (Recommended for Unix-like OS)**

Direct installation on your system for optimal performance:

**Prerequisites:**

* Ruby (with bundler)
* Git
* Node.js (for some themes)

**Setup Steps:**

1. **Install Jekyll:**

   Follow Jekyll installation guide for your OS::

       # Ubuntu/Debian
       sudo apt update
       sudo apt install ruby-full build-essential zlib1g-dev

       # macOS (using Homebrew)
       brew install ruby

2. **Install Bundler:**

   ::

       gem install bundler

3. **Clone Repository:**

   ::

       git clone <your-repo-url>
       cd <your-repo-name>

4. **Install Dependencies:**

   ::

       bundle install

5. **Initialize (if forked):**

   ::

       bash tools/init.sh  # For forked themes
       bundle

Basic Jekyll Workflow
======================

Development Cycle
-----------------

**1. Start Development Server:**

::

    bundle exec jekyll serve

* Builds the site
* Starts local server at http://localhost:4000
* Watches for file changes
* Auto-rebuilds on changes

**2. Create Content:**

* Write posts in ``_posts/`` directory
* Use Markdown (``.md``) or reStructuredText (``.rst``)
* Follow naming convention: ``YYYY-MM-DD-title.extension``

**3. Preview Changes:**

* Server automatically rebuilds
* Refresh browser to see updates
* Check for build errors in terminal

**4. Build for Production:**

::

    JEKYLL_ENV=production bundle exec jekyll build

Essential Configuration
=======================

Basic _config.yml Settings
---------------------------

Key configuration options to customize::

    # Site settings
    title: Your Site Title
    description: Site description for SEO
    url: "https://username.github.io"
    baseurl: ""  # For project sites: "/project-name"

    # Author settings
    author:
      name: Your Name
      email: your@email.com

    # Build settings
    markdown: kramdown
    highlighter: rouge
    timezone: Your/Timezone

    # Plugins
    plugins:
      - jekyll-feed
      - jekyll-sitemap
      - jekyll-seo-tag

Social Contact Configuration
----------------------------

Configure social links in ``_data/contact.yml``::

    - type: github
      icon: 'fab fa-github'
    - type: twitter
      icon: 'fab fa-twitter'
    - type: email
      icon: 'fas fa-envelope'
      noblank: true

Development Best Practices
===========================

Project Organization
---------------------

**Directory Structure:**

::

    your-jekyll-site/
    ├── _config.yml          # Main configuration
    ├── _data/              # Site data files
    ├── _includes/          # Reusable components
    ├── _layouts/           # Page templates
    ├── _posts/             # Blog posts
    ├── _sass/              # Sass stylesheets
    ├── assets/             # Static assets
    ├── Gemfile             # Ruby dependencies
    └── _site/              # Generated output (ignored)

**File Naming:**

* Posts: ``YYYY-MM-DD-title.md``
* Pages: ``about.md``, ``contact.md``
* Assets: Organized in subdirectories

**Content Management:**

* Use descriptive filenames
* Organize assets by type or date
* Keep source files clean and organized
* Use consistent front matter

Version Control
---------------

**Git Best Practices:**

* Commit source files, not ``_site/``
* Use ``.gitignore`` for build artifacts
* Regular commits with descriptive messages
* Separate branches for features/experiments

**Essential .gitignore:**

::

    _site/
    .jekyll-cache/
    .jekyll-metadata
    .bundle/
    vendor/

Local Development Tips
----------------------

**Performance:**

* Use ``--incremental`` for faster builds
* Exclude unnecessary files in ``_config.yml``
* Optimize images before adding to assets

**Debugging:**

* Use ``--trace`` for detailed error messages
* Check Jekyll and plugin versions
* Test builds in production environment

**Workflow Optimization:**

* Use live reload for instant updates
* Set up editor with Jekyll syntax support
* Create content templates for consistency

Troubleshooting Common Issues
=============================

Environment Problems
--------------------

**Ruby Version Issues:**

::

    # Check Ruby version
    ruby --version

    # Use Ruby version manager if needed
    rbenv install 3.0.0
    rbenv global 3.0.0

**Gem Conflicts:**

::

    # Clean bundle
    bundle clean --force

    # Reinstall gems
    bundle install

**Permission Issues:**

::

    # Install gems to user directory
    bundle config set --local path 'vendor/bundle'
    bundle install

Build Errors
------------

**Common Solutions:**

1. **Clean and rebuild:**

   ::

       bundle exec jekyll clean
       bundle exec jekyll build

2. **Update dependencies:**

   ::

       bundle update

3. **Check configuration:**

   * Validate YAML syntax in ``_config.yml``
   * Check plugin compatibility
   * Verify file permissions

Next Steps
==========

Once your Jekyll environment is set up:

1. **Learn content creation** - Writing posts and pages
2. **Explore themes** - Customization and styling
3. **Add features** - Plugins and advanced functionality
4. **Deploy your site** - GitHub Pages, Netlify, or other hosts

Jekyll Quick Recovery Guide
===========================

Server Management
-----------------

**Start Server:**

::

    bundle exec jekyll serve --host 0.0.0.0 --port 4000

**Stop Server:**

::

    # In terminal: Ctrl+C
    # Or kill process:
    pkill -f jekyll

**Check Running Processes:**

::

    ps aux | grep jekyll

**Force Kill All Jekyll Processes:**

::

    pkill -9 -f jekyll

Reset and Cleanup
-----------------

**Full Reset (when things break):**

::

    # 1. Kill any running Jekyll
    pkill -f jekyll

    # 2. Clean build artifacts
    bundle exec jekyll clean

    # 3. Fresh build
    bundle exec jekyll build

    # 4. Start server
    bundle exec jekyll serve --host 0.0.0.0

**Clean Build Cache:**

::

    bundle exec jekyll clean
    rm -rf .jekyll-cache
    rm -rf _site

**Reset Ruby Dependencies:**

::

    bundle clean --force
    bundle install

Common Issues - Quick Fixes
============================

**Issue: "No such file or directory - getcwd"**

::

    # You're in a deleted directory
    cd /workspaces/mr9
    bundle exec jekyll serve --host 0.0.0.0

**Issue: Port Already in Use**

::

    # Kill process on port 4000
    lsof -ti:4000 | xargs kill -9

    # Or use different port
    bundle exec jekyll serve --port 4001

**Issue: RST Warnings (Safe to Ignore)**

::

    <string>:895: (ERROR/3) Unexpected indentation.
    # Site still builds - warnings don't break functionality

**Issue: Changes Not Appearing**

::

    # Force rebuild
    bundle exec jekyll clean
    bundle exec jekyll serve --host 0.0.0.0

**Issue: Python/RST Not Working**

::

    # Check Python symlink
    python --version

    # Fix if needed
    sudo ln -s /usr/bin/python3 /usr/bin/python

Build Process Essentials
========================

**Development Workflow:**

::

    # 1. Start server (auto-rebuilds on changes)
    bundle exec jekyll serve --host 0.0.0.0

    # 2. Edit files in _posts/, assets/, etc.
    # 3. Check browser - changes appear automatically
    # 4. Stop server: Ctrl+C

**Production Build:**

::

    JEKYLL_ENV=production bundle exec jekyll build

**Debug Build Issues:**

::

    bundle exec jekyll build --trace --verbose

**Test Specific RST File:**

::

    python _plugins/jekyll-rst/rst2html.py _posts/your-file.rst

Best Practices
==============

**Daily Workflow:**

1. ``cd /workspaces/mr9`` - Always start in correct directory
2. ``bundle exec jekyll serve --host 0.0.0.0`` - Start server
3. Edit content files
4. ``Ctrl+C`` - Stop server when done

**When Things Break:**

1. ``pkill -f jekyll`` - Kill any hanging processes
2. ``bundle exec jekyll clean`` - Clean build cache
3. ``cd /workspaces/mr9`` - Ensure correct directory
4. ``bundle exec jekyll serve --host 0.0.0.0`` - Restart fresh

**Before Deploying:**

::

    # Test production build
    JEKYLL_ENV=production bundle exec jekyll build --trace

**File Organization:**

- Edit source files in ``_posts/``, ``assets/``, ``_config.yml``
- Never edit files in ``_site/`` (gets overwritten)
- Use version control: ``git add .`` → ``git commit`` → ``git push``
