require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Force Rails environment to be production
Rails.env ||= ActiveSupport::StringInquirer.new('production')

# for debian package : setup proper environment variables and paths
# To run redmine as unprivileged user, see /usr/share/doc/redmine/README.Debian
ObjectSpace.each_object(Thin::Runner){|x| ENV["X_DEBIAN_SITEID"] = x.options[:x_debian_siteid] if x.options[:x_debian_siteid]} if defined?(Thin)
ENV['X_DEBIAN_SITEID'] ||= 'default'
ENV['RAILS_ETC'] = "/etc/redmine/#{ENV['X_DEBIAN_SITEID']}"
ENV['RAILS_LOG'] = "/var/log/redmine/#{ENV['X_DEBIAN_SITEID']}"
ENV['RAILS_VAR'] = "/var/lib/redmine/#{ENV['X_DEBIAN_SITEID']}"
ENV['RAILS_TMP'] = "/var/cache/redmine/#{ENV['X_DEBIAN_SITEID']}"

Bundler.require(*Rails.groups)

module RedmineApp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{config.root}/lib)

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named.
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    config.active_record.store_full_sti_class = true
    config.active_record.default_timezone = :local

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    I18n.enforce_available_locales = true

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password]

    # Enable the asset pipeline
    config.assets.enabled = false

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    config.action_mailer.perform_deliveries = false

    # Do not include all helpers
    config.action_controller.include_all_helpers = false

    # move tmp directory to RAILS_TMP
    config.paths['tmp'] = ENV['RAILS_TMP']

    # loads cookie based session session and secret keys
    # this is needed here because initializers are loaded after plugins,
    # and some plugins initialize ActionController which requires a secret to be set.
    # crash if file not found
    relativeUrlRoot = ENV['RAILS_RELATIVE_URL_ROOT']
    filename = ENV['RAILS_ETC'] ? File.join(ENV['RAILS_ETC'], 'session.yml') : File.join(File.dirname(__FILE__), '..', 'session.yml')
    if File.exists?(filename)
      sessionconfig = YAML::load_file(filename)
      config.session_store :cookie_store, :key => sessionconfig[Rails.env]['key'], :path => (relativeUrlRoot.blank?) ? '/' : relativeUrlRoot
      config.secret_token = sessionconfig[Rails.env]['secret']
    else
      # temporary settings before session.yml is created
      config.session_store :cookie_store, :key => '_redmine_session', :path => (relativeUrlRoot.blank?) ? '/' : relativeUrlRoot
    end

    # log path
    config.paths['log'] = File.join(ENV['RAILS_LOG'], "#{Rails.env}.log") unless !ENV['RAILS_LOG']

    config.cache_store = :file_store, File.join(ENV['RAILS_TMP'], "cache")

    # Set Active Record's database.yml path
    config.paths['config/database'] = File.join(ENV['RAILS_ETC'], 'database.yml') unless !ENV['RAILS_ETC']

    if File.exists?(File.join(File.dirname(__FILE__), 'additional_environment.rb'))
      instance_eval File.read(File.join(File.dirname(__FILE__), 'additional_environment.rb'))
    end
  end
end
