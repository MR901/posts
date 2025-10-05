import sys
import re
from docutils.core import publish_parts
from optparse import OptionParser
from docutils.frontend import OptionParser as DocutilsOptionParser
from docutils.parsers.rst import Parser


def _assign_section_ids_to_headings(html: str) -> str:
    """
    Docutils (for RST) puts the anchor ID on the surrounding div.section, e.g.:
      <div class="section" id="my-heading-slug">
        <h2>My Heading</h2>
        ...
    The theme's TOC (tocbot) expects the ID on the heading itself. This post-processor
    copies the div.section id onto the first heading tag inside the section if the
    heading does not already have an id.
    """
    # Pattern to find the opening of a section with an id
    section_open_pat = re.compile(r'<div\s+class="section"\s+id="([^"]+)">', re.IGNORECASE)

    result_parts = []
    pos = 0

    for m in section_open_pat.finditer(html):
        div_id = m.group(1)
        div_end = m.end()

        # Append everything up to and including the <div ...> we just matched
        result_parts.append(html[pos:div_end])

        # From here, try to match optional whitespace then an opening heading tag
        # that does not already contain an id attribute
        after = html[div_end:]
        heading_match = re.match(r'(\s*)<(h[1-6])([^>]*)>', after, re.IGNORECASE)

        if heading_match:
            attrs = heading_match.group(3)
            # If heading already has an id, leave as-is
            if re.search(r'\bid\s*=',''.join(attrs), re.IGNORECASE):
                # Append the original opening heading tag unchanged
                result_parts.append(heading_match.group(0))
            else:
                # Inject the id from the parent section onto the heading
                leading_ws = heading_match.group(1)
                tag = heading_match.group(2)
                new_open = f"{leading_ws}<{tag}{attrs} id=\"{div_id}\">"
                result_parts.append(new_open)

            # Advance the cursor past the heading opening tag we processed
            pos = div_end + len(heading_match.group(0))
        else:
            # No immediate heading; just continue scanning from the end of this div
            pos = div_end

    # Append the remaining tail
    result_parts.append(html[pos:])

    return ''.join(result_parts)

def _convert_markdown_tables_to_grid(rst_text: str) -> str:
    """
    Convert simple Markdown pipe tables into reStructuredText grid tables.

    This allows authors to write Markdown-style tables in `.rst` files without
    changing content, while keeping docutils satisfied.
    """
    lines = rst_text.splitlines()

    def is_md_table_border(line: str) -> bool:
        # Matches header separator like: | --- | :---: | ---- |
        if not line.strip().startswith('|') or not line.strip().endswith('|'):
            return False
        segments = [seg.strip() for seg in line.strip().split('|')[1:-1]]
        if not segments:
            return False
        for seg in segments:
            # Allow sequences of dashes with optional leading/trailing colons
            core = seg.replace(':', '')
            if len(core) < 3 or not set(core) <= {'-'}:
                return False
        return True

    def is_md_table_row(line: str) -> bool:
        s = line.strip()
        return s.startswith('|') and s.endswith('|') and ('|' in s[1:-1])

    def parse_row(line: str) -> list:
        # Split between pipes and trim whitespace, preserving empty cells
        return [cell.strip() for cell in line.strip().split('|')[1:-1]]

    i = 0
    out_lines = []
    n = len(lines)
    while i < n:
        # Try to detect Markdown table block: header row + border line
        if i + 1 < n and is_md_table_row(lines[i]) and is_md_table_border(lines[i + 1]):
            header_cells = parse_row(lines[i])
            j = i + 2
            body_rows = []
            while j < n and is_md_table_row(lines[j]):
                body_rows.append(parse_row(lines[j]))
                j += 1

            # Normalize column count
            num_cols = max(len(header_cells), max((len(r) for r in body_rows), default=0))
            header_cells += [''] * (num_cols - len(header_cells))
            normalized_rows = []
            for r in body_rows:
                r = r + [''] * (num_cols - len(r))
                normalized_rows.append(r)

            # Compute column widths
            col_widths = [0] * num_cols
            for idx in range(num_cols):
                widths = [len(header_cells[idx])] + [len(r[idx]) for r in normalized_rows]
                col_widths[idx] = max(widths + [1])

            def horiz(sep: str) -> str:
                # Build a horizontal border using sep ('-' or '=')
                parts = ['+']
                for w in col_widths:
                    parts.append(sep * (w + 2))
                    parts.append('+')
                return ''.join(parts)

            def row_line(cells: list) -> str:
                parts = ['|']
                for idx, w in enumerate(col_widths):
                    cell = cells[idx]
                    pad = ' ' * (w - len(cell))
                    parts.append(' ' + cell + pad + ' ')
                    parts.append('|')
                return ''.join(parts)

            # Emit grid table
            out_lines.append(horiz('-'))
            out_lines.append(row_line(header_cells))
            out_lines.append(horiz('='))  # header separator
            for r in normalized_rows:
                out_lines.append(row_line(r))
                out_lines.append(horiz('-'))

            # Advance
            i = j
            continue

        # Fallback: passthrough
        out_lines.append(lines[i])
        i += 1

    return '\n'.join(out_lines)

