source 'https://rubygems.org'

gem "rails", "~> 4.1.4"
gem "jquery-rails", "~> 3.1.1"
gem "coderay", "~> 1.1.0"
gem "builder", ">= 3.0.4"
gem "request_store", ">= 1.0.5"
gem "mime-types"
gem "awesome_nested_set", ">= 3.0.0.rc.6"
gem "protected_attributes"
gem "actionpack-action_caching"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :jruby]

# Optional gem for LDAP authentication
group :ldap do
  gem "net-ldap", ">= 0.3.1"
end

# Optional gem for OpenID authentication
group :openid do
  gem "ruby-openid", ">= 2.3.0", :require => "openid"
  gem "rack-openid"
end

platforms :mri, :mingw do
  # Optional gem for exporting the gantt to a PNG file, not supported with jruby
  group :rmagick do
    gem "rmagick", ">= 2.0.0"
  end

  # Optional Markdown support, not for JRuby
  group :markdown do
    gem "redcarpet", "~> 3.1"
  end
end

platforms :jruby do
  # jruby-openssl is bundled with JRuby 1.7.0
  gem "jruby-openssl" if Object.const_defined?(:JRUBY_VERSION) && JRUBY_VERSION < '1.7.0'
  gem "activerecord-jdbc-adapter", "~> 1.3.2"
end

# Include database gems for the adapters found in the database
# configuration file
require 'erb'
require 'yaml'
# FIXME duplicating logic in config/application.rb
ENV['X_DEBIAN_SITEID'] ||= 'default'
ENV['RAILS_ETC'] = "/etc/redmine/#{ENV['X_DEBIAN_SITEID']}"
database_file = File.join(ENV['RAILS_ETC'], "database.yml")
if File.readable?(database_file)
  database_config = YAML::load(ERB.new(IO.read(database_file)).result)
  adapters = database_config.values.map {|c| c['adapter']}.compact.uniq
  if adapters.any?
    adapters.each do |adapter|
      case adapter
      when 'mysql2'
        gem "mysql2", "~> 0.3.11", :platforms => [:mri, :mingw]
        gem "activerecord-jdbcmysql-adapter", :platforms => :jruby
      when 'mysql'
        gem "activerecord-jdbcmysql-adapter", :platforms => :jruby
      when /postgresql/
        gem "pg", ">= 0.11.0", :platforms => [:mri, :mingw]
        gem "activerecord-jdbcpostgresql-adapter", :platforms => :jruby
      when /sqlite3/
        gem "sqlite3", :platforms => [:mri, :mingw]
        gem "activerecord-jdbcsqlite3-adapter", :platforms => :jruby
      when /sqlserver/
        gem "tiny_tds", "~> 0.6.2", :platforms => [:mri, :mingw]
        gem "activerecord-sqlserver-adapter", :platforms => [:mri, :mingw]
      else
        warn("Unknown database adapter `#{adapter}` found in config/database.yml, use Gemfile.local to load your own database gems")
      end
    end
  else
    warn("No adapter found in config/database.yml, please configure it first")
  end
else
  warn("Please configure your config/database.yml first")
end

local_gemfile = File.join(File.dirname(__FILE__), "Gemfile.local")
if File.exists?(local_gemfile)
  eval_gemfile local_gemfile
end

# Load plugins' Gemfiles
Dir.glob File.expand_path("../plugins/*/Gemfile", __FILE__) do |file|
  eval_gemfile file
end
