require 'rbst'
require 'tempfile'
require 'open3'

module Jekyll
  class RestConverter < Converter
    safe true
    priority :low

    attr_accessor :current_document

    def matches(ext)
      ext =~ /rst/i
    end

    def output_ext(ext)
      ".html"
    end

    def convert(content)
      RbST.executables = {:html => "#{File.expand_path(File.dirname(__FILE__))}/rst2html.py"}

      # Get document path from the current document being processed
      doc_path = nil
      if current_document
        doc_path = current_document.relative_path rescue (current_document.path rescue nil)
      end

      # Pass source path if available (requires writing to temp file)
      if doc_path
        # Write content to temp file so we can pass the source path for better error messages
        temp = Tempfile.new(['jekyll-rst', '.rst'])
        begin
          temp.write(content)
          temp.close

          # Execute with source-path option for better error messages
          rst_script = RbST.executables[:html]
          temp_path = temp.path

          # Capture both stdout and stderr, but keep them separate
          stdout_str, stderr_str, status = Open3.capture3(
            "python3", rst_script,
            "--part=fragment",
            "--initial-header-level=2",
            "--source-path=#{doc_path}",
            temp_path
          )

          # Print stderr with filename context if there are errors/warnings
          if stderr_str && !stderr_str.empty?
            $stderr.puts stderr_str
          end

          # Return the HTML output
          return stdout_str
        ensure
          temp.unlink
        end
      else
        # Original behavior when we don't have document path
        return RbST.new(content).to_html(:part => :fragment, :initial_header_level => 2)
      end
    end
  end

  # Hook to track which document is being converted
  Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc|
    converter = doc.site.find_converter_instance(Jekyll::RestConverter)
    converter.current_document = doc if converter
  end

  module Filters
    def restify(input)
      site = @context.registers[:site]
      converter = site.find_converter_instance(Jekyll::RestConverter)
      converter.convert(input)
    end
  end
end
