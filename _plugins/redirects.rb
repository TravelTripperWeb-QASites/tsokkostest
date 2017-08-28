module Jekyll
  class RedirectsPage < Page
    
    attr_reader :site, :source, :redirect_to
    
    def initialize(site, source, redirect_to)
      @site = site
      @redirect_to = redirect_to.gsub(/^\//,'')
      
      @name = source.gsub(/^\/+/,'')
      self.process(@name)
      @content = contents
      @data = { "permalink" => @name }

      puts url, permalink, @name
      
    end
    
    
    # def render(layouts, site_payload)
    #   site_payload["page"] = content
    #   do_layout(site_payload, layouts)
    # end
    
    def contents
      contents =<<END
<html>
  <head>
    <noscript><meta http-equiv="refresh" content="0; url=/#{@redirect_to}" /></noscript>
  </head>
  <body>
    Redirecting from #{@name} to #{@redirect_to}
    <!-- Redirect in JavaScript with meta refresh fallback above in noscript -->
     <script>
       var destination = '/#{@redirect_to}';
       window.location.href = destination + (window.location.search || '') + (window.location.hash || '');
     </script>
  </body>
</html>    
END
      return contents
    end
    
  end
  
  class RedirectsGenerator < Generator
    safe true
    
    attr_reader :site
  
    def generate(site)
      redirects_content = []
      begin
        redirects_content = YAML.load(File.read("_redirects.yml"))
      rescue Exception=>e
        return 
      end
      return if !redirects_content.is_a?(Array)
      redirects_content.each do |hash|
        hash.each do |source, destination|
          next if source =~ /^http/i
          unless source =~ /\/index.html$/i
            source += '/' if !source.end_with?('/')
            source += 'index.html' 
          end
          redirect_to = URI.encode(destination)
          
          if !(redirect_to.to_s.split('/').last =~ /\./)
            #if it doesn't have an extension, it's a directory and should end with a slash to prevent dbl redirects
            redirect_to += "/" unless redirect_to =~ /\/$/
          end          
          site.pages << RedirectsPage.new(site, source, redirect_to)
        end
      end
    end
  end
end