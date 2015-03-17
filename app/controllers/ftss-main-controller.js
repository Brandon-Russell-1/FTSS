/*global _, FTSS, utils */

/**
 * FTSS Main Controller
 *
 * Initializes the application and body controller
 *
 */

(function () {

	"use strict";

	/**
	 * The main controller performs the initial caching functions as well as setting up other app-wide $rootScope objects
	 */
	FTSS.ng.controller(
		'mainController',
		[
			'$rootScope',
			'$location',
			'$routeParams',
			'security',
			'loading',
			'utilities',
			'sharepointFilters',
			// Unused $route added to DI to fix nested view issue, https://github.com/angular/angular.js/issues/1213
			'$route',
			function ($rootScope, $location, $routeParams, security, loading, utilities, sharepointFilters, $route) {

				_TIMER.add('main');

				if ($location.path() === '/reset') {

					$rootScope.ABORT = true;
					utilities.masterReset();
					return;

				}

				// Setup our SP group-based security
				security.initialize();

				/**
				 * Starts the loading indicators on navigation begin
				 */
				$rootScope.$on('$locationChangeStart', function (event) {

					// Start the loading feedback
					loading(true);

					$rootScope.ftss = {

						// Determine if we need to process tags for this view
						'isTagBox'         : !!sharepointFilters.map(),

						// Limit the results for a view
						'pageLimit'        : FTSS.prefs.limit || 50,

						// Toggle archived item visibility
						'showArchived'     : false,

						// Toggle alterate view layout
						'showAlternateView': false,

						// Contains our tag-based filters if used
						'filter'           : false,

						// The visible item count user feedback
						'itemCount'        : {
							'value'   : '-',
							'overload': false
						},

						// The user full-text search
						'searchText'       : atob($routeParams.search || ''),

						//
						'$routeParams'     : $routeParams,

						'viewTitle'   : $location.path().split('/')[1],

						// Copy navigate to the scope
						'doNavigate'  : utilities.navigate,

						// Copy createLink to the scope
						'doCreateLink': utilities.createLink,

						'doPermalink': utilities.setPermaLink,

						'doToggleState': function(name) {

							$rootScope.ftss[name] = !$rootScope.ftss[name];

						}

					};

					FTSS.selectizeInstances = {};
					FTSS.pasteAction = false;

					logNavigation();

				});


				/**
				 * Sends user navigation and page-load statistics to our audit list
				 */
				function logNavigation() {

					// Wrap in a try/catch as this is just some extra logging info
					try {

						// Only apply to production app
						if (PRODUCTION) {

							// Create the basic data to send
							var send = {
								'__metadata': 'Audit',
								'P'         : location.hash
							};

							FTSS.performance(send);

							// Send to SP without showing loading bar
							SharePoint.create(send, null, {'ignoreLoadingBar': true});

						}

					} catch (e) {}

				}

			}
		]);


}()
);