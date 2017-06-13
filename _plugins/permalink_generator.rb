module Jekyll
  class PageReader
    alias_method :read_orig, :read

    def read(files)
      filtered_files = read_orig(files)
      @unfiltered_content.each do |page|
        site.store_page_permalink!(page)
        site.unfiltered_pages << page        
      end
      return filtered_files
    end
  end

  class Site
    attr_reader :permalinks_table
    attr_accessor :unfiltered_pages

    alias_method :reset_orig, :reset
    def reset
      reset_orig
      self.unfiltered_pages = []
    end
    
    def store_page_permalink!(page)
      @permalinks_table ||= {}

      page_url = Jekyll::URL.new({ template: page.template, placeholders: page.url_placeholders, permalink: nil }).to_s

      if page.index?
        @permalinks_table[page_url] = page

        if page_url.end_with?('/') && page_url != '/'
          @permalinks_table[page_url[0..-2]] = page
        elsif page_url != '/'
          @permalinks_table["#{page_url}/"] = page
        end
      else
        pathname = Pathname.new(page_url)
        dir = pathname.dirname.to_s
        base = pathname.basename('.*').to_s
        if page.respond_to?(:model_id) && page.model_id
          @permalinks_table["#{dir}/#{page.model_id.downcase}"] = page
        end
        @permalinks_table["#{dir}/#{base}"] = page
      end
    end
  end

  module PermalinkGenerator
    def permalink(path_or_page, *args)
      model_dir = args.first && args.first['model_dir']
      locale = args.first && args.first['locale']

      if path_or_page.kind_of?(Hash)
        key = 'url' + (locale.nil? ? '' : "_#{locale}" )
        path_or_page[key]
      else
        site = Jekyll.sites.last # each regeneration adds new site (if using watch or serve)
        page = detect_page(site, path_or_page, model_dir)

        if page
          page.url(locale || site.active_lang)
        else
          model_dir
        end
      end
    end

    def detect_page(site, path, data_dir)
      token = [data_dir, (path || '').downcase].compact.join('/')
      token = '/' + token unless token.start_with?('/')

      page = site.permalinks_table[token]
      # temprorarily fallback to old version if page not found
      page ||= site.pages.detect do |p|
        page_url = Jekyll::URL.new({ template: p.template, placeholders: p.url_placeholders, permalink: nil }).to_s

        if token.end_with?('/') && p.index? && page_url == token
          true
        elsif !token.end_with?('/')
          pathname = Pathname.new(page_url)
          dir = pathname.dirname.to_s
          base = pathname.basename('.*').to_s

          token_pathname = Pathname.new(token)
          token_dir = token_pathname.dirname.to_s
          token_base = token_pathname.basename('.*').to_s

          token == "#{dir}/#{base}" || "#{token_dir}/#{token_base}" == "#{dir}/#{base}"
        end
      end

      if page.nil? && !token.end_with?('/') && File.exists?(File.join(site.config['source'], "#{token}.html"))
        raise "Do not use permalink filter for static files (#{token})"
      elsif page.nil?
        puts "permalink for '#{token}' not found"
      end

      page
    end
  end
end

Liquid::Template.register_filter(Jekyll::PermalinkGenerator)
