# Site Architecture & Design Decisions

## URL Management - No Hardcoding Design

### Problem

Previously, the attachment data generation system would hardcode absolute URLs like:
```yaml
absolute_url: https://mr901.co.in/posts/attachments/image.png
```

This created issues when:
- Changing domains (e.g., `mr901.co.in` → `mr901.github.io/posts/`)
- Testing locally
- Moving between environments

### Solution

**Eliminated hardcoded URLs entirely** through:

1. **Config-Driven Approach** (`_config.yml`):
   ```yaml
   # Generate absolute URLs in attachment data (default: false)
   # Set to false to avoid hardcoding domain/baseurl in generated files
   generate_absolute_urls: false
   ```

2. **Dynamic URL Resolution** (JavaScript):
   - Automatically detects `baseurl` from current location
   - Supports meta tag override: `<meta name="baseurl" content="/posts">`
   - Falls back to intelligent path inference

3. **Portable Data Files**:
   - Only stores relative URLs: `/attachments/image.png`
   - No domain information hardcoded
   - Works across any deployment

### Benefits

✅ **Portability**: Move between domains without regenerating data  
✅ **Flexibility**: Works with custom domains or GitHub Pages default  
✅ **Simplicity**: Single source of truth for URL structure  
✅ **Maintainability**: Change `baseurl` in one place

### Implementation Details

#### Python Generator (`scripts/generate_attachment_data.py`)

```python
# Only generate absolute_url if explicitly requested
if self.generate_absolute_urls:
    absolute_url = f"{self.site_url.rstrip('/')}{self.base_url}{relative_url}"
    attachment_info['absolute_url'] = absolute_url
```

#### Ruby Plugin (`_plugins/attachment_references.rb`)

```ruby
# Only generate absolute_url if explicitly requested
if generate_absolute_urls
  absolute_url = site.config['url'].to_s + site.config['baseurl'].to_s + relative_url
  ref_data['absolute_url'] = absolute_url
end
```

#### JavaScript (`assets/js/attachments.js`)

```javascript
/**
 * Get baseurl from current location (inferred, not hardcoded)
 */
function getBaseurl() {
  // Check for meta tag first
  var metaBaseurl = document.querySelector('meta[name="baseurl"]');
  if (metaBaseurl) {
    return metaBaseurl.getAttribute('content') || '';
  }
  
  // Infer from URL pattern
  var path = window.location.pathname || '';
  var match = path.match(/^\/([^\/]+)\//);
  if (match && match[1] && 
      !['attachments', 'assets', 'js', 'css', 'images'].includes(match[1])) {
    return '/' + match[1];
  }
  
  return '';
}

/**
 * Resolve URL dynamically
 */
function resolveItemUrl(item) {
  var url = item.url || '';
  var baseurl = getBaseurl();
  
  if (baseurl && !url.startsWith(baseurl + '/')) {
    url = baseurl + url;
  }
  
  return url;
}
```

## Deployment Configuration

### Current Setup

- **Repository**: `mr901/posts`
- **Site URL**: `https://mr901.github.io/posts/`
- **Baseurl**: `/posts`

### GitHub Actions Workflow

The workflow automatically:
1. Regenerates attachment data on each deployment
2. Respects `_config.yml` settings
3. Runs tests with baseurl-aware URL swapping
4. Deploys to production or preview

```yaml
# .github/workflows/pages-deploy.yml
- name: Generate attachment data
  run: |
    python3 scripts/generate_attachment_data.py .
```

### Local Development

For local testing at root (without baseurl):
```bash
bundle exec jekyll serve --baseurl ""
```

For local testing with baseurl (matches production):
```bash
bundle exec jekyll serve  # Serves at /posts
```

## Future Considerations

### Switching Back to Custom Domain

To use `mr901.co.in/` (root):

1. Add `CNAME` file with `mr901.co.in`
2. Update `_config.yml`:
   ```yaml
   url: "https://mr901.co.in"
   baseurl: ""
   ```
3. Configure DNS at domain registrar
4. Regenerate data files (automatic on deployment)

### Using Subdomain

To use `posts.mr901.co.in/`:

1. Add `CNAME` file with `posts.mr901.co.in`
2. Update `_config.yml`:
   ```yaml
   url: "https://posts.mr901.co.in"
   baseurl: ""
   ```
3. Add CNAME record: `posts` → `mr901.github.io`
4. Regenerate data files (automatic on deployment)

## Key Principles

1. **No Hardcoding**: Never hardcode URLs in data files
2. **Config-Driven**: Single source of truth in `_config.yml`
3. **Runtime Resolution**: Let JavaScript/Jekyll resolve URLs at runtime
4. **Environment Agnostic**: Code works in dev, staging, and production without changes

## Testing

After URL configuration changes:

```bash
# Regenerate data
make generate-data

# Test locally
make serve

# Run link checker
make test
```

The system will automatically adapt to your baseurl settings.

