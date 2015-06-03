/*global FTSS, _ */

/**
 *
 */
(function () {

	"use strict";

	/**
	 * Description:
	 *     removes white space from text. useful for html values that cannot have spaces
	 * Usage:
	 *   {{some_text | nospace}}
	 */
	FTSS.ng.filter('nospace', function () {
		return function (value) {
			return (!value) ? '' : value.replace(/ /g, '');
		};
	});

	FTSS.ng.filter('trust_html',
	               [
		               '$sce',
		               function ($sce) {
			               return function (text) {
				               return $sce.trustAsHtml(text);
			               };
		               }
	               ]);

}());
