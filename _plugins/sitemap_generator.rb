require 'xkeys'
require 'fileutils'
Jekyll::Hooks.register :site, :post_write do |site|
  SitemapGenerator.new(site).generate
end

class SitemapGenerator
  attr_reader :site

  def initialize(site)
    @site = site
  end

  def generate
    pages = site.pages
    default_lang = site.config['default_lang'] || 'en'
    # generate only once
    return unless default_lang == site.active_lang
    sitemap = {}.extend(XKeys::Hash)
    sitemap['__CONFIG__', 'default_locale'] = default_lang
    sitemap['__CONFIG__', 'page_gen'] = site.config['page_gen']
    sitemap['__CONFIG__', 'locales'] = site.config['languages']

    pages.each do |page|
      url = page.url
      url += 'index.html' if url.end_with?('/')
      url = '__ROOT__' + url
      path = url.split('/')
      label = path.last == 'index.html' && path.length > 2 ? path[-2] : path.last
      path = path[0..-2] + ['__PAGES__']
      source_path = page.is_a?(Jekyll::DataPage) ? page.source_path : page.path

      sitemap[*path] ||= []
      sitemap[*path] << { label: page.data['label'] || page.data['title'] || label, published: page.data['published'], locales: localized_urls(site, page), data_source: (page.is_a?(Jekyll::DataPage) && page.data_source) || nil, source_path: source_path } unless page.data['editable'] === false
    end

    sitemap['__REGIONS__'] = site.data['regions']

    if Dir.exists?('tmp/src')
      Dir.chdir('tmp/src') {
        sitemap['__SHA__'] = sha
      }
    else
      sitemap['__SHA__'] = sha
    end
    save_config(unpublished_files) unless unpublished_files.empty? # unpublished files will be saved in _config.yml
    save sitemap
  end

  def localized_urls(site, page)
    (site.config['languages'] || ['en']).map do |locale|
      { locale => page.url(locale) }
    end.inject({}, :merge)
  end

  private

  def save(sitemap)
    File.open('sitemap.json', 'w') do |f|
      f.write(sitemap.to_json)
    end
  end

  def sha
    `git rev-parse HEAD`.chomp
  end

  def unpublished_files
    h_file = []
    # enumerate the .html and .md files
    Dir.glob("#{Dir.pwd}/**/*.{html,md}").each do |cfile|
      if File.file?(cfile)
        file_text = File.read(cfile)
        # check the string exists
        if file_text.include?("published_localized:\n  en: 'false'") || file_text.include?("published_localized:\n  en: false")
          # Add all the unpublished files to array
          h_file << cfile.gsub("#{Dir.pwd}/", '')
        end
      end
    end
    h_file
  end

  def save_config(data)
    # first time data
    unless File.readlines('_config.yml').grep(/exclude:/).any?
      open('_config.yml', 'a') do |f|
        f << "exclude: #{data}"
      end
      return
    end
    # Data update
    File.open('output_file', 'w') do |out_file|
      File.foreach('_config.yml') do |line|
        if line =~ /exclude:/
          out_file.puts "exclude: #{data}"
        else
          out_file.puts line
        end
      end
    end
    FileUtils.mv('output_file', '_config.yml')
  end
end
