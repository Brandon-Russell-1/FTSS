/*global FTSS, angular */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'resourceView',

		[
			'$timeout',
			'$templateCache',
			'$compile',
			'dateTools',
			'loading',

			function ($timeout, $templateCache, $compile, dateTools, loading) {

				return {
					'restrict'   : 'E',
					'templateUrl': '/partials/resource-view-layout.html',
					'scope'      : true,
					'link'       : function (scope, $el, $attr) {

						var templateEvent = _.template($templateCache.get($attr.template ||
						                                                  '/partials/resource-view-event.html')),

							templateMonth = _.template('<td colspan="{{colspan}}">{{month}}</td>'),

							watch = ($attr.bind || 'groups'),

							tbody = $el.find('tbody')[0];

						scope.$watch(watch, function (groups, last) {

							// Only do something on a change
							if (!groups || _.isEqual(groups, last)) {return}

							var html = {}, events = {}, min, max, dayBase;

							// Turn on page loading
							loading(true);

							// Empty our view
							tbody.innerHTML = '';

							// Make a flat copy of our data for date range detection
							_.each(groups, function (group) {
								_.each(group, function (row) {
									events[row.Id] = row;
								});
							});

							// Only looing a week back
							min = moment().add(-1, 'week');

							// Get the latest end date, plus one day
							max = moment(Math.max.apply(Math, _.pluck(events, 'endMoment'))).add(1, 'days');

							scope.resourceEvents = [];

							buildHeaders();

							_.each(groups, function (instructor) {

								instructor.html = '';

								var count = 0;

								// Iterate over each event
								_.each(instructor, function (event) {

									// Get the start of this event
									var start = event.startMoment.diff(min, 'days');

									// For long-running events ending soon, truncate their total days
									event.DaysTruncated = event.Days + ((start < 1) ? start - 1 : 0);

									// Handle overlapping class dates
									if (start > 0 && count > start) {
										event.DaysTruncated = event.Days - (count - start);
										start = count;
									}

									createTDs(start);

									if (event.NA) {

										// This creates the HTML for our unavailable blocks
										instructor.html += '<td hover="' +
										                   event.Instructor.InstructorName +
										                   ' not available for teaching." class="unavailable" colspan="' +
										                   event.DaysTruncated +
										                   '" id="' +
										                   event.Id +
										                   '"><div class="details italics">' +
										                   (event.ClassNotes || '') +
										                   '</div></td>';

									} else {

										// Trim the PDS if days are less than 2
										event.pds = event.DaysTruncated > 2 ? event.Course.PDS : '';

										// Identify this class as truncated
										if (event.Days !== event.DaysTruncated) {
											event.pds = '<i hover="Some days of this class are not visible.">' +
											            event.Course.PDS + '</i>'
										}

										// Trim the instructor name if days are shorter than 12
										event.name = (event.DaysTruncated > 12) ?
										             event.Instructor.InstructorName : '';

										event.className =

											// Match MTT classes
											event.className = event.MTT ? 'mtt' :

												// Add trainingSession class if TTMS contains TS
												              event.TS ? 'trainingSession' :

												                  // Id short classes
												              (event.allocatedSeats < event.Course.Min) ? 'short' :

												              event.className;

										// Add our html to the event
										instructor.html += templateEvent(event);

									}

									// Increment the day counter
									count += event.DaysTruncated;

								});

								createTDs(max.diff(min, 'days'));

								html.instructors.push(instructor);

								/**
								 * Appends TD elements to our TR HTML until the specified end
								 *
								 * @param end
								 */
								function createTDs(end) {

									while (count < end) {

										instructor.html += '<td class="' + dayBase[count++] + '"></td>';

									}

								}

							});

							html.render = '';

							html.spacer = '<tr class="spacer"><td></td></tr>';

							_(html.instructors).sortBy('name').each(function (instructor, index) {

								// For extra large groups,
								if (index % 10 < 1 &&
								    (html.instructors.length < 5 || (html.instructors.length - index) > 5)) {
									html.render += html.monthHeader + html.dayHeader + html.spacer;
								}

								html.render += '<tr class="event">' +
								               instructor.html +
								               '</tr>' +
								               html.spacer;

							}).value();

							if (html.instructors.length > 9) {
								html.render += (html.dayHeader + html.monthHeader)
									.replace(/header/g, 'header footer');
							}

							tbody.innerHTML = html.render;

							// Handle our details click operation (edit class)
							scope.editClass = function (id) {

								// Only give this view to FTD Schedulers
								if (scope.$parent.canEdit) {

									// Find the class data by id
									var row = scope.getRow(id);

									// complete binding to the edit action with our data
									row && scope.edit.call({'row': row}, false);

								}

							};

							/**
							 * Get the class data given an id
							 *
							 * @param id Number
							 * @returns row Object
							 */
							scope.getRow = function (id) {

								return events[Number(id)];

							};

							// Compile our directives/click actions
							$compile(tbody.getElementsByClassName('mark'))(scope);

							loading(false);

							function buildHeaders() {

								// Initialize our variables
								var minClone = min.clone();

								html.months = {};
								html.days = [];
								html.instructors = [];

								// Array of days to reference for classNames later on
								dayBase = [];

								// Create the list of days and months
								while (minClone < max) {

									// Add day to minClone and get the month
									var month = minClone.add(1, 'days').format('MMM YYYY'),

									// Added classes for weekend or holidays
										className = dateTools.isWeekend(minClone) ? 'weekend' :

										            dateTools.isDownDay(minClone) ? 'downDay' : '';

									// Create the month if it doesn't exist
									html.months[month] = html.months[month] || {
										'month'  : month,
										'sort'   : parseInt(minClone.format('YYYYMM'), 10),
										'colspan': 0
									};

									// Increase the colspan by one to match days of month
									html.months[month].colspan++;

									// Add the class (weekend/downDay) to our the day array for later use
									dayBase.push(className);

									// Add our html to the html.days array (will be joined at the end)
									html.days.push('<td class="', className, '">', minClone.format('D'),
									               '<br>', minClone.format('dd'), '</td>')

								}

								/**
								 * The reusable html header (months/days)
								 *
								 * @type {string}
								 */
								html.monthHeader = '<tr class="header months">';

								_(html.months).sortBy('sort').each(function (month) {

									html.monthHeader += templateMonth(month);

								}).value();

								html.monthHeader += '</tr>';

								html.dayHeader = '<tr class="header days">' + html.days.join('') + '</tr>';

							}

						});
					}

				};

			}
		]
	);

}());