require 'date'

class DataObject
  attr_reader :data, :definitions, :storage

  def initialize(data, definitions, storage)
    @data = data
    @definitions = definitions
    @storage = storage
  end

  def match?(key, values)
    key = key.to_s
    values = values.map(&:to_s)

    if definitions.has_key?(key) && definitions[key].has_key?('type') && definitions[key]['type'] == 'model'
      storage.send "find_#{definitions[key]['model_name']}_by_#{definitions[key]['foreign_key'] || 'id'}", values
    else
      values.include? data[key].to_s
    end
  end

  def method_missing(name, *arguments, &block)
    if data[name.to_s].nil?
      return nil
    else
      name = name.to_s
      value = if definitions.has_key?(name) && definitions[name].has_key?('type') && definitions[name]['type'] == 'model'
        storage.send "find_#{definitions[name]['model_name']}_by_#{definitions[name]['foreign_key'] || 'id'}", data[name]
      elsif definitions.has_key?(name) && definitions[name].has_key?('type') && definitions[name]['type'] == 'date'
        Date.parse data[name]
      elsif definitions.has_key?(name) && definitions[name].has_key?('type') && definitions[name]['type'] == 'datetime'
        DateTime.parse data[name]
      else
        data[name]
      end

      definitions.has_key?(name) && definitions[name].has_key?('localizable') && definitions[name]['localizable'] ?
        value[storage.locale] || value[storage.default_locale] : value
    end
  end

  def respond_to_missing?(name, include_private = false)
    !data[name.to_s].nil? || super
  end

  def to_liquid
    self
  end

  def [](property)
    send(property)
  end

  def has_key?(property)
    data.has_key?(property)
  end

end
