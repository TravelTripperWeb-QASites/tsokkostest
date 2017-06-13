module Jekyll
  module Tags
    class IncludeTag < Liquid::Tag
      def render(context)
         site = context.registers[:site]
         dirs = []
         includes_dirs = [site.config['includes_dir']].flatten
         includes_dirs.each do |config_dir|
           @includes_dir = config_dir
           dirs << resolved_includes_dir(context)
         end

         file = render_variable(context) || @file
         validate_file_name(file)

         path = nil
         dirs.each do |dir|
           path = File.join(dir, file)
           begin
             validate_path(path, dir, site.safe)
             break; # If it validates, we're done, otherwise try the next dir
           rescue IOError => e
           end
         end

         # Add include to dependency tree
         if context.registers[:page] && context.registers[:page].key?("path")
           site.regenerator.add_dependency(
             site.in_source_dir(context.registers[:page]["path"]),
             path
           )
         end

         begin
           partial = load_cached_partial(path, context)

           context.stack do
             context['include'] = parse_params(context) if @params
             partial.render!(context)
           end
         rescue => e
           raise IncludeTagError.new e.message, File.join(@includes_dir, @file)
         end
       end
      
    end
  end
  
  class DataReader
    def read(dirs)
      dirs = [dirs].flatten
      dirs.each do |dir|
        base = site.in_source_dir(dir)
        read_data_to(base, @content)
      end
      @content
    end
  end
  class LayoutReader
    
    def read
      layout_entries.each do |f, dir|
        @layouts[layout_name(f)] = Layout.new(site, dir, f)
      end

      @layouts
    end
    
    def layout_directories
      @layout_directories ||= layout_directories_in_cwd
    end
    
    private

    def layout_entries
      entries = []
      layout_directories.each do |layout_directory|
        within(layout_directory) do
          entries += EntryFilter.new(site).filter(Dir['**/*.*']).collect{|f| [f, layout_directory]}
        end
      end
      entries
    end    
    

    def layout_directories_in_cwd
      layout_dirs = [site.config['layouts_dir']].flatten
      layout_dirs.each do |ld|
        dir = Jekyll.sanitized_path(Dir.pwd, ld)
        if File.directory?(dir) && !site.safe
          dir
        else
          nil
        end
      end.compact
    end
  end
end
