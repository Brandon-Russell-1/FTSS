/*global FTSS */

/**
 * Our user message collection
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'userMessage',
		[

			'$rootScope',
			'appAssets',
			function ($rootScope, appAssets) {

				// Collection of items to update once the async data is loaded
				var defer = [];

				$rootScope.language = false;

				// Load the data from SharePoint
				appAssets.process(function (data) {

					$rootScope.language = data.language;

					while (defer.length) {
						setTimeout(defer.shift(), 25);
					}

				});

				return {
					'link': function ($scope, $el, $attrs) {

						// Either update it now, or wait for the async callback
						$rootScope.language ? resolve() : defer.push(resolve);

						function resolve() {

							$el[0].innerHTML = $rootScope.language[$attrs.userMessage] || '';

						}

					}
				};

			}
		]);

}());
