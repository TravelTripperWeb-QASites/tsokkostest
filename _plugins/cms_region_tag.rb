module Jekyll
  class CmsRegionTag < Liquid::Tag
    def initialize(tag_name, text, tokens)
      super
      params = text.to_s.strip.split(',')
      @filename = params.shift.strip + '.json'
      @options = process_params(params)
    end

    include CmsRegionMethods
    

  end
end

Liquid::Template.register_tag('region', Jekyll::CmsRegionTag)
