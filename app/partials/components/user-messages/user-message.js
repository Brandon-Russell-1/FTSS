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
			function ($rootScope) {

				var _cache = $rootScope.language = {};

				$('#language *').each(function () {

					_cache[this.id] = this.outerHTML;

				});

				return {
					'link': function ($scope, $el, $attrs) {

						$el[0].innerHTML = _cache[$attrs.userMessage] || '';

					}
				};

			}
		]);

}());
