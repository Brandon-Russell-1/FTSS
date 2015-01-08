/*global _, FTSS, utils */

/**
 * FTSS Main Controller
 *
 * Initializes the application and body controller
 *
 *
 */

(function () {

	"use strict";

	/**
	 * The main controller performs the initial caching functions as well as setting up other app-wide $scope objects
	 */
	FTSS.ng.controller(
		'mainController',
		[
			'$scope',
			'$location',
			'SharePoint',
			'$routeParams',
			'$timeout',
			'$http',
			function ($scope, $location, SharePoint, $routeParams, $timeout, $http) {

				$scope.cleanSlate = false;

				var _fn = $scope.fn = {

					/**
					 * Disables the page spinner/loading functions and marks everything as complete
					 * @param callback
					 */
					'setLoaded': function (callback) {

						callback && callback();

						utils.loading(false);
						$scope.loaded = true;

					},

					/**
					 * Used to create a permaLink for a given page for bookmarking/sharing
					 */
					'setPermaLink': function (includeSearch) {

						$scope.permaLink = FTSS.tags ? btoa(JSON.stringify(FTSS.tags)) : '';

						if (includeSearch) {
							$scope.permaLink += '/' + btoa($scope.searchText.$);
						}

					},

					/**
					 * Gets the current page
					 * @returns {*}
					 */
					'getPage': function () {
						return $location.path().split('/')[1];
					},

					/**
					 * Performs our page navigation function
					 * @param pg
					 */
					'doNavigate': function (pg) {

						$timeout(function () {

							$location.path(
								[
									'',
									pg || _fn.getPage(),
									$scope.permaLink
								].join('/'));

						});

					},

					/**
					 * Toggles data well collapses
					 */
					'doToggleCollapse': function () {
						$scope.wellCollapse = $scope.wellCollapse ? '' : 'collapsed';
					},

					/**
					 * Toggles data archive visibility
					 */
					'doToggleArchive': function () {
						$scope.showArchive = $scope.showArchive ? '' : 'archived';
					},

					/**
					 * Generates short URLs using the USA.gov API for generating go.usa.gov links
					 *
					 */
					'doMakeBitly': function () {

						var page = encodeURIComponent(
							[
								'https://cs1.eis.af.mil/sites/FTSS#',
								_fn.getPage(),
								$scope.permaLink
							].join('/'));

						$scope.bitlyResponse = '';

						// Send our JSONP request to go.usa.gov using the FTSS apiKey
						return $http(
							{

								'method': 'jsonp',

								'url': [
									'https://go.usa.gov/api/shorten.jsonp',
									'?login=af-ftss',
									'&apiKey=76856686bb86523732e316b4fd0d867a',
									'&longUrl=',
									page,
									'&callback=JSON_CALLBACK'
								].join('')

							})

							.then(function (response) {

								      $scope.bitlyResponse = ((response.status === 200) &&

								                              response.data.response.data.entry[0].short_url ||
								                              page).split('://')[1];

							      });
					},

					/**
					 * Performs the final page initialization.  This is called by multiple async operations so we must
					 * make several checks before running.
					 */
					'doInitPage': function () {

						if ($scope.isAuthorized && (FTSS.search || $scope.loaded)) {

							if (!$scope.isAuthorized()) {

								_fn.doNavigate('home');

							}

							if ($scope.tagBox) {

								FTSS.filters.$refresh();

								$scope.singleTag = FTSS.search.settings.maxItems < 2;

								var validFilters = FTSS.filters.map(),

								    pending = $scope.permaLink && JSON.parse(atob($scope.permaLink)),

								    /**
								     * Handles pages with tagbox but no valid selected filters
								     */
								    emptyFinish = function () {

									    _fn.setLoaded();
									    FTSS.search.focus();
									    FTSS.search.$control_input.focus();

								    };

								if (!pending) {

									var ftd = localStorage['FTSS-selectize-ftd'],
									    host = localStorage['FTSS-selectize-host'];

									pending = ftd || host ? {} : false;

									if (ftd && validFilters.u) {
										pending.u = [ftd];
									}

									if (host && validFilters.h) {
										pending.h = [host];
									}

								}

								if (pending) {

									var valMap = [],

									    tagMap = {};

									_.each(pending, function (filterItems, filterGroup) {

										if (validFilters.hasOwnProperty(filterGroup)) {

											_.each(filterItems, function (filter) {

												tagMap[filterGroup] = tagMap[filterGroup] || [];
												tagMap[filterGroup].push(filter);
												valMap.push(filterGroup + ':' + filter);

											});

										}

									});

									$timeout(function () {

										var filter = FTSS.filters.$compile(tagMap);

										FTSS.search.setValue(valMap);

										if (filter) {

											FTSS.tags = tagMap;
											$scope.filter = filter;

											FTSS.search.$control.find('.item').addClass('processed');

										} else {

											emptyFinish();

										}

									});

								} else {

									emptyFinish();
								}

							} else {

								$timeout(function () {
									$scope.cleanSlate = true;
								});

							}

						}

					}

				};

				// Setup our SP group-based security
				FTSS.security(SharePoint, $scope, _fn);

				/**
				 * Starts the loading indicators on navigation begin
				 */
				$scope.$on('$locationChangeStart', function () {

					// This is a reset handler to flush cache/reset user settings
					if (_fn.getPage() === 'reset') {
						$scope.ABORT = true;
						setTimeout(utils.masterReset, 500);
						return;
					}

					// Start the loading feedback
					utils.loading(true);

					// This allows the scope to know about the tagBox
					if (FTSS.search) {
						$scope.noSearch = false;
					}

					// Reset some basic view settings
					$scope.pageLimit = FTSS.prefs.limit;
					$scope.count = '-';
					$scope.overload = false;
					$scope.filter = false;
					$scope.searchText = {};
					$scope.showArchive = false;
					$scope.wellCollapse = false;

					FTSS.selectizeInstances = {};
					FTSS.pasteAction = false;

				});

				$scope.$on('$routeChangeSuccess', function () {

					// The second parameter of the URL is a search
					var search = $routeParams.search && atob($routeParams.search) || false;

					// Calculate the page/link portion of the permaLink
					$scope.permaLink = _fn.getPage() !== 'home' && $routeParams.link || '';

					// Allow search to come from URl
					$scope.searchText.$ = search || '';

				});

				FTSS._fn = _fn;

				utils.flickr();

			}
		]);


}()
);