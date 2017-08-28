require_relative 'cms_region_methods'
module Jekyll
  class RegionTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      params = text.to_s.strip.split(',')
      @filename = params.shift.strip + '.json'
      @options = process_params(params)
    end

    include CmsRegionMethods
    

  end
end

Liquid::Template.register_tag('region', Jekyll::RegionTag)
