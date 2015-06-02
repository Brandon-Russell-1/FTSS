exports.config =
# See docs at http://brunch.readthedocs.org/en/latest/config.html.
  conventions:
    assets : /^app\/assets\//
    ignored: /^(app\/styles\/overrides|(.*?\/|app\/partials\/includes)?[_][a-zA-Z0-9]*)|(app\/.*?\.spec\.js)|(app\/.*?\.spec\.coffee)/
  modules    :
    definition: false
    wrapper   : false
  paths      :
    public: '_public'
  files      :
    javascripts:
      joinTo:
        'js/app.js'   : /^app/
        'js/vendor.js': /^(bower_components|vendor)/
      order :
        before: [
          'bower_components/jquery/dist/jquery.js',
          'app/scripts/angular-sharepoint.js',
          'app/scripts/ftss-init.js'
        ]
        after : [
          'app/scripts/dodconsent.js',
          'vendor/lib_log.js'
        ]

    stylesheets:
      joinTo:
        'css/app.css': /^(app|vendor|bower_components)/
      order :
        after : [
          'app/styles/theme.css',
          'app/styles/roles.css'
        ]

    templates:
      joinTo:
        'js/dontUseMe': /^app/ # dirty hack for Jade compiling.

  plugins:
    jade        :
      pretty: false # Adds pretty-indentation whitespaces to output (false by default)
    jade_angular:
      modules_folder: 'partials'
      locals        : {}
    uglify:
      screw_ie8: true

# Enable or disable minifying of result js / css files.
# minify: true
