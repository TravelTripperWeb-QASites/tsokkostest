require_relative 'cms_region_methods'
module Jekyll
  class RegionBlock < Liquid::Block
    def initialize(tag_name, text, options)
      super
      params = text.to_s.strip.split(',')
      @filename = params.shift.strip + '.json'
      @options = process_params(params)
    end

    include CmsRegionMethods

    private
    
    def get_region_classes(context)
      [get_region_classes_from_options(context),
       get_region_classes_from_inner_html(context)].compact.join(',')
    end


    CLASS_REGEX = /class=['"]([^'"]+)['"]/
    def get_region_classes_from_inner_html(context)
      inner_contents = inner_html(context)
      # Parse nodes for classes already in there. 
      node_classes = []
      @nodelist.each do |n|
        if n =~ CLASS_REGEX
          node_classes << $1
        end
      end
      if node_classes.any?
        node_classes.join(',')
      else
        nil
      end
    end
    
    def inner_html(context)
      @inner_html ||= render_all(@nodelist, context)
    end
    
    #def empty_region_content(include_data_path, context)
    def empty_region_content(context)
      #include(include_data_path, context, 0, {"_template"=>"html", "content"=>"#{inner_html(context)}"})
      include(context, 0, {"_template"=>"html", "content"=>"#{inner_html(context)}"})
      #inner_html(context)
    end

  end
end


Liquid::Template.register_tag('regionblock', Jekyll::RegionBlock)
