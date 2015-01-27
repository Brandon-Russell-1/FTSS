/*global _, FTSS, angular */

(function () {

	"use strict";

	var filters = {},

	    filterMaps = {
		    'scheduled'    : {
			    'u': 'UnitId',
			    'c': 'CourseId'
		    },
		    'requirements' : {
			    'h': 'HostId',
			    'u': 'UnitId'
		    },
		    'backlog'      : {
			    'h': 'HostId'
		    }
	    },

	    max = {
		    'backlog'      : 1,
		    'requirements' : 1
	    };

	filters.map = function () {

		return filterMaps[FTSS._fn.getPage()];

	};

	/**
	 * When the view is updated, this will update the page-specific filters for tagBox or SearchBox
	 */
	filters.$refresh = (function () {

		var options, userOptions, lastFilter;

		// return the real function for filters.$refresh now that we have today cached in a closure
		return function () {

			var page = FTSS._fn.getPage();

			// Temporary list of valid filter keys for this page
			var validFilters = _.keys(filterMaps[page]);

			if (validFilters.join() !== lastFilter) {

				lastFilter = validFilters.join();

				// create a cloned backup of our options & userOptions before we change them up
				options = options || _.clone(FTSS.search.options);
				userOptions = userOptions || _.clone(FTSS.search.userOptions);

				// empty the options--how wild is that!?@!
				FTSS.search.options = {};
				FTSS.search.userOptions = {};

				// Add everything else back in that is a valid filter for this page
				_.each(userOptions, function (opt, key) {

					if (_.contains(validFilters, key.charAt(0))) {
						FTSS.search.options[key] = _.clone(options[key]);
						FTSS.search.userOptions[key] = _.clone(userOptions[key]);
					}

				});

			}

			var settings = FTSS.search.settings;

			settings.maxItems = max[page] || 20;
			settings.mode = (settings.maxItems === 1) ? 'single' : 'multi';

			// Need to redraw selectize with our updated options!
			FTSS.search.refreshOptions(false);

		};

	}());

	/**
	 * Filter Compile Function
	 *
	 * Converts user-selected tags{} into the SharePoint friendly filter query
	 *
	 * @param tags Object
	 * @returns {*}
	 */
	filters.$compile = function (tags) {

		try {

			var maps = filters.map(),

			    filter = [];

			if (tags) {

				_.each(maps, function (map, key) {

					var fTemp = [];

					_.each(tags[key], function (tag) {

						fTemp.push(map + ' eq ' + tag);

					});

					if (fTemp.length) {

						filter.push('(' + fTemp.join(' or ') + ')');

					}

				});

				filter = filter.length > 0 ? filter.join(' and ') : '';

				return filter;

			}

		} catch (e) {

			return 'TAG COMPILATION ERROR';

		}

	};

	FTSS.filters = filters;

}());