Jekyll::Hooks.register :site, :after_reset do |site|
  site.config['keep_files'] ||= []
  site.config['keep_files'] << 'assets' unless site.config['keep_files'].include?('assets')

  p site.config['keep_files']
end

module Jekyll
  class RsyncImageGenerator < Generator
    def generate(site)
      system("mkdir -p #{site.config['destination']}");

      root = site.config['source']
      (site.config['rsync_copy'] || ['_assets']).each do |path|
        new_path = path[1..-1]
        system "mkdir -p #{site.config['destination']}/#{new_path}/"
        full_path = File.join(root, path)
        if Dir.exists?(full_path)
          system("rsync --archive --delete #{full_path}/ #{site.config['destination']}/#{new_path}/")
        else
          p "#{full_path} not exists. skipping"
        end
      end
    end
  end
end
