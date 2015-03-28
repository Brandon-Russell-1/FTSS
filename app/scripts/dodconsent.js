/*global FTSS, PRODUCTION */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.run(
		[
			'$modal',
			function ($modal) {

				// Check persistent storage for user agreement
				if (!localStorage.consent) {

					// Create the modal
					FTSS.consent = $modal(
						{
							'contentTemplate'    : '/partials/dod-consent.html',
							'keyboard'           : false,
							'backdrop'           : 'static',
							'animation'          : 'am-fade-and-scale',
							'backgroundAnimation': 'am-fade',
							'placement'          : 'center'
						});

					// Our agree action
					FTSS.consent.$scope.agree = function () {

						localStorage.consent = true;
						FTSS.consent.destroy();

					};
				}

			}
		]
	);

}());
