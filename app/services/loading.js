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

			// Capture the current loading state
			var loadingState = (body.className.indexOf('wait') > -1);

			// Always tyr to close the search box
			FTSS.search && FTSS.search.close();

			// Only do something if the state has changed
			if (loadingState !== updateState) {

				if (updateState) {

					body.className += ' wait';
					document.body.style.cursor = 'wait';


				} else {

					body.className = body.className.replace('wait', '');
					document.body.style.cursor = '';

				}

				$rootScope.loaded = !updateState;


			}

		};


	}

]);