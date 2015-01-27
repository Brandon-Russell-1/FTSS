/*global caches, FTSS, _ */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',
		[
			'$scope',
			function ($scope) {

				// We will be using the flickr slides how on this page
				$scope.toggleSlides = true;

				// Add to the async handler in case this returns first (likely)
				$scope.fn.addAsync(function () {

					$scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

					$scope.fn.setLoaded();

				});

			}
		]);


}());