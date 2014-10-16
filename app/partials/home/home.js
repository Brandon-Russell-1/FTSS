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
							            d.date = moment(d.Created).format('ll');
							            return d;
						            })

						       .value();

				       });

			 $scope.$parent.$watch(
				 'cleanSlate',

				 function (res) {

					 if (res) {

						 $scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

						 utils.loading(false);

					 }

				 });

			 $scope.toggleSlides = true;

		 }
		]);


}());