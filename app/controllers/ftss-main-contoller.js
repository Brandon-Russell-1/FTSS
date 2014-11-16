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
					'setPermaLink': function () {

						$scope.permaLink = [

							FTSS.tags ? btoa(JSON.stringify(FTSS.tags)) : '',
							$scope.searchText.$ ? btoa($scope.searchText.$) : ''

						].join('/');

					},

					/**
					 * Gets the current page
					 * @returns {*}
					 */
					'getPage': function () {
						return  $location.path().split('/')[1];
					},

					/**
					 * Performs our page navigations function
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
					 * Bitly url generator--just because we can.  This will automatically use the 1.usa.gov domain
					 * as that's what usa.gov uses.  If it doesn't work, then it returns the long url instead
					 */
					'doMakeBitly': function () {

						var permaLink = $scope.permaLink || '',

						    pg = _fn.getPage(),

						    cacheLink = 'FTSS_bitly_' + pg + permaLink;

						var page, url;

						if (localStorage[cacheLink]) {

							$scope.bitlyResponse = localStorage[cacheLink];

						} else {

							$scope.bitlyResponse = '';

							page = encodeURIComponent(
								[
									'https://cs1.eis.af.mil/sites/FTSS#',
									pg,
									permaLink
								].join('/'));

							url = [
								'https://api-ssl.bitly.com/v3/shorten?',
								'access_token=4d2a55cd24810f5e392f6d6c61b0b5d3663ef554',
								'&formate=json',
								'&longUrl=',
								page,
								'&callback=JSON_CALLBACK'
							].join('');

							return $http(
								{
									'method': 'jsonp',
									'url'   : url
								})

								.then(function (data) {

									      $scope.bitlyResponse = localStorage[cacheLink] =

									                             ((data.status ===
									                               200) ? data.data.data.url : page).split('://')[1];

								      });

						}

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

								var pending = $scope.permaLink && JSON.parse(atob($scope.permaLink)),

								    validFilters = FTSS.filters.map(),

								    /**
								     * Handles pages with tagbox but no valid selected filters
								     */
								    emptyFinish = function () {

									    _fn.setLoaded();
									    FTSS.search.focus();
									    FTSS.search.$control_input.focus();

								    };

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
						utils.masterReset();
						$location.path('home');
						window.location.reload();
					}

					// Fire our page listener for Google Analytics
					window.ga && window.ga('send', 'pageview', { page: $location.path() });

					// Start the loadig feedback
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
					var search = $routeParams.search ? JSON.parse(atob($routeParams.search)) : false;

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