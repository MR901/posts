===================================================
RST Formatting Style Guide (Simplified)
===================================================

**Philosophy:** Write naturally, trust the preprocessing, focus on content.

This guide covers only the essential RST patterns that prevent actual build errors. Most formatting issues are handled automatically by our preprocessing or are harmless warnings.

-------------------------------
What You Need to Know
-------------------------------

**Good News:**
- The build system handles most RST edge cases automatically
- Warnings in validation output are normal and don't break builds
- You can write RST naturally without memorizing all the rules

**Focus On:**
- Valid YAML front matter
- Consistent heading hierarchy
- Proper code block syntax
- Not mixing incompatible syntax in the same block

-------------------------------
1. Front Matter (Critical)
-------------------------------

Every RST post **must** have valid YAML front matter or Jekyll will fail:

.. code-block:: yaml

   ---
   layout: post
   title: "Your Post Title"
   date: 2025-10-24 00:00:00 +0530
   categories: [Category1, Category2]
   tags: [tag1, tag2]
   pin: false
   toc: true
   comments: false
   description: "Brief description"
   ---

**Critical Rules:**

- Must start and end with ``---`` (three hyphens exactly)
- Use 2-space indentation for nested fields
- No blank lines inside front matter
- Closing ``---`` must be on its own line
- Leave one blank line after closing ``---``

**The formatting script fixes most front matter issues automatically.**

-------------------------------
2. Main Title
-------------------------------

After front matter, add the main title:

.. code-block:: rst

   ===================================================
   Your Title Here
   ===================================================

**Rules:**

- Use ``=`` for the main title underline
- Underline length should match title length (script fixes this)
- Leave blank lines before content

-------------------------------
3. Heading Hierarchy
-------------------------------

Use consistent underline characters:

.. code-block:: rst

   -------------------------------
   Section Heading
   -------------------------------

   Subsection Heading
   ~~~~~~~~~~~~~~~~~~~

   **Sub-subsection (bold works too)**

**Pattern:**

- ``===`` for main title
- ``---`` for sections
- ``~~~`` for subsections
- ``**bold**`` for minor headings

**Important:** Don't skip levels (e.g., don't go from ``===`` to ``~~~`` without ``---`` in between).

**The formatting script ensures underlines match title lengths.**

-------------------------------
4. Code Blocks
-------------------------------

**Preferred method - code-block directive:**

.. code-block:: python

   def example():
       return "Hello, world!"

**RST syntax:**

.. code-block:: rst

   .. code-block:: python

      def example():
          return "Hello, world!"

**Quick method - literal blocks:**

.. code-block:: rst

   Some text explaining the code::

      quick_code_example()

**Rules:**

- Always leave blank line before ``.. code-block::``
- Indent code by 3+ spaces
- For literal blocks (``::``), also indent code
- Blank lines around code blocks are good

**Inline code:**

.. code-block:: rst

   The ``variable_name`` uses double backticks.

-------------------------------
5. Lists
-------------------------------

**Unordered lists:**

.. code-block:: rst

   - First item
   - Second item
     - Nested item (2-space indent)
   - Third item

**Ordered lists:**

.. code-block:: rst

   1. First step
   2. Second step
   3. Third step

**Rules:**

- Use ``-`` for bullets (preferred) or ``*`` (also works)
- Blank line before first list item helps but isn't required
- Lists ending without blank lines generate warnings (harmless)

-------------------------------
6. Text Formatting & Links
-------------------------------

**Emphasis:**

.. code-block:: rst

   *italic text*
   **bold text**
   ``inline code``

**Links:**

.. code-block:: rst

   Visit the `Python Documentation <https://docs.python.org/>`_

-------------------------------
7. Common Patterns
-------------------------------

**Note boxes:**

.. code-block:: rst

   .. note::
      Important information here.

**Images:**

.. code-block:: rst

   .. image:: /path/to/image.png
      :alt: Description
      :width: 600px

**Math (if math: true in front matter):**

.. code-block:: rst

   Inline: :math:`E = mc^2`

   Block:
   .. math::

      \frac{d}{dx} f(x) = f'(x)

-------------------------------
8. What Warnings Can Be Ignored
-------------------------------

These warnings appear in validation but don't break builds:

**"Block quote ends without a blank line"**
- Cosmetic issue, renders fine
- Happens when lists or code follow text directly

**"Literal block ends without a blank line"**
- Cosmetic issue, renders fine
- Happens with ``::`` syntax

**"Explicit markup ends without a blank line"**
- Cosmetic issue, renders fine
- Happens after directives like ``.. note::``

**"Inline emphasis start-string without end-string"**
- Usually a stray ``*`` or ``_`` character
- Check for underscores in URLs (use links properly)

**Our philosophy:** If the site builds and looks good, the warning is acceptable.

-------------------------------
9. What Actually Breaks Builds
-------------------------------

**These cause SEVERE errors:**

**Malformed tables:**

.. code-block:: rst

   # WRONG - column widths don't match
   +-----+-------+
   | A   | B     |
   +=====+=====+
   | 1   | 2   |
   +-----+-------+

**Solution:** Use consistent column widths or let the preprocessing fix it.

**Unclosed directives:**

.. code-block:: rst

   # WRONG - directive with no content
   .. code-block::

**Solution:** Always provide content or remove the directive.

**Bad nested structures:**

.. code-block:: rst

   # WRONG - inconsistent indentation
   1. Item
     .. code-block:: python
       code()

**Solution:** Use consistent indentation (typically 3 spaces for code in lists).

-------------------------------
10. Practical Workflow
-------------------------------

**When writing:**

1. Write content naturally in RST
2. Don't obsess over warnings
3. Use code blocks and lists freely

**Before committing:**

1. Run ``make rst-format`` to fix heading underlines
2. Run ``make serve`` to preview
3. Check that pages render correctly
4. Commit if everything looks good

**If validation shows errors:**

1. Run ``make rst-validate`` to see ERROR lines
2. Fix only ERROR-level issues (line numbers provided)
3. Ignore WARNING messages unless rendering is broken

**The key insight:** Focus on content, trust the system.

-------------------------------
11. Quick Reference
-------------------------------

**Headings:**

.. code-block:: rst

   ===  Main title
   ---  Section
   ~~~  Subsection
   **   Bold heading

**Code:**

.. code-block:: rst

   ``inline code``

   .. code-block:: language

      block code

   Text::

      literal block

**Lists:**

.. code-block:: rst

   - Bullet list
   1. Numbered list

**Formatting:**

.. code-block:: rst

   *italic*
   **bold**
   `link <url>`_

-------------------------------
12. File Naming
-------------------------------

.. code-block:: text

   YYYY-MM-DD-title-with-dashes.rst

**Examples:**

- ``2025-10-24-understanding-mongodb.rst``
- ``2025-11-04-my-new-post.rst``

-------------------------------
Summary
-------------------------------

**Remember:**

- Valid front matter is critical
- Consistent headings are nice
- Warnings are normal and harmless
- The system handles edge cases
- Focus on writing, not perfecting
- Run ``make rst-format`` before committing
- If it builds and looks good, you're done

**When in doubt:** Write RST naturally, let the preprocessing handle the rest.

===================================================
End of Style Guide
===================================================
