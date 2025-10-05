#!/usr/bin/env python3
"""
Attachment Data Generator for Jekyll Sites
Generates attachment gallery and reference data for GitHub Pages deployment
Replaces the Ruby plugin functionality with build-time data generation
"""

import os
import re
import yaml
import glob
from pathlib import Path
from urllib.parse import urljoin
from collections import defaultdict

class AttachmentDataGenerator:
    def __init__(self, site_root="."):
        self.site_root = Path(site_root).resolve()
        self.posts_dir = self.site_root / "_posts"
        self.pages_dirs = [self.site_root / "_tabs", self.site_root]
        self.data_dir = self.site_root / "_data"

        # Load Jekyll config
        self.config = self.load_config()
        self.base_url = self.config.get('baseurl', '')
        self.site_url = self.config.get('url', '')

        # Resolve attachments directory from config (default to "assets/attachments")
        attachments_dir_name = str(self.config.get('attachments_dir', 'assets/attachments')).strip('/')
        self.attachments_dir = self.site_root / attachments_dir_name
        # Web prefix used in content and URLs (with leading and trailing slash)
        self.attachments_web_prefix = f"/{attachments_dir_name}/"

        print(f"🔧 Initializing attachment data generator...")
        print(f"📁 Site root: {self.site_root}")
        print(f"📎 Attachments: {self.attachments_dir}")
        print(f"📎 Attachments web prefix: {self.attachments_web_prefix}")
        print(f"🌐 Base URL: {self.base_url}")

    def load_config(self):
        """Load Jekyll configuration"""
        config_path = self.site_root / "_config.yml"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        return {}

    def scan_attachments(self):
        """Scan attachments directory and return file information"""
        if not self.attachments_dir.exists():
            print(f"⚠️  Attachments directory not found: {self.attachments_dir}")
            return []

        attachments = []
        for file_path in self.attachments_dir.rglob("*"):
            if file_path.is_file() and not file_path.name.startswith('.'):
                # Calculate relative paths
                rel_path = file_path.relative_to(self.site_root)
                web_path = str(rel_path).replace('\\', '/')
                relative_url = f"/{web_path}"
                # Build absolute URL without losing baseurl when relative_url starts with '/'
                # Example: site_url=https://mr901.github.io, base_url=/posts, relative_url=/attachments/...
                # Result: https://mr901.github.io/posts/attachments/...
                absolute_url = f"{self.site_url.rstrip('/')}" f"{self.base_url}{relative_url}"

                # Determine category from path
                category = self.determine_category(str(rel_path))

                attachment_info = {
                    'filename': file_path.name,
                    'path': str(file_path),
                    'web_path': web_path,
                    'url': relative_url,
                    'absolute_url': absolute_url,
                    'name': file_path.stem,
                    'ext': file_path.suffix,
                    'category': category,
                    'size': file_path.stat().st_size if file_path.exists() else 0
                }
                attachments.append(attachment_info)

        print(f"📎 Found {len(attachments)} attachments")
        return attachments

    def determine_category(self, path_str):
        """Determine attachment category from path"""
        path_lower = path_str.lower()
        if 'research_papers' in path_lower:
            return 'research'
        elif 'articles' in path_lower:
            return 'articles'
        elif 'images' in path_lower:
            return 'images'
        else:
            return 'other'

    def scan_content_for_references(self, attachments):
        """Scan posts and pages for attachment references"""
        print("🔍 Scanning content for attachment references...")

        references = {}

        # Initialize reference tracking
        for attachment in attachments:
            filename = attachment['filename']
            references[filename] = {
                'path': attachment['path'],
                'web_path': attachment['web_path'],
                'url': attachment['url'],
                'absolute_url': attachment['absolute_url'],
                'posts': [],
                'pages': [],
                'total_references': 0
            }

        # Scan posts
        if self.posts_dir.exists():
            for post_file in self.posts_dir.rglob("*"):
                if post_file.is_file() and post_file.suffix in ['.md', '.rst', '.html']:
                    self.scan_document(post_file, references, 'posts')

        # Scan pages
        for pages_dir in self.pages_dirs:
            if pages_dir.exists():
                for page_file in pages_dir.glob("*.md"):
                    if page_file.is_file():
                        self.scan_document(page_file, references, 'pages')

        # Calculate totals
        for filename, ref_data in references.items():
            ref_data['total_references'] = len(ref_data['posts']) + len(ref_data['pages'])

        return references

    def scan_document(self, doc_path, references, doc_type):
        """Scan a single document for attachment references"""
        try:
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract frontmatter
            frontmatter, body = self.parse_frontmatter(content)
            title = frontmatter.get('title', doc_path.stem)
            date = frontmatter.get('date', '')
            if hasattr(date, 'strftime'):
                date = date.strftime('%Y-%m-%d')
            elif date:
                date = str(date)[:10]  # Extract date part if it's a string

            # Generate URL (following Jekyll URL structure)
            if doc_type == 'posts':
                # Remove date prefix (YYYY-MM-DD-) from post filename to get slug
                post_slug = doc_path.stem[11:] if len(doc_path.stem) > 11 else doc_path.stem
                url = f"{self.base_url}/{post_slug}/" if self.base_url else f"/{post_slug}/"
            else:
                url = f"{self.base_url}/{doc_path.stem}/" if self.base_url else f"/{doc_path.stem}/"

            # Look for attachment references in content
            prefix = re.escape(self.attachments_web_prefix)
            prefix_no_slash = re.escape(self.attachments_web_prefix.lstrip('/'))
            attachment_patterns = [
                rf'!\[.*?\]\(([^)]*(?:{prefix}|{prefix_no_slash})[^)]+)\)',
                rf'src=[\'\"]([^\'\"]*(?:{prefix}|{prefix_no_slash})[^\'\"]+)[\'\"]',
                rf'href=[\'\"]([^\'\"]*(?:{prefix}|{prefix_no_slash})[^\'\"]+)[\'\"]',
                rf'showImageModal\([\'\"]([^\'\"]*(?:{prefix}|{prefix_no_slash})[^\'\"]+)[\'\"]',
                rf'showPdfModal\([\'\"]([^\'\"]*(?:{prefix}|{prefix_no_slash})[^\'\"]+)[\'\"]',
                rf'(?:{prefix}|{prefix_no_slash})[^\s]*([^/\s]+\.[a-zA-Z0-9]+)'
            ]

            found_files = set()

            for pattern in attachment_patterns:
                matches = re.finditer(pattern, body, re.IGNORECASE)
                for match in matches:
                    attachment_path = match.group(1) if match.groups() else match.group(0)
                    filename = os.path.basename(attachment_path)
                    found_files.add(filename)

            # Also scan for direct filename mentions in attachment context
            base_marker_with_slash = self.attachments_web_prefix
            base_marker_no_slash = self.attachments_web_prefix.lstrip('/')
            for filename in references.keys():
                if filename in body and (base_marker_with_slash in body or base_marker_no_slash in body):
                    found_files.add(filename)

            # Add references
            for filename in found_files:
                if filename in references:
                    # Avoid duplicates
                    existing = any(ref['url'] == url for ref in references[filename][doc_type])
                    if not existing:
                        reference = {
                            'title': title,
                            'url': url,
                            'date': date,
                            'excerpt': self.extract_excerpt(body)
                        }
                        references[filename][doc_type].append(reference)

        except Exception as e:
            print(f"⚠️  Error scanning {doc_path}: {e}")

    def parse_frontmatter(self, content):
        """Parse Jekyll frontmatter from content"""
        if content.startswith('---'):
            try:
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    frontmatter = yaml.safe_load(parts[1]) or {}
                    body = parts[2]
                    return frontmatter, body
            except yaml.YAMLError:
                pass
        return {}, content

    def extract_excerpt(self, content):
        """Extract excerpt from content"""
        # Remove markdown/rst syntax and get first few sentences
        clean_content = re.sub(r'[#*`_\[\]()]+', ' ', content)
        clean_content = re.sub(r'\s+', ' ', clean_content).strip()

        if len(clean_content) > 100:
            return clean_content[:97] + '...'
        return clean_content

    def generate_galleries(self, attachments):
        """Generate gallery data grouped by category"""
        print("🖼️  Generating gallery data...")

        galleries = defaultdict(list)

        for attachment in attachments:
            category = attachment['category']

            # Add reference count from references data
            gallery_item = {
                'filename': attachment['filename'],
                'path': attachment['path'],
                'web_path': attachment['web_path'],
                'url': attachment['url'],
                'absolute_url': attachment['absolute_url'],
                'name': attachment['name'],
                'ext': attachment['ext'],
                'references': 0  # Will be updated later
            }
            galleries[category].append(gallery_item)

        # Sort each gallery by name
        for category in galleries:
            galleries[category].sort(key=lambda x: x['name'].lower())

        return dict(galleries)

    def save_data(self, galleries, references):
        """Save generated data to Jekyll data files"""
        print("💾 Saving generated data...")

        # Ensure data directory exists
        self.data_dir.mkdir(exist_ok=True)

        # Update gallery items with reference counts first
        for category, items in galleries.items():
            for item in items:
                filename = item['filename']
                if filename in references:
                    item['references'] = references[filename]['total_references']

        # Save galleries as YAML (Jekyll's preferred format)
        galleries_file = self.data_dir / "attachment_galleries.yml"
        with open(galleries_file, 'w', encoding='utf-8') as f:
            yaml.dump(galleries, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        print(f"📊 Gallery data saved: {galleries_file}")

        # Save references as YAML
        references_file = self.data_dir / "attachment_references.yml"
        with open(references_file, 'w', encoding='utf-8') as f:
            yaml.dump(references, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        print(f"🔗 Reference data saved: {references_file}")

        # JSON export removed (standardize on YAML only)

    def generate_stats(self, galleries, references):
        """Generate and display statistics"""
        total_attachments = sum(len(items) for items in galleries.values())
        total_references = sum(ref['total_references'] for ref in references.values())
        referenced_files = sum(1 for ref in references.values() if ref['total_references'] > 0)

        print(f"\n📊 Generation Summary:")
        print(f"   📎 Total attachments: {total_attachments}")
        print(f"   🔗 Total references: {total_references}")
        print(f"   📄 Referenced files: {referenced_files}")
        print(f"   📁 Categories: {len(galleries)}")

        for category, items in galleries.items():
            print(f"      • {category}: {len(items)} files")

        # Show top referenced files
        if referenced_files > 0:
            print(f"\n🏆 Most referenced attachments:")
            sorted_refs = sorted(references.items(), key=lambda x: x[1]['total_references'], reverse=True)
            for filename, ref_data in sorted_refs[:5]:
                if ref_data['total_references'] > 0:
                    print(f"   • {filename}: {ref_data['total_references']} references")

    def generate(self):
        """Main generation process"""
        print("🚀 Starting attachment data generation...")

        try:
            # Scan attachments
            attachments = self.scan_attachments()
            if not attachments:
                print("⚠️  No attachments found, creating empty data files")
                self.save_data({}, {})
                return

            # Scan for references
            references = self.scan_content_for_references(attachments)

            # Generate galleries
            galleries = self.generate_galleries(attachments)

            # Save data
            self.save_data(galleries, references)

            # Show stats
            self.generate_stats(galleries, references)

            print("✅ Attachment data generation completed successfully!")

        except Exception as e:
            print(f"❌ Error during generation: {e}")
            raise

if __name__ == "__main__":
    import sys

    site_root = sys.argv[1] if len(sys.argv) > 1 else "."
    generator = AttachmentDataGenerator(site_root)
    generator.generate()
