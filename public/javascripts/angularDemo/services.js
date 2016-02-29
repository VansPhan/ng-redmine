angular.module('redmine-services', [])
.factory('project', ['$http', function projectFactory($http) {
  return {
    all: function() {
      return $http({ method: 'GET', url: 'http://redmine.micnguyen.com/projects.json' });
    }
  };
}]);