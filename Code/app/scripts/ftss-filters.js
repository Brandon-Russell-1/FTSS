/*global _, $, jQuery, FTSS */

(function () {

	"use strict";

	var filters = {};

	/**
	 *  This is the app-wide collection of custom filters used by the search box
	 */
	filters.route = function (all) {

		var route = {
			'scheduled':
				[
					{'id': "custom:Start ge datetime'TODAY'", 'text': 'Not Started'},
					{'id': "custom:End le datetime'TODAY'", 'text': 'Completed'},
					{'id': "custom:(Start le datetime'TODAY' and End ge datetime'TODAY')", 'text': 'In Progress'}
				],
			'requests' :
				[
					{'id': 'custom:Status gt 1', 'text': 'Completed Requests'},
					{'id': 'custom:Status eq 1', 'text': 'Pending Requests'},
					{'id': 'custom:Status eq 2', 'text': 'Approved Requests'},
					{'id': 'custom:Status eq 3', 'text': 'Denied Requests'}
				]
		};

		return all ? _.flatten(route) : route[FTSS.page()];

	};

	filters.map = function () {

		return {
			'scheduled'  : {
				'd': 'UnitId',
				'm': "Course/MDS",
				'a': "Course/AFSC",
				'i': 'InstructorId',
				'c': 'CourseId'
			},
			'requests'   : {
				'd': 'Scheduled/UnitId',
				'm': "Scheduled/Course/MDS",
				'a': "Scheduled/Course/AFSC",
				'i': 'Scheduled/InstructorId',
				'c': 'Scheduled/CourseId'
			}
		}[FTSS.page()];

	};

	/**
	 * When the view is updated, this will remove custom filters and then add the custom filters for this view
	 * as defined by filters.route().
	 */
	filters.$add = (function () {

		var today, date = new Date();

		// Store today's value throughout the app's lifecycle as it will be used numerous times
		today =
			[
				date.getFullYear(),
				('0' + date.getMonth() + 1).slice(-2),
				('0' + date.getDate()).slice(-2)
			].join('-');

		// return the real function for filters.$add now that we have today cached in a closure
		return function () {

			_.each(filters.route(true), function (f) {

				FTSS.search.removeOption(f.id);

			});

			/**
			 *  For simplicitie's sake, the keyword TODAY is replaced with a SP-compatible date value and
			 *  optgroup is added to make the custom filters show up in the right area of the dropdown
			 */
			_.each(filters.route(), function (filter) {

				filter.label = filter.text;

				filter.id = filter.id.replace(/TODAY/g, today);

				filter.optgroup = 'SMART FILTERS';

				FTSS.search.addOption(filter);

			});

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

			var filter =
				[
				], maps = filters.map();

			if (tags) {

				tags.custom = tags.custom ||
					[
					];

				filter = tags.custom.length ?
					[
						tags.custom.join(' or ')
					] :
					[
					];

				_.each(maps, function (map, key) {

					var isString = (key === 'm' || key === 'a'), fTemp =
						[
						];

					_.each(tags[key], function (tag) {

						if (isString) {

							fTemp.push(
								[
									map,
									" eq '",
									tag.trim(),
									"'"
								].join(''));

						} else {

							fTemp.push(
								[
									map,
									'eq',
									tag
								].join(' '));

						}

					});

					if (fTemp.length) {

						filter.push('(' + fTemp.join(' or ') + ')');

					}

				});

			}

			filter = filter.length > 0 ? filter.join(' and ') : '';

			return filter;

		} catch (e) {

			return '';

		}

	};

	FTSS.filters = filters;

}());