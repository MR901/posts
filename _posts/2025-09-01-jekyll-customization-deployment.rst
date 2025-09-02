---
layout: post
title: "Jekyll Customization and Deployment: Themes, Assets, and Publishing"
date: 2025-09-01 00:00:00 +0530
categories: [jekyll, customization, deployment]
tags: [jekyll, customization, deployment]
pin: false
toc: true
comments: false
math: false
mermaid: false
description: "This post covers the customization and deployment of Jekyll, from theme modification and asset management to deployment strategies."
author: "Mohit Rajput"
image:
  path: https://jekyllrb.com/img/logo-2x.png
  alt: "Jekyll Customization and Deployment: Themes, Assets, and Publishing"
.. media_subpath: '/assets/images/2025-09-01/'
---

Jekyll Customization and Deployment: Themes, Assets, and Publishing
====================================================================

This comprehensive guide covers Jekyll customization, from theme modification and asset management to deployment strategies. Learn how to personalize your site and publish it to the world.

Theme Customization
===================

Understanding Jekyll Themes
----------------------------

**Theme Components:**

* **Layouts** - Page templates in ``_layouts/``
* **Includes** - Reusable components in ``_includes/``
* **Sass** - Stylesheets in ``_sass/``
* **Assets** - CSS, JavaScript, images in ``assets/``
* **Configuration** - Theme settings in ``_config.yml``

**Theme Types:**

* **Gem-based themes** - Installed as Ruby gems
* **Fork-based themes** - Full theme code in your repository
* **Remote themes** - GitHub-hosted themes

Customizing Stylesheets
------------------------

**Override Theme Styles:**

Create ``assets/css/main.scss`` to customize theme styles::

    ---
    # Front matter required
    ---

    @import "{{ site.theme }}";

    /* Custom styles */
    .custom-header {
        background-color: #2c3e50;
        color: white;
        padding: 20px;
    }

    .highlight-box {
        background-color: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 15px;
        margin: 20px 0;
    }

**Sass Variables:**

Override theme variables by defining them before the import::

    ---
    ---

    // Custom color scheme
    $primary-color: #3498db;
    $secondary-color: #2ecc71;
    $text-color: #2c3e50;
    $background-color: #ecf0f1;

    @import "{{ site.theme }}";

Layout Customization
--------------------

**Override Default Layouts:**

Create custom layouts in ``_layouts/`` directory:

.. code-block:: html

    <!-- _layouts/custom-post.html -->
    ---
    layout: default
    ---

    <article class="custom-post">
        <header class="post-header">
            <h1 class="post-title">{% raw %}{{ page.title }}{% endraw %}</h1>
            <time class="post-date">{% raw %}{{ page.date | date: "%B %d, %Y" }}{% endraw %}</time>
        </header>

        <div class="post-content">
            {% raw %}{{ content }}{% endraw %}
        </div>

        <footer class="post-footer">
            <div class="post-tags">
                {% raw %}{% for tag in page.tags %}{% endraw %}
                    <span class="tag">{% raw %}{{ tag }}{% endraw %}</span>
                {% raw %}{% endfor %}{% endraw %}
            </div>
        </footer>
    </article>

**Custom Includes:**

Create reusable components in ``_includes/``:

.. code-block:: html

    <!-- _includes/custom-navigation.html -->
    <nav class="custom-nav">
        <ul>
            <li><a href="{% raw %}{{ '/' | relative_url }}{% endraw %}">Home</a></li>
            <li><a href="{% raw %}{{ '/about' | relative_url }}{% endraw %}">About</a></li>
            <li><a href="{% raw %}{{ '/posts' | relative_url }}{% endraw %}">Posts</a></li>
            <li><a href="{% raw %}{{ '/contact' | relative_url }}{% endraw %}">Contact</a></li>
        </ul>
    </nav>

Asset Management
================

Static Assets Organization
--------------------------

**Recommended Directory Structure:**

::

    assets/
    ├── css/
    │   ├── main.scss
    │   └── custom.scss
    ├── js/
    │   ├── main.js
    │   └── custom.js
    ├── images/
    │   ├── site/
    │   │   ├── logo.png
    │   │   └── banner.jpg
    │   └── posts/
    │       ├── 2025-09-01/
    │       └── 2025-09-02/
    └── fonts/
        ├── custom-font.woff2
        └── custom-font.woff

**Asset URL Configuration:**

Configure CDN or asset paths in ``_config.yml``::

    # Asset configuration
    cdn: https://cdn.example.com

    # Or for relative paths
    baseurl: "/my-site"

