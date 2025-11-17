# Cloudflare Pages Deployment Notes

## File Size Limitations

Cloudflare Pages has a **25 MiB file size limit** per file. Files exceeding this limit must be excluded from the build or hosted externally.

### Currently Excluded Files

The following files are excluded from the Jekyll build (see `_config.yml` `exclude` section):

1. `attachments/posts/2025-10-05-prompting-engineering/articles/2025-09-26-Building_17_Agentic_AI_Patterns_and_Their_Role_in_Large.pdf` (72.7 MiB)

### Alternatives for Large Files

If you need to reference these files in your posts, consider these hosting alternatives:

#### 1. GitHub Releases (Recommended)
- Create a release in your repository
- Upload the large PDF as a release asset
- Reference it with: `https://github.com/MR901/posts/releases/download/<tag>/<filename>`
- **Pros**: Free, reliable, integrated with your repo
- **Cons**: Requires manual release creation

#### 2. Git LFS with External Storage
- Use Git Large File Storage
- Configure with a CDN like Cloudflare R2 or AWS S3
- **Pros**: Seamless git integration
- **Cons**: May have costs, more complex setup

#### 3. Cloud Storage Services
- Google Drive, Dropbox, OneDrive, etc.
- Generate a direct download link
- **Pros**: Easy to set up
- **Cons**: Links may expire, not version controlled

#### 4. Compress the PDF
- Use tools like `gs` (Ghostscript) to compress PDFs:
  ```bash
  gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
     -dNOPAUSE -dQUIET -dBATCH \
     -sOutputFile=compressed.pdf input.pdf
  ```
- **Pros**: File stays in repo
- **Cons**: May reduce quality, requires processing

## Deployment Configuration

### Build Command
The `make deploy` target handles deployment:
```bash
make deploy
```

This will:
1. Install Python dependencies (docutils, pygments)
2. Install Ruby dependencies (Jekyll, theme, etc.)
3. Build the Jekyll site

### Python Dependencies Fix
The Makefile has been updated to handle different Python/pip configurations:
- Tries `python3 -m pip install --user` first
- Falls back to `pip3 install`
- Final fallback to `pip install`

This ensures compatibility across different Cloudflare Pages Python environments.

## Troubleshooting

### Missing Python Module Errors
If you see `ModuleNotFoundError: No module named 'docutils'`, ensure:
- `requirements.txt` includes all dependencies
- The build command installs Python dependencies before Jekyll build
- Python path is correctly configured

### File Size Errors
If deployment fails with "Pages only supports files up to 25 MiB":
1. Find large files: `find attachments -type f -size +25M`
2. Add them to the `exclude` list in `_config.yml`
3. Consider alternative hosting (see above)

### Build Verification
Test the build locally before pushing:
```bash
# Clean previous build
bundle exec jekyll clean

# Build and check for errors
bundle exec jekyll build

# Verify site size
du -sh _site/

# Check for large files in output
find _site -type f -size +25M
```

## Cloudflare Pages Settings

### Build Configuration
- **Build command**: `make deploy`
- **Build output directory**: `_site`
- **Root directory**: `/` (leave empty/default)

### Environment Variables
You may need to set:
- `JEKYLL_ENV=production` (optional, for production builds)
- `RUBY_VERSION=3.3` (if not auto-detected)
- `PYTHON_VERSION=3.x` (if not auto-detected)

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Chirpy Theme](https://github.com/cotes2020/jekyll-theme-chirpy)

