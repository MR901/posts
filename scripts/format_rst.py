#!/usr/bin/env python3
"""
Minimal RST formatting script.

Applies only essential fixes that improve consistency without being overly prescriptive.
Most RST warnings are handled gracefully by the preprocessing in transform.py.

Philosophy:
- Trust the docutils preprocessing
- Fix only what improves consistency or prevents rare issues
- Accept that warnings are normal and harmless
- Focus on content, not cosmetic perfection
"""

import sys
from pathlib import Path


def standardize_headings(content: str) -> tuple[str, int]:
    """
    Standardize heading underlines to match title length.
    This prevents "Title underline too short" warnings.

    Hierarchy (already enforced by our content):
    - === for main title
    - --- for sections
    - ~~~ for subsections
    """
    lines = content.split('\n')
    result = []
    fixes = 0
    i = 0

    while i < len(lines):
        # Check if next line is an underline
        if i + 1 < len(lines):
            line = lines[i]
            next_line = lines[i + 1]

            # Detect underline pattern
            if next_line.strip() and len(set(next_line.strip())) == 1:
                char = next_line.strip()[0]
                if char in '=-~^"\'*+#<>_':
                    # This is a heading - ensure underline matches title length
                    title = line.rstrip()
                    title_len = len(title)
                    current_len = len(next_line.strip())

                    if current_len != title_len:
                        result.append(title)
                        result.append(char * title_len)
                        fixes += 1
                        i += 2
                        continue

        result.append(lines[i])
        i += 1

    return '\n'.join(result), fixes


def ensure_frontmatter_closing(content: str) -> tuple[str, int]:
    """
    Ensure YAML front matter has proper closing fence.
    This is the only critical front matter fix - without it, Jekyll fails.
    """
    lines = content.split('\n')

    # Check if file starts with front matter
    if not lines or lines[0].strip() != '---':
        return content, 0

    # Check if proper closing '---' exists
    for i in range(1, min(50, len(lines))):
        if lines[i].strip() == '---':
            return content, 0  # Already good

    # Find first dash-only line and convert to proper closing
    for i in range(1, min(30, len(lines))):
        line = lines[i].strip()
        if len(line) >= 3 and set(line) == {'-'}:
            lines[i] = '---'

            # Ensure blank line after closing fence
            if i + 1 < len(lines) and lines[i + 1].strip():
                lines.insert(i + 1, '')

            return '\n'.join(lines), 1

    return content, 0


def format_file(filepath: Path) -> dict:
    """
    Format a single RST file with minimal essential fixes.
    Returns dict with results.
    """
    try:
        content = filepath.read_text(encoding='utf-8')
        original = content
        total_fixes = 0

        # Apply minimal fixes
        content, heading_fixes = standardize_headings(content)
        total_fixes += heading_fixes

        content, frontmatter_fixes = ensure_frontmatter_closing(content)
        total_fixes += frontmatter_fixes

        # Only write if changes were made
        if content != original:
            filepath.write_text(content, encoding='utf-8')
            return {
                'status': 'modified',
                'fixes': total_fixes,
                'heading_fixes': heading_fixes,
                'frontmatter_fixes': frontmatter_fixes
            }
        else:
            return {'status': 'unchanged', 'fixes': 0}

    except Exception as e:
        return {'status': 'error', 'error': str(e)}


def main():
    """Main entry point."""
    posts_dir = Path(__file__).parent.parent / '_posts'

    if not posts_dir.exists():
        print(f"Error: {posts_dir} not found", file=sys.stderr)
        return 1

    rst_files = sorted(posts_dir.glob('*.rst'))

    if not rst_files:
        print(f"No RST files found in {posts_dir}", file=sys.stderr)
        return 1

    print(f"Formatting {len(rst_files)} RST files...\n")

    modified_count = 0
    error_count = 0
    total_fixes = 0

    for rst_file in rst_files:
        result = format_file(rst_file)

        if result['status'] == 'modified':
            modified_count += 1
            total_fixes += result['fixes']
            print(f"✓ {rst_file.name}: {result['fixes']} fixes applied")
        elif result['status'] == 'error':
            error_count += 1
            print(f"✗ {rst_file.name}: Error - {result['error']}", file=sys.stderr)
        else:
            print(f"  {rst_file.name}: No changes needed")

    print(f"\n{'='*60}")
    print(f"Summary: {modified_count}/{len(rst_files)} files modified, {total_fixes} total fixes")
    if error_count:
        print(f"Errors: {error_count} files had errors")
    print(f"{'='*60}")

    return 1 if error_count > 0 else 0


if __name__ == '__main__':
    sys.exit(main())

