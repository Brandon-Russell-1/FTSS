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
			'$route',
			function ($scope, $location, SharePoint, $routeParams, $timeout, $http) {

				_TIMER.add('mainController');

				var jobs = [],

				    /**
				     * Determines if the page load is complete
				     *
				     * @returns {boolean}
				     */
				    checkState = function () {

					    return (!!$scope.isAuthorized && (!!FTSS.search || !!$scope.loaded));

				    };

				var _fn = $scope.fn = {

					/**
					 * Collects async operations that are only executed once the page is initialized
					 *
					 * @param job
					 */
					'addAsync': function (job) {

						// If already loaded, just execute immediately
						if (checkState()) {
							$timeout(job);
							utils.loading(false);
						} else {
							jobs.push(job);
						}

					},

					/**
					 * Disables the page spinner/loading functions and marks everything as complete
					 * @param callback
					 */
					'setLoaded': function (callback) {

						_TIMER.add('setLoaded');

						callback && callback();

						$timeout(function () {
							$scope.loaded = true;
						});

						utils.loading(false);

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

						_TIMER.add('doInitPage');

						if (checkState()) {

							if (!$scope.isAuthorized()) {

								_fn.doNavigate('home');
								return;

							}

							$scope.initInstructorRole();

							$scope.tagBox = FTSS.tagBox;

							if (FTSS.tagBox) {

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

							}

							// Finally, run through all our async jobs
							while (jobs.length) {
								$timeout(jobs.shift());
							}

						}

					}

				};


				if ($location.path() === '/reset') {

					$scope.ABORT = true;
					utils.masterReset();
					return;

				}

				// Setup our SP group-based security
				FTSS.security(SharePoint, $scope, _fn);

				/**
				 * Starts the loading indicators on navigation begin
				 */
				$scope.$on('$locationChangeStart', function () {

					// Start the loading feedback
					utils.loading(true);

					// This allows the scope to know about the tagBox
					if (FTSS.search) {
						$scope.noSearch = false;
					}

					// Reset some basic view settings
					$scope.pageLimit = FTSS.prefs.limit;
					$scope.count = {
						'value'   : '-',
						'overload': false
					};
					$scope.filter = false;
					$scope.searchText = {};
					$scope.showArchive = false;
					$scope.wellCollapse = false;

					FTSS.selectizeInstances = {};
					FTSS.pasteAction = false;
					FTSS.tagBox = false;

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