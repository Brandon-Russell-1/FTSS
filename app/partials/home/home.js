/*global utils, caches, FTSS, _, moment */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',

		['$scope',

		 'SharePoint',

		 function ($scope, SharePoint) {

			 SharePoint

				 .read(FTSS.models.updates)

				 .then(function (data) {

					       $scope.updates = _(data)

						       .sortBy('Created')

						       .reverse()

						       .map(function (d) {
							            d.date = moment(d.Created).fromNow();
							            return d;
						            })

						       .value();

				       });

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