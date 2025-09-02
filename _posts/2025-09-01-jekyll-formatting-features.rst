---
layout: post
title: "Jekyll Advanced Formatting: Typography, Media, and Special Features"
date: 2025-09-01 13:00:00 +0530
categories: [jekyll, formatting, features]
tags: [typography, markdown, rst, media, mathematics, mermaid, formatting]
math: true
mermaid: true
---

Jekyll Advanced Formatting: Typography, Media, and Special Features
===================================================================

This comprehensive guide covers Jekyll's advanced formatting capabilities, from typography and text styling to media integration, mathematical equations, and interactive diagrams. Master these features to create rich, engaging content.

Typography and Text Formatting
===============================

Header Hierarchy
-----------------

**RST Header Styles:**

::

    Main Title
    ==========

    Major Section
    =============

    Section
    -------

    Subsection
    ~~~~~~~~~~

    Minor Section
    ^^^^^^^^^^^^^

**Best Practices:**

* **Consistent hierarchy** - Don't skip levels
* **Descriptive titles** - Clear, scannable headers
* **Logical organization** - Group related content
* **SEO-friendly** - Headers help search engines understand structure

Text Styling Options
--------------------

**Basic Text Formatting:**

* **Bold text** - ``**bold text**`` or ``**emphasis**``
* *Italic text* - ``*italic text*`` or ``*emphasis*``
* ``Inline code`` - ```inline code``` for technical terms
* **Combined** - ``***bold and italic***``

**Special Text Elements:**

**Filepath Highlighting:**
Use for file and directory references: ``/path/to/file.txt``

**Keyboard Keys:**
Reference keyboard shortcuts and keys appropriately

**Technical Terms:**
Use inline code formatting for: ``variables``, ``functions``, ``commands``

Lists and Organization
======================

List Types
----------

**Ordered Lists:**

1. First item
2. Second item
3. Third item
   
   a. Nested sub-item
   b. Another sub-item

4. Fourth item

**Unordered Lists:**

* Main point
  
  * Sub-point
  * Another sub-point
    
    * Deeply nested point

* Another main point

**Task Lists:**

- [x] Completed task
- [x] Another completed task
- [ ] Pending task
- [ ] Future task

**Description Lists:**

Term 1
    Definition of the first term

Term 2
    Definition of the second term with more detailed explanation
    that spans multiple lines

Complex List Examples
---------------------

**Nested Mixed Lists:**

1. **Setup Phase**
   
   * Install dependencies
   * Configure environment
   * Test installation

2. **Development Phase**
   
   * Write code
   * Test functionality
   * Document changes

3. **Deployment Phase**
   
   * Build production version
   * Deploy to server
   * Monitor performance

Block Elements
==============

Blockquotes
-----------

**Basic Blockquotes:**

    This is a standard blockquote that can be used for
    citations, important notes, or highlighted information.

**Nested Blockquotes:**

    This is the first level of quotation.
    
        This is a nested quotation within the first level.
        
    Back to the first level.

**Attribution:**

    "The best way to predict the future is to invent it."
    
    — Alan Kay

Prompt Boxes (Theme-Specific)
-----------------------------

Many Jekyll themes support special prompt boxes for different types of information:

**Information Prompts:**

.. note::
   This is an informational note that provides helpful context
   or additional information about the topic.

**Warning Prompts:**

.. warning::
   This is a warning about potential issues or things to be
   careful about when following instructions.

**Tip Prompts:**

.. tip::
   This is a helpful tip that can make the process easier
   or more efficient for readers.

Code and Technical Content
==========================

Inline Code
-----------

Use backticks for inline code: ``variable_name``, ``function()``, ``command --option``

**When to Use Inline Code:**

* Variable names and values
* Function and method names
* Command line commands
* File and directory names
* Technical terminology

Code Blocks
-----------

**Basic Code Blocks:**

::

    This is a plain text code block
    without syntax highlighting.
    Useful for output examples or generic text.

**Language-Specific Highlighting:**

.. code-block:: python

   def fibonacci(n):
       if n <= 1:
           return n
       return fibonacci(n-1) + fibonacci(n-2)
   
   # Generate first 10 Fibonacci numbers
   for i in range(10):
       print(f"F({i}) = {fibonacci(i)}")

