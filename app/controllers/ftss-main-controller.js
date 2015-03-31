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

				$rootScope.ftss = {

					// Copy navigate to the scope
					'doNavigate'  : utilities.navigate,

					// Copy createLink to the scope
					'doCreateLink': utilities.createLink,

					'doPermalink': utilities.setPermaLink,

					'doToggleState': function (name) {

						$rootScope.ftss[name] = !$rootScope.ftss[name];

					}

				};

				/**
				 * Starts the loading indicators on navigation begin
				 */
				$rootScope.$on('$routeChangeSuccess', function () {

					// Start the loading feedback
					loading(true);

					// Determine if we need to process tags for this view
					$rootScope.ftss.isTagBox = !!sharepointFilters.map();

					// Limit the results for a view
					$rootScope.ftss.pageLimit = FTSS.prefs.limit || 50;

					// Toggle archived item visibility
					$rootScope.ftss.showArchived = false;

					// Toggle alterate view layout
					$rootScope.ftss.showAlternateView = false;

					// Contains our tag-based filters if used
					$rootScope.ftss.filter = false;

					// Reset our search content
					$rootScope.ftss.tagMap = [];

					// The visible item count user feedback
					$rootScope.ftss.itemCount = {
						'total'   : 0,
						'value'   : '-',
						'overload': false
					};

					// The user full-text search
					$rootScope.ftss.searchText = atob($routeParams.search || '');

					// Default text to show in the search box
					$rootScope.ftss.searchPlaceholder = 'Type here to search within this page.';

					// Gives child scopes acces to our routes
					$rootScope.ftss.$routeParams = $routeParams;

					// Our current view name
					$rootScope.ftss.viewTitle = $route.current.$$route.routeName;

					FTSS.selectizeInstances = {};

					FTSS.pasteAction = false;

					logNavigation();

					utilities.initPage();

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