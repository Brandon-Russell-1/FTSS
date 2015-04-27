/*global caches, FTSS, _ */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',
		[
			'$scope',
			'utilities',
			function ($scope, utilities) {

				// Add to the async handler in case this returns first (likely)
				utilities.addAsync(function () {

					$scope.notChrome = !window.chrome;

					$scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

					utilities.setLoaded();

				});

			}
		]);


}());