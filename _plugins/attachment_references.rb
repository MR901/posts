# frozen_string_literal: true

# Attachment References Plugin
# Scans all posts and pages for attachment usage and generates reference data
module AttachmentReferences
  class Generator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      # Skip plugin execution if data files already exist (GitHub Pages scenario)
      galleries_file = File.join(site.source, '_data', 'attachment_galleries.yml')
      references_file = File.join(site.source, '_data', 'attachment_references.yml')

      if File.exist?(galleries_file) && File.exist?(references_file)
        Jekyll.logger.info "Attachment References:", "Pre-generated data files found, skipping plugin execution"
        return
      end
      @site = site
      @attachment_refs = {}

      # Get attachments directory from config (matches Python script behavior)
      attachments_dir = site.config['attachments_dir'] || 'attachments'
      @attachments_path = "/#{attachments_dir}/"

      Jekyll.logger.info "Attachment References:", "Using attachments directory: #{@attachments_path}"

      # Get all attachment files
      attachment_files = site.static_files.select do |file|
        file.path.include?(@attachments_path)
      end

      # Initialize reference tracking for each attachment
      attachment_files.each do |file|
        filename = File.basename(file.path)
        # Generate clean web URLs without filesystem paths
        web_path = file.path.sub(site.source, '').sub(/^\//, '')
        relative_url = '/' + web_path
        absolute_url = site.config['url'].to_s + site.config['baseurl'].to_s + relative_url

        @attachment_refs[filename] = {
          'path' => file.path,
          'web_path' => web_path,
          'url' => relative_url,
          'absolute_url' => absolute_url,
          'posts' => [],
          'pages' => [],
          'total_references' => 0
        }
      end

      # Scan posts for attachment references
      scan_documents(site.posts.docs, 'posts')

      # Scan pages for attachment references
      scan_documents(site.pages, 'pages')

      # Calculate totals and sort by usage
      @attachment_refs.each do |filename, data|
        data['total_references'] = data['posts'].length + data['pages'].length
      end

      # Sort by most referenced first
      sorted_refs = @attachment_refs.sort_by { |_, data| -data['total_references'] }.to_h

      # Save to site data for use in templates
      site.data['attachment_references'] = sorted_refs

      # Generate gallery data for navigation
      generate_gallery_data(attachment_files)

      Jekyll.logger.info "Attachment References:", "Processed #{@attachment_refs.keys.length} attachments"
      Jekyll.logger.info "Attachment References:", "Found #{total_references} total references"

      # Debug: Show which files have references
      @attachment_refs.each do |filename, data|
        if data['total_references'] > 0
          Jekyll.logger.info "Attachment References:", "#{filename}: #{data['total_references']} references"
        end
      end
    end

    private

    def scan_documents(documents, doc_type)
      documents.each do |doc|
        next unless doc.content

        # Build patterns dynamically based on configured attachments path
        # Escape path for use in regex, removing leading/trailing slashes
        escaped_path = Regexp.escape(@attachments_path.gsub(/^\/|\/$/,''))

        # Look for various attachment reference patterns
        patterns = [
          /!\[.*?\]\(([^)]*\/#{escaped_path}\/[^)]+)\)/,  # Markdown images
          /src=['"]([^'"]*\/#{escaped_path}\/[^'"]+)['"]/,  # HTML src attributes
          /href=['"]([^'"]*\/#{escaped_path}\/[^'"]+)['"]/,  # HTML href attributes
          /url\(['"]?([^'"]*\/#{escaped_path}\/[^'"]+)['"]?\)/,  # CSS url()
          /showImageModal\(['"]([^'"]*#{escaped_path}\/[^'"]+)['"]/, # JS modal calls
          /showPdfModal\(['"]([^'"]*#{escaped_path}\/[^'"]+)['"]/ # JS PDF calls
        ]

        # First, scan with path-based patterns
        patterns.each do |pattern|
          doc.content.scan(pattern) do |match|
            attachment_path = match[0]
            filename = File.basename(attachment_path)

            next unless @attachment_refs[filename]

            # Avoid duplicates for the same document
            existing = @attachment_refs[filename][doc_type].find { |ref| ref['url'] == doc.url }
            next if existing

            # Generate proper URL with baseurl for both local and GitHub Pages
            full_url = @site.config['baseurl'].to_s + doc.url

            reference = {
              'title' => doc.data['title'] || doc.name,
              'url' => full_url,
              'date' => doc.date&.strftime('%Y-%m-%d'),
              'excerpt' => (doc.data['excerpt']&.to_s&.strip&.gsub(/\s+/, ' ')&.length.to_i > 100 ? doc.data['excerpt'].to_s.strip.gsub(/\s+/, ' ')[0..97] + '...' : doc.data['excerpt']&.to_s&.strip&.gsub(/\s+/, ' '))
            }

            @attachment_refs[filename][doc_type] << reference
          end
        end

        # Scan for direct filename mentions with better context
        @attachment_refs.each_key do |filename|
          # Build patterns dynamically with configured attachments path
          attachments_pattern = Regexp.escape(@attachments_path.gsub(/^\/|\/$/,''))

          # Look for filename in specific contexts that indicate actual usage
          filename_patterns = [
            # Markdown/RST image syntax with asset path
            Regexp.new("!\\[.*?\\]\\([^)]*#{attachments_pattern}[^)]*#{Regexp.escape(filename)}[^)]*\\)", Regexp::IGNORECASE),
            Regexp.new("\\.\\.\\s+figure::\\s+[^\\n]*#{attachments_pattern}[^\\n]*#{Regexp.escape(filename)}", Regexp::IGNORECASE),
            Regexp.new("\\.\\.\\s+image::\\s+[^\\n]*#{attachments_pattern}[^\\n]*#{Regexp.escape(filename)}", Regexp::IGNORECASE),
            # HTML src/href with asset path
            Regexp.new("src=['\"][^'\"]*#{attachments_pattern}[^'\"]*#{Regexp.escape(filename)}[^'\"]*['\"]", Regexp::IGNORECASE),
            Regexp.new("href=['\"][^'\"]*#{attachments_pattern}[^'\"]*#{Regexp.escape(filename)}[^'\"]*['\"]", Regexp::IGNORECASE),
            # Direct asset path reference
            Regexp.new("#{attachments_pattern}/[^\\s]*#{Regexp.escape(filename)}(?!\\w)", Regexp::IGNORECASE)
          ]

          found_reference = false
          filename_patterns.each do |pattern|
            if doc.content.match?(pattern)
              found_reference = true
              break
            end
          end

          if found_reference
            # Avoid duplicates for the same document
            existing = @attachment_refs[filename][doc_type].find { |ref| ref['url'] == doc.url }
            next if existing

            # Generate proper URL with baseurl for both local and GitHub Pages
            full_url = @site.config['baseurl'].to_s + doc.url

            reference = {
              'title' => doc.data['title'] || doc.name,
              'url' => full_url,
              'date' => doc.date&.strftime('%Y-%m-%d'),
              'excerpt' => (doc.data['excerpt']&.to_s&.strip&.gsub(/\s+/, ' ')&.length.to_i > 100 ? doc.data['excerpt'].to_s.strip.gsub(/\s+/, ' ')[0..97] + '...' : doc.data['excerpt']&.to_s&.strip&.gsub(/\s+/, ' '))
            }

            @attachment_refs[filename][doc_type] << reference
          end
        end
      end
    end

    def generate_gallery_data(attachment_files)
      # Group attachments by category for navigation (dynamic)
      galleries = {}

      attachment_files.each do |file|
        filename = File.basename(file.path)
        category = determine_category(file.path)

        next unless category

        # Initialize category if it doesn't exist
        galleries[category] ||= []

        # Use the same URL generation logic as references
        web_path = file.path.sub(@site.source, '').sub(/^\//, '')
        relative_url = '/' + web_path
        absolute_url = @site.config['url'].to_s + @site.config['baseurl'].to_s + relative_url

        galleries[category] << {
          'filename' => filename,
          'path' => file.path,
          'web_path' => web_path,
          'url' => relative_url,
          'absolute_url' => absolute_url,
          'name' => File.basename(filename, File.extname(filename)),
          'ext' => File.extname(filename),
          'references' => @attachment_refs[filename]['total_references']
        }
      end

      # Sort each gallery by name
      galleries.each do |category, items|
        galleries[category] = items.sort_by { |item| item['name'].downcase }
      end

      @site.data['attachment_galleries'] = galleries
    end

    def determine_category(path)
      # Extract category dynamically from path structure
      if match = path.match(/\/assets\/attachments\/([^\/]+)\//)
        category = match[1]
        # Normalize category names
        case category
        when 'research_papers'
          'research'
        else
          category
        end
      else
        'other'
      end
    end

    def total_references
      @attachment_refs.values.sum { |data| data['total_references'] }
    end
  end
end