JavaScript Integration
----------------------

**Custom JavaScript:**

Create ``assets/js/main.js`` for site functionality::

    // Custom site functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navigation = document.querySelector('.navigation');

        if (menuToggle && navigation) {
            menuToggle.addEventListener('click', function() {
                navigation.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    });

**Include JavaScript in Layout:**

::

    <!-- In _layouts/default.html -->
    <script src="{{ '/assets/js/main.js' | relative_url }}"></script>

Favicon Customization
=====================

Creating Custom Favicons
-------------------------

**Favicon Requirements:**

Modern websites need multiple favicon formats and sizes for different devices and contexts.

**Required Favicon Files:**

::

    assets/img/favicons/
    ├── android-chrome-192x192.png    # Android Chrome (192x192)
    ├── android-chrome-512x512.png    # Android Chrome (512x512)
    ├── apple-touch-icon.png          # iOS Safari (180x180)
    ├── favicon-16x16.png             # Browser tab (16x16)
    ├── favicon-32x32.png             # Browser tab (32x32)
    ├── favicon.ico                   # Legacy browsers (multi-size)
    ├── mstile-150x150.png            # Windows tiles (150x150)
    ├── browserconfig.xml             # Windows tile config
    └── site.webmanifest              # Web app manifest

Favicon Generation Process
--------------------------

**Step 1: Prepare Source Image**

* **Format:** PNG, JPG, or SVG
* **Size:** 512x512 pixels minimum
* **Design:** Simple, recognizable at small sizes
* **Colors:** Work well at different sizes

**Step 2: Generate Favicon Set**

Use online tools like Real Favicon Generator:

1. Upload your source image
2. Configure platform-specific settings
3. Generate and download favicon package
4. Extract files to ``assets/img/favicons/``

**Step 3: Configure Favicon Files**

**browserconfig.xml:**

.. code-block:: xml

   <?xml version="1.0" encoding="utf-8"?>
   <browserconfig>
       <msapplication>
           <tile>
               <square150x150logo src="/assets/img/favicons/mstile-150x150.png"/>
               <TileColor>#2d89ef</TileColor>
           </tile>
       </msapplication>
   </browserconfig>

**site.webmanifest:**

.. code-block:: json

   {
       "name": "Your Site Name",
       "short_name": "Site",
       "icons": [
           {
               "src": "/assets/img/favicons/android-chrome-192x192.png",
               "sizes": "192x192",
               "type": "image/png"
           },
           {
               "src": "/assets/img/favicons/android-chrome-512x512.png",
               "sizes": "512x512",
               "type": "image/png"
           }
       ],
       "theme_color": "#ffffff",
       "background_color": "#ffffff",
       "display": "standalone"
   }

**Step 4: Update HTML Head**

Include favicon links in your site's ``<head>`` section:

.. code-block:: html

    <!-- In _includes/head.html or _layouts/default.html -->
    <link rel="apple-touch-icon" sizes="180x180" href="{% raw %}{{ '/assets/img/favicons/apple-touch-icon.png' | relative_url }}{% endraw %}">
    <link rel="icon" type="image/png" sizes="32x32" href="{% raw %}{{ '/assets/img/favicons/favicon-32x32.png' | relative_url }}{% endraw %}">
    <link rel="icon" type="image/png" sizes="16x16" href="{% raw %}{{ '/assets/img/favicons/favicon-16x16.png' | relative_url }}{% endraw %}">
    <link rel="manifest" href="{% raw %}{{ '/assets/img/favicons/site.webmanifest' | relative_url }}{% endraw %}">
    <link rel="shortcut icon" href="{% raw %}{{ '/assets/img/favicons/favicon.ico' | relative_url }}{% endraw %}">

Configuration and Settings
==========================

Site Configuration
------------------

**Essential _config.yml Settings:**

.. code-block:: yaml

   # Site settings
   title: Your Site Title
   description: A compelling description of your site
   url: "https://yourdomain.com"
   baseurl: ""  # For subdirectory sites: "/subdirectory"

   # Author information
   author:
     name: Your Name
     email: your@email.com

   # Social media
   social:
     github: your-username
     twitter: your-username
     linkedin: your-username

   # Build settings
   markdown: kramdown
   highlighter: rouge
   timezone: Your/Timezone

   # Plugins
   plugins:
     - jekyll-feed
     - jekyll-sitemap
     - jekyll-seo-tag

   # Collections (if used)
   collections:
     projects:
       output: true
       permalink: /:collection/:name/

**Performance Settings:**

.. code-block:: yaml

   # Exclude from processing
   exclude:
     - README.md
     - Gemfile
     - Gemfile.lock
     - node_modules
     - vendor

   # Sass configuration
   sass:
     style: compressed
     sass_dir: _sass

   # Compression
   compress_html:
     clippings: all
     comments: all
     endings: all

Custom Data Files
-----------------

**Site Data in _data/ Directory:**

Create ``_data/navigation.yml``::

    main:
      - title: "Home"
        url: "/"
      - title: "About"
        url: "/about/"
      - title: "Posts"
        url: "/posts/"
      - title: "Projects"
        url: "/projects/"
      - title: "Contact"
        url: "/contact/"

**Use in Templates:**

.. code-block:: html

    <!-- _includes/navigation.html -->
    <nav>
        <ul>
        {% raw %}{% for item in site.data.navigation.main %}{% endraw %}
            <li><a href="{% raw %}{{ item.url | relative_url }}{% endraw %}">{% raw %}{{ item.title }}{% endraw %}</a></li>
        {% raw %}{% endfor %}{% endraw %}
        </ul>
    </nav>

Deployment Strategies
=====================

GitHub Pages Deployment
------------------------

**Automatic Deployment with GitHub Actions:**

**Prerequisites:**

* Repository on GitHub
* GitHub Pages enabled
* Proper ``_config.yml`` configuration

**Setup Steps:**

1. **Configure Repository Settings:**

   * Go to repository Settings → Pages
   * Set source to "GitHub Actions"
   * Configure custom domain if needed

2. **Verify Build Configuration:**

   .. code-block:: yaml

      # _config.yml
      url: "https://username.github.io"
      baseurl: "/repository-name"  # For project sites

3. **Push Changes:**

   ::

       git add .
       git commit -m "Deploy site updates"
       git push origin main

**GitHub Actions Workflow:**

GitHub automatically creates a workflow for Jekyll sites. You can customize it in ``.github/workflows/jekyll.yml``::

    name: Deploy Jekyll site to Pages

    on:
      push:
        branches: ["main"]
      workflow_dispatch:

    permissions:
      contents: read
      pages: write
      id-token: write

    concurrency:
      group: "pages"
      cancel-in-progress: false

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v4
          - name: Setup Ruby
            uses: ruby/setup-ruby@v1
            with:
              ruby-version: '3.1'
              bundler-cache: true
          - name: Setup Pages
            uses: actions/configure-pages@v4
          - name: Build with Jekyll
            run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
            env:
              JEKYLL_ENV: production
          - name: Upload artifact
            uses: actions/upload-pages-artifact@v3

      deploy:
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        needs: build
        steps:
          - name: Deploy to GitHub Pages
            uses: actions/deploy-pages@v4

Alternative Deployment Options
------------------------------

**Netlify Deployment:**

1. **Connect Repository:**

   * Link GitHub repository to Netlify
   * Configure build settings
   * Set environment variables

2. **Build Configuration:**

   Create ``netlify.toml``::

       [build]
         command = "bundle exec jekyll build"
         publish = "_site"

       [build.environment]
         JEKYLL_ENV = "production"

**Self-Hosted Deployment:**

**Build Locally:**

::

    # Build for production
    JEKYLL_ENV=production bundle exec jekyll build

    # Upload to server
    rsync -av _site/ user@server:/var/www/html/

**Server Configuration:**

Configure web server (Apache/Nginx) to serve static files from the upload directory.

Custom Domain Setup
===================

Domain Configuration
--------------------

**GitHub Pages with Custom Domain:**

1. **Add CNAME File:**

   Create ``CNAME`` in repository root::

       yourdomain.com

2. **Configure DNS:**

   * **A Records:** Point to GitHub Pages IPs
   * **CNAME Record:** Point www subdomain to username.github.io

3. **Update Configuration:**

   .. code-block:: yaml

      # _config.yml
      url: "https://yourdomain.com"
      baseurl: ""

**SSL Certificate:**

GitHub Pages automatically provides SSL certificates for custom domains.

Performance Optimization
========================

Site Performance
----------------

**Image Optimization:**

* **Compress images** before uploading
* **Use appropriate formats** (WebP when supported)
* **Implement lazy loading** for below-fold images
* **Specify image dimensions** to prevent layout shift

**CSS and JavaScript:**

.. code-block:: yaml

   # _config.yml
   sass:
     style: compressed

   # Minify HTML
   compress_html:
     clippings: all
     comments: all
     endings: all

**Caching Strategy:**

Configure proper cache headers for static assets::

    # .htaccess for Apache
    <IfModule mod_expires.c>
        ExpiresActive on
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType image/png "access plus 1 year"
        ExpiresByType image/jpg "access plus 1 year"
        ExpiresByType image/jpeg "access plus 1 year"
    </IfModule>

SEO Optimization
----------------

**Essential SEO Configuration:**

.. code-block:: yaml

   # _config.yml
   plugins:
     - jekyll-seo-tag
     - jekyll-sitemap
     - jekyll-feed

   # SEO settings
   title: Your Site Title
   description: A compelling site description
   author: Your Name
   twitter:
     username: your_twitter
     card: summary_large_image

   # Social media defaults
   defaults:
     - scope:
         path: ""
         type: "posts"
       values:
         layout: "post"
         author: "Your Name"

**Per-Page SEO:**

::

    ---
    title: "Specific Page Title"
    description: "Specific page description for search engines"
    image: /assets/images/page-social-image.jpg
    ---

Maintenance and Updates
=======================

Regular Maintenance Tasks
-------------------------

**Dependency Updates:**

::

    # Update Ruby gems
    bundle update

    # Check for security vulnerabilities
    bundle audit

**Content Maintenance:**

* **Review old posts** for outdated information
* **Update broken links** regularly
* **Optimize images** and assets periodically
* **Monitor site performance** and loading times

**Backup Strategy:**

* **Source code** - Version controlled in Git
* **Generated site** - Can be regenerated from source
* **Custom assets** - Backup important media files
* **Configuration** - Document custom settings

Deployment Quick Fixes
======================

GitHub Pages Issues
-------------------

**Build Failed:**

::

    # Check Actions tab in GitHub repository
    # Look for specific error messages

    # Common fix - update platform
    bundle lock --add-platform x86_64-linux
    git add Gemfile.lock && git commit -m "Add Linux platform" && git push

**Assets Not Loading (404 errors):**

::

    # Check _config.yml
    baseurl: "/repository-name"  # For project sites
    baseurl: ""                  # For user sites (username.github.io)

    # Test production build locally
    JEKYLL_ENV=production bundle exec jekyll build

**Custom Domain Not Working:**

::

    # Check CNAME file contains only domain name
    echo "yourdomain.com" > CNAME

    # Check DNS (wait 24-48 hours for propagation)
    nslookup yourdomain.com

Local vs Production Differences
-------------------------------

**Test Production Build Locally:**

::

    # Build like GitHub Pages does
    JEKYLL_ENV=production bundle exec jekyll build --trace

    # Serve production build
    cd _site && python -m http.server 8000

**Environment-Specific Config:**

::

    # _config.yml (base)
    url: "http://localhost:4000"

    # _config_production.yml (override)
    url: "https://yourdomain.com"

    # Build with both configs
    bundle exec jekyll build --config _config.yml,_config_production.yml

Quick Deployment Workflow
==========================

**Standard GitHub Pages:**

1. Push to ``main`` branch
2. Check Actions tab for build status
3. Fix any errors and push again

**Manual Build and Deploy:**

::

    # Build for production
    JEKYLL_ENV=production bundle exec jekyll build

    # Upload _site/ contents to your server
    rsync -av _site/ user@server:/var/www/html/

**Draft Posts (Don't Deploy):**

::

    # Add to front matter
    published: false

    # Test locally with drafts
    bundle exec jekyll serve --drafts

Performance Quick Wins
======================

**Speed Up Builds:**

::

    # Exclude unnecessary files in _config.yml
    exclude:
      - README.md
      - node_modules
      - .git
      - .github

    # Use incremental builds for development
    bundle exec jekyll serve --incremental

**Optimize Images:**

::

    # Compress before adding to repo
    mogrify -resize 1200x1200> -quality 85 assets/images/*.jpg

**Check Build Performance:**

::

    # Time your builds
    time bundle exec jekyll build

    # Profile slow builds
    bundle exec jekyll build --profile

Security Essentials
===================

**Dependency Updates:**

::

    # Check for vulnerabilities
    bundle audit

    # Update gems
    bundle update

    # Commit updated Gemfile.lock
    git add Gemfile.lock && git commit -m "Update dependencies"

**Never Commit Secrets:**

- API keys, passwords, tokens
- Use environment variables instead
- Check ``.gitignore`` includes sensitive files

**Content Security:**

- Review any user-contributed content
- Keep Jekyll and plugins updated
- Use HTTPS for custom domains
