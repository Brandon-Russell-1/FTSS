/*global utils, caches, FTSS, _, moment */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',

		['$scope',

		 function ($scope) {

			 /*SharePoint

			  .read(FTSS.models.updates)

			  .then(function (data) {

			  $scope.updates = _(data)

			  .sortBy('Created')

			  .reverse()

			  .map(function (d) {
			  d.date = moment(d.Created).format('ll');
			  return d;
			  })

			  .value();

			  });
			  */

			 var complete = function (loaded) {

				 if (loaded) {
					 $scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

					 utils.loading(false);
				 }

			 };

			 $scope.cleanSlate ? complete(true) : $scope.$parent.$watch('cleanSlate', complete);

			 $scope.toggleSlides = true;

		 }
		]);


}());