def _normalize_grid_tables(rst_text: str) -> str:
    """
    Reconstruct RST grid tables to ensure consistent borders and column widths.
    This helps avoid 'Malformed table' errors due to minor width inconsistencies
    that can happen when content is manually authored.
    """
    lines = rst_text.splitlines()

    def is_border(line: str) -> bool:
        s = line.strip('\n')
        if not s.startswith('+') or not s.endswith('+'):
            return False
        body = s[1:-1]
        return set(body) <= {'-', '=', '+'}

    def is_row(line: str) -> bool:
        s = line.rstrip('\n')
        return s.startswith('|') and s.endswith('|')

    def split_row(line: str) -> list:
        # Keep internal spacing as content; strip only outer spaces
        cells = line[1:-1].split('|')
        return [c[1:-1] if len(c) >= 2 and c.startswith(' ') and c.endswith(' ') else c.strip() for c in cells]

    i = 0
    out = []
    n = len(lines)
    while i < n:
        if is_border(lines[i]):
            # Start capturing a table block
            j = i
            rows = []
            borders = []
            header_sep_idx = None
            while j < n and (is_border(lines[j]) or is_row(lines[j])):
                if is_border(lines[j]):
                    borders.append(lines[j])
                    # Detect header separator with '='
                    if header_sep_idx is None and set(lines[j].replace('+', '').strip()) <= {'='} and '=' in lines[j]:
                        header_sep_idx = len(rows)  # number of data rows seen so far
                else:
                    rows.append(split_row(lines[j]))
                j += 1

            if rows:
                num_cols = max(len(r) for r in rows)
                # Pad rows
                norm_rows = [r + [''] * (num_cols - len(r)) for r in rows]
                # Compute widths
                widths = [1] * num_cols
                for c in range(num_cols):
                    widths[c] = max(len(r[c]) for r in norm_rows)

                def mk_border(ch: str) -> str:
                    parts = ['+']
                    for w in widths:
                        parts.append(ch * (w + 2))
                        parts.append('+')
                    return ''.join(parts)

                def mk_row(cells: list) -> str:
                    parts = ['|']
                    for idx, w in enumerate(widths):
                        cell = cells[idx]
                        pad = ' ' * (w - len(cell))
                        parts.append(' ' + cell + pad + ' ')
                        parts.append('|')
                    return ''.join(parts)

                # Re-emit table
                out.append(mk_border('-'))
                # If a header separator was detected, treat first row as header
                if header_sep_idx is not None and header_sep_idx <= 1:
                    # Emit header (first row), header border, then remaining
                    out.append(mk_row(norm_rows[0]))
                    out.append(mk_border('='))
                    for r in norm_rows[1:]:
                        out.append(mk_row(r))
                        out.append(mk_border('-'))
                else:
                    # No explicit header; emit all rows with '-' borders between
                    for idx, r in enumerate(norm_rows):
                        out.append(mk_row(r))
                        out.append(mk_border('-'))

                i = j
                continue

        # passthrough non-table line
        out.append(lines[i])
        i += 1

    return '\n'.join(out)

def _normalize_heading_adornments(rst_text: str) -> str:
    """
    Ensure underline/overline adornment lengths match their title text length.
    Fixes warnings like 'Title underline too short.'
    """
    lines = rst_text.splitlines()
    out = []

    def is_adornment(line: str) -> bool:
        if not line:
            return False
        ch = line[0]
        if ch not in "=-~`^\"'*+#<>_":
            return False
        return all(c == ch for c in line.strip())

    i = 0
    n = len(lines)
    while i < n:
        # Overline style: adorn, title, adorn
        if i + 2 < n and is_adornment(lines[i]) and not is_adornment(lines[i+1]) and is_adornment(lines[i+2]):
            ch = lines[i][0]
            title = lines[i+1].rstrip('\n')
            width = len(title)
            out.append(ch * width)
            out.append(title)
            out.append(ch * width)
            i += 3
            continue

        # Underline style: title, adorn
        if i + 1 < n and not is_adornment(lines[i]) and is_adornment(lines[i+1]):
            ch = lines[i+1][0]
            title = lines[i].rstrip('\n')
            width = len(title)
            out.append(title)
            out.append(ch * width)
            i += 2
            continue

        out.append(lines[i])
        i += 1

    return '\n'.join(out)
def transform(writer=None, part=None):
    p = OptionParser(add_help_option=False)

    # Collect all the command line options
    docutils_parser = DocutilsOptionParser(components=(writer, Parser()))
    for group in docutils_parser.option_groups:
        p.add_option_group(group.title, None).add_options(group.option_list)

    p.add_option('--part', default=part)

    opts, args = p.parse_args()

    settings = dict({
        'file_insertion_enabled': False,
        'raw_enabled': False,
    }, **opts.__dict__)

    if len(args) == 1:
        try:
            content = open(args[0], 'r').read()
        except IOError:
            content = args[0]
    else:
        content = sys.stdin.read()

    # Preprocess: convert Markdown-style pipe tables to RST grid tables
    try:
        content = _convert_markdown_tables_to_grid(content)
    except Exception:
        # Do not fail the build if preprocessing encounters unexpected input
        pass

    # Preprocess: normalize existing grid tables to avoid malformed widths
    try:
        content = _normalize_grid_tables(content)
    except Exception:
        pass

    # Preprocess: normalize heading adornments to match title lengths
    try:
        content = _normalize_heading_adornments(content)
    except Exception:
        pass

    # Prefer MathJax rendering for LaTeX/math
    settings['math_output'] = 'MathJax https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'

    parts = publish_parts(
        source=content,
        settings_overrides=settings,
        writer=writer,
    )

    if opts.part in parts:
        html = parts[opts.part]
        # Post-process to ensure headings within RST sections carry anchor ids
        try:
            html = _assign_section_ids_to_headings(html)
        except Exception:
            # Do not fail the build on post-processing; return the original fragment
            pass
        return html
    return ''
