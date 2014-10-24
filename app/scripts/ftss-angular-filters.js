/*global FTSS, Sifter, _ */

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

	FTSS.ng.filter('courseNumber', function () {
		return function (input) {
			return input || 'Some Random Course?';
		};
	});

	FTSS.ng.filter('search', function () {

		return function (items, text) {

			if (!text || text.length === 0) {
				return items;
			}
			
			// Initialize sifter with the array of data after passing through some string sanitization
			return _.map(
				(new Sifter(items)

					.search(text,
				            {
					            'fields'     : ['search'],
					            'conjunction': 'and'
				            })

					.items),

				function (t) {

					return items[t.id];

				});

		};
	});


}());
