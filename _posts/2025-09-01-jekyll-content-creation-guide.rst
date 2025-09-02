---
layout: post
title: "Jekyll Content Creation: Writing Posts and Pages"
date: 2025-09-01 00:00:00 +0530
categories: [jekyll, content, writing]
tags: [jekyll, content-creation]
pin: false
toc: true
comments: false
math: false
mermaid: false
description: "This post covers everything you need to know about creating content in Jekyll, from basic post structure to advanced content organization and front matter configuration."
author: "Mohit Rajput"
image:
  path: https://jekyllrb.com/img/logo-2x.png
  alt: "Jekyll Content Creation: Writing Posts and Pages"
.. media_subpath: '/assets/images/2025-09-01/'
---

Jekyll Content Creation: Writing Posts and Pages
=================================================

This comprehensive guide covers everything you need to know about creating content in Jekyll, from basic post structure to advanced content organization and front matter configuration.

Understanding Jekyll Content
============================

Content Types in Jekyll
------------------------

**Posts:**
- Time-based content (blog posts, articles, news)
- Located in ``_posts/`` directory
- Automatically organized by date
- Include in site feeds and archives

**Pages:**
- Static content (about, contact, documentation)
- Located in root or organized directories
- Permanent URLs
- Not included in post listings

**Collections:**
- Custom content types (projects, products, team members)
- Organized in custom directories
- Flexible organization and display

File Naming and Organization
============================

Post Naming Convention
----------------------

**Required Format:** ``YYYY-MM-DD-title.EXTENSION``

**Examples:**

::

    2025-09-01-getting-started-with-jekyll.md
    2025-09-01-advanced-markdown-techniques.rst
    2025-09-02-project-showcase.markdown

**Key Points:**

* **Date is mandatory** - determines post order and URL
* **Title becomes URL slug** - use hyphens, not spaces
* **Extension matters** - ``.md``, ``.markdown``, or ``.rst``
* **Case sensitive** - use lowercase for consistency

Directory Structure
-------------------

**Recommended Organization:**

::

    _posts/
    ├── 2025-09-01-post-one.md
    ├── 2025-09-01-post-two.rst
    └── 2025-09-02-post-three.md

    assets/
    ├── images/
    │   ├── 2025-09-01/
    │   └── 2025-09-02/
    └── attachments/
        ├── pdfs/
        └── documents/

Front Matter Essentials
=======================

Basic Front Matter Structure
-----------------------------

Front matter is YAML configuration at the top of each file::

    ---
    title: "Your Post Title"
    date: 2025-09-01 12:00:00 +0530
    categories: [Category1, Category2]
    tags: [tag1, tag2, tag3]
    ---

**Required Fields:**

* ``title`` - Post title (can include quotes for special characters)
* ``date`` - Publication date with timezone

**Common Optional Fields:**

* ``categories`` - Up to 2 hierarchical categories
* ``tags`` - Unlimited tags for content classification
* ``description`` - Custom excerpt for SEO and previews
* ``author`` - Override default author information

Advanced Front Matter Options
------------------------------

**Content Control:**

::

    ---
    layout: post              # Override default layout
    toc: false               # Disable table of contents
    comments: false          # Disable comments
    pin: true                # Pin to top of home page
    math: true               # Enable MathJax
    mermaid: true            # Enable Mermaid diagrams
    ---

**SEO and Social:**

::

    ---
    description: "Custom description for search engines"
    image:
      path: /assets/images/post-preview.jpg
      alt: "Image description"
    ---

**Media Configuration:**

::

    ---
    media_subpath: '/assets/images/2025-09-01/'
    ---

Categories and Tags Strategy
============================

Organizing with Categories
--------------------------

**Best Practices:**

* **Maximum 2 levels** - ``[Parent, Child]``
* **Broad classification** - Think of categories as folders
* **Consistent naming** - Use title case
* **Logical hierarchy** - Parent should contain child topics

**Examples:**

::

    categories: [Technology, Web Development]
    categories: [Tutorial, Jekyll]
    categories: [Project, Machine Learning]

Effective Tagging
-----------------

**Tag Guidelines:**

* **Always lowercase** - Consistent formatting
* **Specific topics** - More granular than categories
* **No limit** - Use as many as relevant
* **Think searchability** - What would readers search for?

**Examples:**

::

    tags: [javascript, react, tutorial, beginner]
    tags: [machine-learning, python, tensorflow, neural-networks]
    tags: [jekyll, static-sites, github-pages, deployment]

Author Information Management
=============================

Default Author Setup
---------------------

Configure default author in ``_config.yml``::

    # Site author
    social:
      name: Your Full Name
      email: your@email.com
      links:
        - https://github.com/username
        - https://twitter.com/username

Custom Author Configuration
---------------------------

Create ``_data/authors.yml`` for multiple authors::

    john_doe:
      name: John Doe
      twitter: johndoe
      url: https://johndoe.com

    jane_smith:
      name: Jane Smith
      twitter: janesmith
      url: https://janesmith.com

**Using in Posts:**

::

    ---
    author: john_doe              # Single author
    authors: [john_doe, jane_smith]  # Multiple authors
    ---