.. code-block:: bash

   # System update and package installation
   sudo apt update && sudo apt upgrade -y
   
   # Install development tools
   sudo apt install build-essential git curl -y
   
   # Check installation
   gcc --version

.. code-block:: javascript

   // Modern JavaScript example with async/await
   async function fetchUserData(userId) {
       try {
           const response = await fetch(`/api/users/${userId}`);
           const userData = await response.json();
           return userData;
       } catch (error) {
           console.error('Error fetching user data:', error);
           throw error;
       }
   }

**Code Block Features:**

* **Syntax highlighting** - Automatic language detection
* **Line numbers** - Optional line numbering
* **Copy functionality** - Easy code copying
* **Filename labels** - Show source file names

Tables and Data
===============

Basic Tables
------------

**Simple Table Structure:**

+---------------------------+------------------+-----------+
| Company                   | Contact          | Country   |
+===========================+==================+===========+
| Alfreds Futterkiste       | Maria Anders     | Germany   |
+---------------------------+------------------+-----------+
| Island Trading            | Helen Bennett    | UK        |
+---------------------------+------------------+-----------+
| Magazzini Alimentari      | Giovanni Rovelli | Italy     |
+---------------------------+------------------+-----------+

**Alignment Options:**

+-----------------+:----------------:+----------------:+
| Left Aligned    | Center Aligned   | Right Aligned  |
+=================+==================+================+
| Content         | Content          |        Content |
+-----------------+------------------+----------------+
| More content    | More content     |   More content |
+-----------------+------------------+----------------+

Complex Tables
--------------

**Tables with Code and Links:**

+------------------+-------------------------+------------------+
| Tool             | Command                 | Purpose          |
+==================+=========================+==================+
| Jekyll           | ``bundle exec jekyll    | Build static     |
|                  | serve``                 | site             |
+------------------+-------------------------+------------------+
| Git              | ``git commit -m         | Version control  |
|                  | "message"``             |                  |
+------------------+-------------------------+------------------+
| NPM              | ``npm install           | Package          |
|                  | package-name``          | management       |
+------------------+-------------------------+------------------+

Mathematics and Equations
==========================

Inline Mathematics
------------------

Mathematical expressions can be included inline: :math:`E = mc^2` or within sentences like :math:`a^2 + b^2 = c^2` for the Pythagorean theorem.

Block Mathematics
-----------------

**Complex Equations:**

.. math::

   \sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}

**Equation with Numbering:**

.. math::
   :label: quadratic

   x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}

The quadratic formula shown in equation :eq:`quadratic` is fundamental in algebra.

**Matrix Examples:**

.. math::

   \begin{pmatrix}
   a & b \\
   c & d
   \end{pmatrix}
   \begin{pmatrix}
   x \\
   y
   \end{pmatrix}
   =
   \begin{pmatrix}
   ax + by \\
   cx + dy
   \end{pmatrix}

**Integration Example:**

.. math::

   \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}

Diagrams and Visualizations
===========================

Mermaid Diagrams
----------------

**Flowcharts:**

.. code-block:: mermaid

   flowchart TD
       A[Start] --> B{Decision}
       B -->|Yes| C[Process A]
       B -->|No| D[Process B]
       C --> E[End]
       D --> E

**Sequence Diagrams:**

.. code-block:: mermaid

   sequenceDiagram
       participant User
       participant Browser
       participant Server
       participant Database
       
       User->>Browser: Enter URL
       Browser->>Server: HTTP Request
       Server->>Database: Query Data
       Database-->>Server: Return Data
       Server-->>Browser: HTTP Response
       Browser-->>User: Display Page

**Gantt Charts:**

.. code-block:: mermaid

   gantt
       title Project Timeline
       dateFormat YYYY-MM-DD
       
       section Planning
       Research          :a1, 2025-09-01, 1w
       Requirements      :a2, after a1, 3d
       
       section Development
       Setup             :b1, after a2, 2d
       Core Features     :b2, after b1, 2w
       Testing          :b3, after b2, 1w
       
       section Deployment
       Production Setup  :c1, after b3, 3d
       Go Live          :c2, after c1, 1d

