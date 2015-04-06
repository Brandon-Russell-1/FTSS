/*global FTSS */

FTSS.ng.service('loading', [

	'$rootScope',

	function ($rootScope) {

		/**
		 * Handles the page loading indicators (mouse & spinner)
		 * Always determines whether content is visible or not
		 *
		 * @param loading
		 */
		return function (updateState) {

			// Always try to close the search box
			FTSS.search && FTSS.search.close();

			if (updateState) {

				(document.getElementById('content') || {}).className = 'wait';
				document.body.style.cursor = 'wait';

			} else {

				document.getElementById('content').className = '';
				document.body.style.cursor = '';

			}

			$rootScope.loaded = !updateState;


		};


	}

]);