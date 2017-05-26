#-----------------------------------------------------------------------------------------
#
# This plugin read all the individual media files(old and new) and write them into single json file.
# Also it reads all the individual model instance files and write them to single json file.
# When jekyll server running all these files will be created and updated accordingly.
#
#---------------------------------------------------------------------------------------

module Jekyll
  class MediaGenerator < Generator
    # This generator is safe from arbitrary code execution.
    safe true
    def generate(_site)
      create_json_files media_dir # creates image_data.json
      create_old_media old_media_dir #creates old_media.json
      create_definition_files definitions_dir # creates models.json
      create_json_files model_dir, 'models'  # creates models.json
    end

    private

    def definitions_dir
      File.expand_path(File.join(Dir.pwd, '_data', '_definitions'))
    end

    def model_dir
      File.expand_path(File.join(Dir.pwd, '_data', '_models'))
    end

    def media_dir
      File.expand_path(File.join(Dir.pwd, '_assets', 'media'))
    end

    def old_media_dir
      File.expand_path(File.join(Dir.pwd, '_assets', 'images'))
    end

    # save the contnet in a file along with .json format
    def save(filename, content)
      File.open("#{filename}.json", 'w') do |f|
        f.write(JSON.pretty_generate(content))
      end
    end

    #create old_media json for the images fetching from Github
    def create_old_media(folder)
      return [] unless File.directory? folder
      old_media_data = []
      Dir[File.join(folder, '/*')].each do |file|
        old_media_data << {:path => File.basename(file), :sha => ''}
      end
      save 'old_media', old_media_data
    end

    # creates model.json file by reading all definitions.
    def create_definition_files(folder)
      return unless File.directory? folder
      hash = Hash.new { |h, k| h[k] = [] }
      Dir.glob("#{definitions_dir}/**/*.json").map do |f|
        filename = File.basename(f, '.*').to_s
        hash[filename] << [name: '', file: '']
      end
      save 'models', hash
    end

    # creates model.json if definitions and _models directory exists.
    #    else this function will skip to create model.json.
    #  creates media file based on params passing.

    def create_json_files(folder, file_name = 'models')
      return unless File.directory? folder
      sub_folders = Dir.entries("#{folder}/").select { |entry| File.directory? File.join(folder, entry) and !(entry == '.' || entry == '..') }
      if sub_folders.empty?
        writing_file_data = Dir[File.join(folder, '*.json')].map { |f| JSON.parse File.read(f) }.flatten
        file = folder.split('/')[-1]
        save file, writing_file_data
      else
        hash = Hash.new { |h, k| h[k] = [] }
        sub_folders.each do |file|
          Dir[File.join(folder, file, '*.json')].map do |f|
            data = JSON.parse File.read(f)
            hash[file.to_s] << [name: data['name'], file: File.basename(f)]
          end
        end
        save file_name, hash
      end
    end
  end
end
