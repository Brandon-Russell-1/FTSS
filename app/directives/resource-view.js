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
			function ($timeout, $templateCache) {

				return {
					'restrict'   : 'E',
					'templateUrl': '/partials/resource-view-layout.html',
					'replace'    : true,
					'scope'      : {},
					'link'       : function (scope, $el) {

						scope.$watch('$parent.groups', function (groups) {

							var html = {}, events = [], min, minClone, max, dayBase,

							    downDays = FTSS.utils.getDownDays(true),

							    // Check if this is a weekend, holiday or nothing
							    specialDay = function (day) {

								    return (day.isoWeekday() > 5) ? 'weekend' :

								           (downDays.indexOf(day.format('YYYY-MM-DD')) > -1) ? 'downDay' : '';
							    };

							// Make a flat copy of our data for date range detection
							_(groups).each(function (group) {
								events = events.concat(group);
							});

							// Get the earliest start date, minus one day
							min = moment(Math.min.apply(Math, _.pluck(events, 'startMoment'))).add(-1, 'days');

							// Get the latest end date, plus one day
							max = moment(Math.max.apply(Math, _.pluck(events, 'endMoment'))).add(1, 'days');

							// Initialize our variables
							minClone = min.clone();
							html.months = {};
							html.days = '';
							html.instructors = [];

							dayBase = [];

							scope.resourceEvents = [];
							scope.photoCache = {};

							// Create the list of days and months
							while (minClone < max) {

								var month = minClone.add(1, 'days').format('MMM YYYY');

								if (!html.months[month]) {

									html.months[month] = {
										'month'  : month,
										'sort'   : parseInt(minClone.format('YYYYMM')),
										'colspan': 0
									};

								}

								html.months[month].colspan++;

								dayBase.push(specialDay(minClone));

								html.days += [

									'<td class="',
									specialDay(minClone),
									'">',
									minClone.format('D'),
									'<br>',
									minClone.format('dd'),
									'</td>'

								].join('');

							}

							/**
							 * The reusable html header (months/days)
							 *
							 * @type {string}
							 */
							html.monthHeader = '<tr class="header months">';

							_(html.months).sortBy('sort').each(function (month) {

								html.monthHeader += _.template('<td colspan="{{colspan}}">{{month}}</td>', month)

							});

							html.monthHeader += '</tr>;';
							html.dayHeader = '<tr class="header days">' + html.days + '</tr>';

							_(groups).each(function (instructor) {

								instructor.html = '';

								var count = 0,

								    /**
								     * Appends TD elements to our TR HTML until the specified end
								     *
								     * @param end
								     */
								    createTDs = function (end) {

									    while (count < end) {

										    instructor.html += '<td class="' + dayBase[count++] + '"></td>';

									    }

								    },

								    photo = instructor[0].Instructor.Photo,

								    bioPhoto,

								    // We have to juggle the async nature of these calls completely outside the $digest cycle
								    fillImage = function (imgURL) {

									    // Try to find the photos
									    var $el = $('.' + photo),

									        // Our html to replace the image with
									        html = '<div class="mask-img circle">' +
									               '<img src="' + imgURL + '" /></div>';

									    bioPhoto = html;

									    $el.html(html);

								    };

								photo && utils.fetchPhoto(photo, fillImage);

								// Iterate over each event
								_(instructor).each(function (event) {

									// We subtract one to include the date the class starts
									var start = event.startMoment.diff(min, 'days') - 1,

									    // Detect instructor unavailability
									    unavailable = event.CourseId < 1;

									createTDs(start);

									if (unavailable) {

										// This creates the HTML for our unavailable blocks
										instructor.html += '<td class="unavailable" colspan="' +
										                   event.Days +
										                   '" id="' +
										                   event.Id +
										                   '"><div class="details italics">' +
										                   (event.ClassNotes || '') +
										                   '</div></td>';

									} else {

										// Attempt to use cached bioPhoto
										event.bioPhoto = bioPhoto;

										// Trim the PDS if days are less than 2
										event.pds = event.Days > 2 ? event.Course.PDS : '';

										// Trim the class # if days shorter than 4
										event.ttms = event.TTMS && (event.Days > 4) ? '#' + event.TTMS : '';

										// Trim the instructor name if days are shorter than 12
										event.name = event.Days > 12 ? event.Instructor.InstructorName : '';

										// Identify under-min seats
										event.className = (event.allocatedSeats <
										                   event.Course.Min) ? 'short' : event.className;

										// Add trainingSession class if TTMS contains TS
										if (event.TTMS && event.TTMS.indexOf('TS') > -1) {
											event.className = 'trainingSession';
										}

										// Add our html to the event
										instructor.html += '<td class="mark ' + event.className + '" colspan="' +
										                   event.Days +
										                   '" id="' +
										                   event.Id +
										                   '">' +

										                   _.template($templateCache.get('/partials/resource-view-event.html'),
										                              event) +
										                   '</td>';

									}

									// Increment the day counter
									count += event.Days;

								});

								// map our instructor's name
								instructor.name = instructor[0].Instructor.InstructorName;

								createTDs(max.diff(min, 'days'));

								html.instructors.push(instructor);

							});

							// Bind the edit function (single click in this case)
							scope.doClick = function () {

								// Dirty hack to get the current class without a million extra data binds
								var row = _.find(events, {Id: parseInt($('td:hover').attr('id'))});

								// complete binding to the edit action with our data
								row && scope.$parent.edit.call({'row': row}, false);

							};

							html.render = html.monthHeader + html.dayHeader;

							html.spacer = '<tr class="spacer"><td></td></tr>';

							_(html.instructors).sortBy('name').each(function (instructor) {

								html.render += html.spacer +
								               '<tr class="event">' +
								               instructor.html +
								               '</tr>';

							});

							if (html.instructors.length > 8) {

								html.render += html.spacer +
								               (html.dayHeader + html.monthHeader).replace(/header/g, 'header footer');

							}

							scope.html = html.render;

						});
					}

				};

			}
		]
	);

}());
