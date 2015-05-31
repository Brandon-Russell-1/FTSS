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
			'SharePoint',
			function ($rootScope, $location, $routeParams, security, loading, utilities, sharepointFilters, $route, SharePoint) {

				_TIMER.add('main');

				// Attempt to log once and only once our user activity
				if (PRODUCTION) {

					try {

						// Send to SP without showing loading bar
						SharePoint.create(
							{
								'__metadata': 'Audit',
								'P'         : (window.failover ? 'FAILOVER   ' : '') + location.hash,
								'D'         : (window.performance.now() > 15000) ? _TIMER.get() : ''
							},

							null,

							{'ignoreLoadingBar': true});

					} catch (e) {}

				}

				/**
				 * Performs cache invalidation to fix random caching issues
				 * @constructor
				 */
				$rootScope.checkReset = function () {

					if ($location.path() === '/reset') {

						$rootScope.ABORT = true;

						try {

							// Clear the session storage used for DoD Consent tracking
							window.sessionStorage.clear();

							// Clear the local storage use for preferences/
							window.localStorage.clear();

							// Attempt to flush the IndexedDB cache as well
							SharePoint._flushCache(function () {

								window.location = '#home';
								window.location.reload(true);

							});

						} catch (e) {

							_self.errorHandler(e);

						}


					}

				};

				$rootScope.checkReset();

				$rootScope.ftss = {

					// Copy navigate to the scope
					'doNavigate': utilities.navigate,

					// Copy createLink to the scope
					'doCreateLink': utilities.createLink,

					'doPermalink': utilities.setPermaLink,

					'doToggleState': function (name) {

						$rootScope.ftss[name] = !$rootScope.ftss[name];

					},

					'initPage': utilities.initPage

				};

				// Setup our SP group-based security
				security.initialize();

				/**
				 * Starts the loading indicators on navigation begin
				 */
				$rootScope.$on('$routeChangeSuccess', function () {

					// Start the loading feedback
					loading(true);

					$rootScope.checkReset();

					// Determine if we need to process tags for this view
					$rootScope.ftss.isTagBox = !!sharepointFilters.map();

					// Limit the results for a view
					$rootScope.ftss.pageLimit = 99;

					// Toggle archived item visibility
					$rootScope.ftss.showArchived = false;

					// Hide of show the archive button
					$rootScope.ftss.hasArchiveOption = false;

					// Toggle alternate view layout
					$rootScope.ftss.showAlternateView = false;

					// Hide or show the alternate view toggle button
					$rootScope.ftss.hasAlternateView = false;

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
					$rootScope.ftss.viewTitle = ($route.current.$$route || {}).routeName;

					FTSS.selectizeInstances = {};

					FTSS.pasteAction = false;

					utilities.initPage();

				});

			}
		]);


}()
);