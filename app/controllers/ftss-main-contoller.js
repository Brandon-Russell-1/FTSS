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
			// Unused $route added to DI to fix nested view issue, https://github.com/angular/angular.js/issues/1213
			'$route',
			function ($rootScope, $location, $routeParams, security, loading, utilities, $route) {

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
				$rootScope.$on('$locationChangeSuccess', function (event) {

					// Start the loading feedback
					loading(true);

					// This allows the scope to know about the tagBox
					$rootScope.noSearch = !FTSS.search;

					// Reset some basic view settings
					$rootScope.pageLimit = FTSS.prefs.limit;
					$rootScope.count = {
						'value'   : '-',
						'overload': false
					};
					$rootScope.filter = false;
					$rootScope.searchText = {};
					$rootScope.showArchive = false;
					$rootScope.wellCollapse = false;

					FTSS.selectizeInstances = {};
					FTSS.pasteAction = false;
					FTSS.tagBox = false;

					// Allow search to come from URl
					$rootScope.searchText.$ = $routeParams.search ? atob($routeParams.search) : '';
					$rootScope.PAGE = $location.path().split('/')[1];
					$rootScope.$routeParams = $routeParams;

					logNavigation();

				});

				// Copy navigate for view navigation action
				$rootScope.navigate = utilities.navigate;

				$rootScope.urlShortner = utilities.doMakeBitly;

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