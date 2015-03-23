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
			'dateTools',
			'utilities',

			function ($timeout, $templateCache, dateTools, utilities) {

				return {
					'restrict'   : 'E',
					'templateUrl': '/partials/resource-view-layout.html',
					'replace'    : true,
					'scope'      : {},
					'link'       : function (scope, $el, $attr) {

						var templateEvent = _.template($templateCache.get($attr.template ||
						                                                  '/partials/resource-view-event.html')),

						    templateMonth = _.template('<td colspan="{{colspan}}">{{month}}</td>'),

						    dayFormat = 'MM-DD-YYYY',

						    watch = '$parent.' + ($attr.bind || 'groups');


						scope.$watch(watch, function (groups) {

							if (!groups) {return}

							var html = {}, events = [], min, minClone, max, dayBase,

							    downDays = dateTools.downDaysSimple,

							    // Check if this is a weekend, holiday or nothing
							    specialDay = function (day) {

								    return (day.isoWeekday() > 5) ? 'weekend' :

								           (downDays.indexOf(day.format('YYYY-MM-DD')) > -1) ? 'downDay' : '';
							    };

							// Make a flat copy of our data for date range detection
							_.each(groups, function (group) {
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
							scope.csv = [];

							// Create the list of days and months
							while (minClone < max) {

								var month = minClone.add(1, 'days').format('MMM YYYY'),

								    className = specialDay(minClone);

								if (!html.months[month]) {

									html.months[month] = {
										'month'  : month,
										'sort'   : parseInt(minClone.format('YYYYMM')),
										'colspan': 0
									};

								}

								html.months[month].colspan++;

								dayBase.push(className);

								html.days += [

									'<td class="',
									className,
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

								html.monthHeader += templateMonth(month);

							}).value();

							html.monthHeader += '</tr>;';
							html.dayHeader = '<tr class="header days">' + html.days + '</tr>';

							_.each(groups, function (instructor) {

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


								// Iterate over each event
								_.each(instructor, function (event) {

									// We subtract one to include the date the class starts
									var start = event.startMoment.diff(min, 'days') - 1,

									    // Detect instructor unavailability
									    unavailable = event.NA,

									    csv = {};

									createTDs(start);

									csv['Instructor'] = event.Instructor.InstructorName || 'Unassigned';
									csv['Start Date'] = event.startMoment.format(dayFormat);
									csv['End Date'] = event.endMoment.format(dayFormat);
									csv['MTT'] = event.MTT;

									if (unavailable) {

										csv['TTMS Class #'] = '';
										csv['PDS Code'] = '';
										csv['Course #'] = 'UNAVAILABLE';
										csv['Course Title'] = 'Instructor not available to teach';

										// This creates the HTML for our unavailable blocks
										instructor.html += '<td hover="' +
										                   event.Instructor.InstructorName +
										                   ' not available for teaching." class="unavailable" colspan="' +
										                   event.Days +
										                   '" id="' +
										                   event.Id +
										                   '"><div class="details italics">' +
										                   (event.ClassNotes || '') +
										                   '</div></td>';

									} else {

										csv['TTMS Class #'] = event.TTMS || '';
										csv['PDS Code'] = event.Course.PDS;
										csv['Course #'] = event.Course.Number;
										csv['Course Title'] = event.Course.Title;
										csv['Host Seats'] = event.Host;
										csv['Open Seats'] = event.openSeats;

										// Attempt to use cached bioPhoto
										event.bioPhoto = bioPhoto;

										// Trim the PDS if days are less than 2
										event.pds = event.Days > 2 ? event.Course.PDS : '';

										// Trim the instructor name if days are shorter than 12
										event.name = event.Days > 12 ? event.Instructor.InstructorName : '';

										event.className =

										// Match MTT classes
										event.MTT ? 'mtt' :

											// Add trainingSession class if TTMS contains TS
										event.TS ? 'trainingSession' :

											// Id short classes
										(event.allocatedSeats < event.Course.Min) ? 'short' :

										event.className;

										// Add our html to the event
										instructor.html += templateEvent(event);

									}

									csv['Notes'] = event.ClassNotes;

									// Increment the day counter
									count += event.Days;

									scope.csv.push(csv);

								});

								// map our instructor's name
								instructor.name = instructor[0].Instructor.InstructorName;

								createTDs(max.diff(min, 'days'));

								html.instructors.push(instructor);

							});

							scope.$parent.export = function () {

								var csvData = new CSV(scope.csv, {header: true}).encode(),

								    blob = new Blob([decodeURIComponent(encodeURI(csvData))], {
									    type: "text/csv;charset=utf-8;"
								    }),

								    fileName = [
									    scope.$parent.ftd.LongName,
									    ' Scheduling Data - ',
									    moment().format(),
									    '.csv'
								    ].join('');

								saveAs(blob, fileName);

							};

							// Bind the edit function (single click in this case)
							scope.doClick = function () {

								if (scope.$parent.canEdit) {

									// Dirty hack to get the current class without a million extra data binds
									var row = _.find(events, {Id: parseInt($('td:hover').attr('id'))});

									// complete binding to the edit action with our data
									row && scope.$parent.edit.call({'row': row}, false);

								}

							};

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
								html.render += (html.dayHeader + html.monthHeader).replace(/header/g, 'header footer');
							}

							scope.html = html.render;

						});
					}

				};

			}
		]
	);

}());
