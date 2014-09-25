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

					'setLoaded': function (callback) {

						callback && callback();

						utils.loading(false);
						$scope.loaded = true;

					},

					'setPermaLink': function () {

						var view = {

							'g': $scope.groupBy.$,
							's': $scope.sortBy.$,
							'c': $scope.wellCollapse,
							'a': $scope.showArchive,
							'S': $scope.searchText.$

						};

						$scope.permaLink = [

								FTSS.tags && btoa(JSON.stringify(FTSS.tags)) || '',
								btoa(JSON.stringify(view)) || ''

						].join('/');

					},

					'getPage': function () {
						return  $location.path().split('/')[1];
					},

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
					 * This is the callback for the searchbox reset button, clears out the search params
					 */
					'doResetSearch': function () {
						FTSS.search.clear();
						$scope.searchText.$ = '';
						FTSS.search.refreshOptions(false);
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
									'https://cs1.eis.af.mil/sites/FTSS/dev.html#',
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

							return $http({
								             'method': 'jsonp',
								             'url'   : url
							             })

								.then(function (data) {

									      $scope.bitlyResponse =

									      localStorage[cacheLink] =

									      ((data.status === 200) ? data.data.data.url : page).split('://')[1];

								      });

						}

					},

					'doInitPage': function () {

						if (FTSS.search || $scope.loaded) {

							if ($scope.tagBox) {

								FTSS.filters.$refresh();

								var pending =
									    $scope.permaLink && JSON.parse(atob($scope.permaLink));

								if (pending) {

									var valMap, tagMap, customFilters;

									valMap = [
									];
									tagMap = {};

									customFilters = FTSS.filters.route();

									if (pending.special) {

										$timeout(function () {

											$scope.noSearch = true;

											FTSS.search.disable();

											FTSS.search

												.addOption(
												{
													'id'      : 'custom:' + pending.special,
													'label'   : pending.text || 'Special Lookup',
													'optgroup': 'SMART FILTERS'
												});

											FTSS.search.setValue('custom:' + pending.special);

											$scope.filter = pending.special;

											$scope.permaLink = '';

										});

									} else {

										_.each(pending, function (filterItems, filterGroup) {

											_.each(filterItems, function (filter) {

												var valid = true, custom = false;

												if (filterGroup === 'q') {

													valid = _.some(customFilters, function (f) {
														return f.id === 'q:' + filter;
													});

													custom = 'q:' + filter;
													filter = customFilters[filter.charAt(1)].q;

												}

												if (valid) {

													tagMap[filterGroup] = tagMap[filterGroup] || [];
													tagMap[filterGroup].push(filter);
													valMap.push(custom || filterGroup + ':' + filter);
												}

											});

										});

										$timeout(function () {

											var filter = FTSS.filters.$compile(tagMap);

											FTSS.search.setValue(valMap);

											if (filter) {

												FTSS.tags = tagMap;
												$scope.filter = filter;

												FTSS.search.$control.find('.item').addClass('processed');

											}

										});

									}

									pending = false;

								} else {

									if ($scope.tagBox) {
										_fn.setLoaded();
										FTSS.search.focus();
										FTSS.search.$control_input.focus();
									}

								}

							} else {

								$timeout(function () {
									$scope.cleanSlate = true;
								});

							}

						}

					}

				};


				// Keep the user loading parts in a closure for neatness
				(function () {

					// Load our user data into FTSS
					SharePoint.user($scope);

					// Setup a watch for the user.groups to wait for the SOAP callback of group memberships
					var groupWatch = $scope.$watch('user.groups', function (groups) {

						// Only act if we have group memberships
						if (groups) {

							// Extract the name of any groups the user is a member of
							groups = groups.name ? [groups.name] : _.pluck(groups, 'name');

							// Used to modify views based on roles
							$scope.roleClasses = groups.join(' ');

							$scope.roleText = groups.join(' • ')
								.replace('mtf', 'MTF')
								.replace('ftd', 'FTD')
								.replace('curriculum', 'Curriculum Manager')
								.replace('scheduling', 'J4 Scheduler')
								.replace('approvers', 'Approver')
								.replace('admin', 'Administrator');

							/**
							 * Test for a particular user role
							 *
							 * @param roles
							 * @returns {boolean}
							 */
							$scope.hasRole = function (roles) {

								var authorized = false;

								_(roles).each(function (role) {

									authorized = authorized || groups.indexOf(role) > -1;

								});

								return authorized;

							};

							// Unbind our watcher
							groupWatch();

						}

					});

				}());


				/**
				 * Starts the loading indicators on navigation begin
				 */
				$scope.$on('$locationChangeStart', function () {

					// Fire our page listener for Google Analytics
					window.ga && window.ga('send', 'pageview', { page: $location.path() });

					utils.loading(true);

					if (FTSS.search) {
						$scope.noSearch = false;
					}

					$scope.pageLimit = FTSS.prefs.limit;
					$scope.count = '-';
					$scope.overload = false;
					$scope.filter = false;
					$scope.sortBy = {};
					$scope.groupBy = {};
					$scope.searchText = {};

					FTSS.selectizeInstances = {};
					FTSS.pasteAction = false;

				});

				$scope.$on('$routeChangeSuccess', function () {

					var prefs = $routeParams.view ? JSON.parse(atob($routeParams.view)) : {};

					$scope.permaLink = _fn.getPage() !== 'home' && $routeParams.link || '';

					$scope.sortBy.$ = prefs.s || '';
					$scope.groupBy.$ = prefs.g || '';
					$scope.searchText.$ = $scope.searchText.$ || prefs.S || '';
					$scope.showArchive = prefs.a || false;
					$scope.wellCollapse = prefs.c || false;

				});

				FTSS._fn = _fn;

				utils.flickr();

			}
		]);


}()
	);