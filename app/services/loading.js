/*global FTSS */

FTSS.ng.service('loading', [

	'$rootScope',

	function ($rootScope) {

		var body = $('body')[0];

		/**
		 * Handles the page loading indicators (mouse & spinner)
		 * Always determines whether content is visible or not
		 *
		 * @param loading
		 */
		return function (updateState) {

			// Always tyr to close the search box
			FTSS.search && FTSS.search.close();

			if (updateState) {

				body.className += ' wait';
				document.body.style.cursor = 'wait';

			} else {
console.trace();
				body.className = body.className.replace(/wait/g, '');
				document.body.style.cursor = '';

			}

			$rootScope.loaded = !updateState;


		};


	}

]);