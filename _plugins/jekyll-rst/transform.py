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
