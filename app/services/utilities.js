/*global FTSS */

FTSS.ng.service('utilities', [

	'loading',
	'$timeout',
	'$rootScope',
	'$location',
	'sharepointFilters',

	function (loading, $timeout, $rootScope, $location, sharepointFilters) {

		var _jobs = [],

		    /**
		     * Determines if the page load is complete
		     *
		     * @returns {boolean}
		     */
		    _checkState = function () {

			    return (!!FTSS.search || !!$rootScope.loaded);

		    },

		    _self = this;

		/**
		 * Collects async operations that are only executed once the page is initialized
		 *
		 * @param job
		 */
		this.addAsync = function (job) {

			// If already loaded, just execute immediately
			if (_checkState()) {
				$timeout(job);
				loading(false);
			} else {
				_jobs.push(job);
			}

		};

		/**
		 * Disables the page spinner/loading functions and marks everything as complete
		 * @param callback
		 */
		this.setLoaded = function (callback) {

			_TIMER.add('loaded');

			callback && callback();

			$timeout(function () {
				$rootScope.loaded = true;
			});

			loading(false);

		};

		/**
		 * Used to create a permaLink for a given page for bookmarking/sharing
		 */
		this.setPermaLink = function (includeSearch) {

			$rootScope.permaLink = FTSS.tags ? btoa(JSON.stringify(FTSS.tags)) : '';

			if (includeSearch) {
				$rootScope.permaLink += '/' + btoa($rootScope.searchText.$);
			}

		};

		/**
		 * Performs our page navigation function
		 * @param pg
		 */
		this.navigate = function (pg) {

			$timeout(function () {

				$location.path(
					[
						'',
						pg || $rootScope.PAGE || '',
						$rootScope.permaLink
					].join('/'));

			});

		};

		/**
		 * Generates short URLs using the USA.gov API for generating go.usa.gov links
		 *
		 */
		this.doMakeBitly = function () {

			var page = encodeURIComponent(
				[
					'https://cs1.eis.af.mil/sites/FTSS#',
					$rootScope.PAGE,
					$rootScope.permaLink
				].join('/'));

			$rootScope.bitlyResponse = '';

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

					      $rootScope.bitlyResponse = ((response.status === 200) &&

					                              response.data.response.data.entry[0].short_url ||
					                              page).split('://')[1];

				      });

		};

		/**
		 * Performs the final page initialization.  This is called by multiple async operations so we must
		 * make several checks before running.
		 */
		this.initPage = function () {
console.trace();
			_TIMER.add('init');

			if (_checkState()) {

				$rootScope.initInstructorRole();

				$rootScope.tagBox = FTSS.tagBox;

				if (FTSS.tagBox) {

					sharepointFilters.$refresh();

					$rootScope.singleTag = FTSS.search.settings.maxItems < 2;

					var validFilters = sharepointFilters.map(),

					    pending = $rootScope.permaLink && JSON.parse(atob($rootScope.permaLink)),

					    /**
					     * Handles pages with tagbox but no valid selected filters
					     */
					    emptyFinish = function () {

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

							var filter = sharepointFilters.$compile(tagMap);

							FTSS.search.setValue(valMap);

							if (filter) {

								FTSS.tags = tagMap;
								$rootScope.filter = filter;

								FTSS.search.$control.find('.item').addClass('processed');

							} else {

								emptyFinish();

							}

						});

					} else {

						emptyFinish();

					}

				}

				// Add setLoaded to async operations
				_jobs.push(_self.setLoaded);

				// Finally, run through all our async jobs
				while (_jobs.length) {
					$timeout(_jobs.shift());
				}

			}

		}


	}

]);