Content Writing Best Practices
==============================

Post Structure
--------------

**Effective Post Organization:**

1. **Compelling Title** - Clear, descriptive, SEO-friendly
2. **Introduction** - Hook readers, explain what they'll learn
3. **Main Content** - Organized with headers and subheaders
4. **Code Examples** - Practical, working examples
5. **Conclusion** - Summarize key points, next steps
6. **References** - Links to additional resources

**Header Hierarchy:**

::

    Post Title (H1 - automatic)
    ============

    Major Section (H2)
    ==================

    Subsection (H3)
    ---------------

    Minor Section (H4)
    ~~~~~~~~~~~~~~~~~~

Writing Engaging Content
------------------------

**Content Guidelines:**

* **Clear language** - Write for your target audience
* **Scannable format** - Use headers, lists, code blocks
* **Practical examples** - Show, don't just tell
* **Consistent tone** - Match your site's voice
* **Value-focused** - What will readers gain?

**Markdown/RST Tips:**

* Use **bold** for emphasis, *italics* for subtle emphasis
* Create lists for easy scanning
* Include code blocks with syntax highlighting
* Add links to relevant resources
* Use blockquotes for important notes

Content Organization Strategies
===============================

Series and Related Posts
-------------------------

**Creating Post Series:**

1. **Consistent naming:** "Series Name: Part 1"
2. **Cross-linking:** Link to previous/next posts
3. **Series index:** Create a landing page
4. **Consistent tags:** Use series-specific tags

**Example Series Structure:**

::

    2025-09-01-jekyll-guide-part-1-setup.md
    2025-09-02-jekyll-guide-part-2-content.md
    2025-09-03-jekyll-guide-part-3-deployment.md

Content Calendar
----------------

**Planning Your Content:**

* **Regular schedule** - Weekly, bi-weekly, or monthly
* **Content themes** - Technical tutorials, project updates, reviews
* **Seasonal relevance** - Timely topics and events
* **Audience needs** - What questions do readers have?

**Content Types to Consider:**

* Tutorial posts
* Project showcases
* Tool reviews
* Industry insights
* Personal experiences
* Resource compilations

Advanced Content Features
=========================

Custom Excerpts
---------------

**Automatic Excerpts:**
Jekyll uses the first paragraph by default

**Custom Excerpts:**
Define exactly what appears in post listings::

    ---
    description: "This custom excerpt will appear in post listings and RSS feeds."
    ---

**Excerpt Separators:**
Use ``<!--more-->`` in content to define excerpt cutoff

Media Integration
-----------------

**Image Best Practices:**

* **Optimize file sizes** - Compress before uploading
* **Descriptive filenames** - ``jekyll-setup-screenshot.png``
* **Alt text** - Always include for accessibility
* **Consistent sizing** - Define width/height attributes

**Asset Organization:**

::

    assets/
    ├── images/
    │   ├── posts/
    │   │   ├── 2025-09-01/
    │   │   └── 2025-09-02/
    │   └── site/
    └── downloads/
        ├── pdfs/
        └── code/

Content Maintenance
===================

Updating Existing Posts
-----------------------

**When to Update:**

* **Outdated information** - Technology changes, new versions
* **Broken links** - Regular link checking
* **Improved explanations** - Better examples, clearer writing
* **SEO improvements** - Better titles, descriptions, tags

**Update Best Practices:**

* **Update the date** if major changes
* **Add update notes** for significant revisions
* **Maintain URL structure** to preserve SEO
* **Check related posts** for consistency

Content Review Process
----------------------

**Regular Maintenance:**

1. **Monthly review** - Check recent posts for errors
2. **Quarterly audit** - Review older posts for updates needed
3. **Annual cleanup** - Remove or update significantly outdated content
4. **Link validation** - Check external links regularly

Quality Checklist
==================

Pre-Publish Checklist
----------------------

**Content Quality:**

- [ ] Title is clear and descriptive
- [ ] Introduction explains post value
- [ ] Content is well-organized with headers
- [ ] Code examples are tested and working
- [ ] Grammar and spelling checked
- [ ] Links are working and relevant

**Technical Setup:**

- [ ] Front matter is complete and accurate
- [ ] Categories and tags are appropriate
- [ ] Images have alt text and proper sizing
- [ ] Post builds without errors
- [ ] Mobile-friendly formatting

**SEO Optimization:**

- [ ] Meta description is compelling
- [ ] Title is SEO-friendly
- [ ] Internal links to related posts
- [ ] External links open appropriately
- [ ] Social sharing image set

Content Performance
===================

Measuring Success
-----------------

**Key Metrics:**

* **Page views** - Overall content popularity
* **Time on page** - Content engagement depth
* **Social shares** - Content virality
* **Comments** - Reader engagement
* **Internal links** - Content discoverability

**Improvement Strategies:**

* **Analyze top posts** - What makes them successful?
* **Update underperforming content** - Improve titles, add examples
* **Create follow-up content** - Expand on popular topics
* **Cross-promote** - Link related posts together

This comprehensive guide provides the foundation for creating engaging, well-organized content in Jekyll. Focus on providing value to your readers while maintaining consistent quality and organization standards.