**Class Diagrams:**

.. code-block:: mermaid

   classDiagram
       class Animal {
           +String name
           +int age
           +makeSound()
           +move()
       }
       
       class Dog {
           +String breed
           +bark()
           +wagTail()
       }
       
       class Cat {
           +String color
           +meow()
           +purr()
       }
       
       Animal <|-- Dog
       Animal <|-- Cat

Media Integration
=================

Images
------

**Basic Image Syntax:**

.. image:: /assets/images/example.jpg
   :alt: Description of the image
   :width: 600
   :height: 400

**Image with Caption:**

.. figure:: /assets/images/screenshot.png
   :alt: Application screenshot
   :width: 800
   
   *Application interface showing the main dashboard with navigation menu*

**Responsive Images:**

Images should be optimized for different screen sizes and loading performance.

**Image Organization:**

::

    assets/
    ├── images/
    │   ├── posts/
    │   │   ├── 2025-09-01/
    │   │   │   ├── diagram.png
    │   │   │   └── screenshot.jpg
    │   │   └── 2025-09-02/
    │   └── site/
    │       ├── logo.png
    │       └── favicon.ico

Links and References
====================

Internal Links
--------------

**Link to Other Posts:**

* `Jekyll Fundamentals Guide <jekyll-fundamentals-setup.html>`_
* `Content Creation Guide <jekyll-content-creation-guide.html>`_

**Link to Sections:**

* `Typography Section <#typography-and-text-formatting>`_
* `Code Blocks <#code-blocks>`_

External Links
--------------

**Resource Links:**

* `Jekyll Documentation <https://jekyllrb.com/docs/>`_
* `Markdown Guide <https://www.markdownguide.org/>`_
* `reStructuredText Primer <https://docutils.sourceforge.io/docs/user/rst/quickref.html>`_

**Reference-Style Links:**

For frequently referenced resources, you can define links at the bottom:

.. _Jekyll: https://jekyllrb.com/
.. _GitHub: https://github.com/
.. _MathJax: https://www.mathjax.org/

Then reference them as: Jekyll_, GitHub_, MathJax_

Footnotes and Citations
-----------------------

**Footnotes:**

This statement needs a citation [#f1]_.

Additional information with another footnote [#f2]_.

.. rubric:: Footnotes

.. [#f1] Source: Jekyll Documentation, https://jekyllrb.com/docs/
.. [#f2] Additional reference: GitHub Pages Guide

Advanced Features
=================

Custom HTML Integration
-----------------------

When Markdown or RST limitations are reached, custom HTML can be embedded:

.. raw:: html

   <div class="custom-container">
       <h3>Custom HTML Section</h3>
       <p>This content uses custom HTML for specific styling needs.</p>
   </div>

Interactive Elements
--------------------

**Collapsible Sections:**

.. raw:: html

   <details>
   <summary>Click to expand</summary>
   <p>This content is hidden by default and revealed when clicked.</p>
   </details>

**Embedded Content:**

.. raw:: html

   <div class="video-container">
       <iframe width="560" height="315" 
               src="https://www.youtube.com/embed/VIDEO_ID" 
               frameborder="0" allowfullscreen>
       </iframe>
   </div>

Performance and Accessibility
=============================

Optimization Guidelines
-----------------------

**Image Optimization:**

* **Compress images** before uploading
* **Use appropriate formats** - JPEG for photos, PNG for graphics
* **Specify dimensions** to prevent layout shift
* **Add alt text** for accessibility

**Content Performance:**

* **Minimize large code blocks** - Use external files when needed
* **Optimize tables** - Keep data manageable
* **Use lazy loading** for images below the fold

Accessibility Best Practices
-----------------------------

**Text Accessibility:**

* **Sufficient color contrast** for readability
* **Descriptive link text** - avoid "click here"
* **Proper heading hierarchy** - don't skip levels
* **Alt text for images** - describe content and function

**Navigation Aids:**

* **Table of contents** for long posts
* **Skip links** for keyboard navigation
* **Descriptive page titles** and meta descriptions

This comprehensive guide covers Jekyll's advanced formatting capabilities. Use these features strategically to create engaging, accessible, and professional content that serves your readers effectively.
