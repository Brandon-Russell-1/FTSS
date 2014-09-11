/*global FTSS */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.controller(
		'userSettings',
		[
			'$scope',
			'SharePoint',
			'$timeout',
			function ($scope) {

				var html = $('html');

				$scope.pref = FTSS.prefs;

				$scope.$watch(
					'pref',

					function (val, old) {

						if (val && val !== old) {

							localStorage.FTSS_prefs = JSON.stringify(val);

							html.attr('id', FTSS.prefs.animate ? '' : 'noAnimate');

						}

					}, true);

			}

		]);

}());


