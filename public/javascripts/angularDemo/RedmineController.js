angular.module('redmine')
.controller('RedmineController', function($scope, project) {
  $scope.parents = [];
  $scope.children = [];
  project.all()
  .success(function(data) {
    for (var i = 0; i < data.projects.length; i++) {
      if (data.projects[i].parent == undefined) {
        $scope.parents.push(data.projects[i]);
      }
      else {
        $scope.children.push(data.projects[i]);
      }
    }
    console.log($scope.parents);
    console.log($scope.children);
  });
});