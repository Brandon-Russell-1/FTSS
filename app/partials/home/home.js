/*global caches, FTSS, _ */

(function () {

	"use strict";

	FTSS.ng.controller(
		'homeController',
		[
			'$scope',
			'utilities',
			'flickr',
			function ($scope, utilities, flickr) {

				// Init flickr service
				flickr.init();

				// We will be using the flickr slides how on this page
				$scope.toggleSlides = true;

				// Add to the async handler in case this returns first (likely)
				utilities.addAsync(function () {

					$scope.courseUpdates = _.filter(caches.MasterCourseList, 'updated');

					utilities.setLoaded();

				});

				$scope.$on('$destroy', flickr.destroy);

			}
		]);


}());