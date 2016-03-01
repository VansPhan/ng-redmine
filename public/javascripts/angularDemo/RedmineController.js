angular.module('redmine')
.controller('RedmineController', function($scope, project, $uibModal, $log) {

  $scope.parents = [];
  $scope.subs = [];

  //Grabs all projects and parse parents and subs
  project.all()
  .success(function(data) {
    for (var i = 0; i < data.projects.length; i++) {
      if (data.projects[i].parent == undefined) {
        $scope.parents.push(data.projects[i]);
      }
      else {
        $scope.subs.push(data.projects[i]);
      }
    }
    console.log($scope.parents);
    console.log($scope.subs);
  });

  //Open modal
  $scope.issues = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'http://redmine.micnguyen.com/AngularRedmineDemo/templates/modal.html',
      controller: function ($scope, $uibModalInstance) {
        
      },
      size: size
    });
  };

});