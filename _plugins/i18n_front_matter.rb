Jekyll::Hooks.register :pages, :post_init do |page|
  locale = page.site.active_lang
  default_locale = page.site.default_lang

  page.data = translate_data(page.data, locale, default_locale)
  permalink = page.data['permalink']
  if permalink && !(permalink.end_with?('/') || permalink.end_with?('.html'))
    p "Permalink #{permalink} is invalid. Must ends with '/' or html extension"
    page.data['permalink'] += '.html'
  end

end
