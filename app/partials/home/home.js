/*global utils, caches, FTSS, _, moment */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',

		[
			'$scope',

			'SharePoint',

			function ($scope, SharePoint) {

				$scope.toggleSlides = true;

				SharePoint

					.read(FTSS.models('updates'))

					.then(function (data) {

						      $scope.updates = _(data)

							      .sortBy('Created')

							      .reverse()

							      .map(function (d) {
								           d.date = moment(d.Created).fromNow();
								           return d;
							           })

							      .value();

						      // Add to the async handler in case this returns first (likely)
						      $scope.fn.addAsync(function () {

							      $scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

						      });

					      });

			}
		]);


}());