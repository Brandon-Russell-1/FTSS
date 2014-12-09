/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduled-ftdController',

	[
		'$scope',
		'$modal',
		'SharePoint',
		'$templateCache',
		function ($scope, $modal, SharePoint, $templateCache) {

			$scope.pageLimit = 100;

			var self = FTSS.controller($scope, {

				    'sort'          : 'startMoment',
				    'group'         : 'Instructor.InstructorName',
				    'model'         : 'scheduled',
				    'modalPlacement': 'wide',

				    // We will be post-post-processing this data for the calendar (needs some special data)
				    'finalProcess'  : function (data) {

					    var events = [], min, minClone, max, months, dayBase,

					        // Check if this is a weekend or not
					        weekend = function (day) {
						        return (day.isoWeekday() > 5) ? 'weekend' : '';
					        };

					    // Make a flat copy of our data for date range detection
					    _(data).each(function (group, index) {
						    events = events.concat(group);
					    });

					    // Get the earliest start date, minus three days
					    min = moment(Math.min.apply(Math, _.pluck(events, 'startMoment'))).add(-3, 'days');

					    // Get the latest end date, plus three days
					    max = moment(Math.max.apply(Math, _.pluck(events, 'endMoment'))).add(3, 'days');

					    // Initialize our variables
					    minClone = min.clone();
					    months = {};
					    $scope.resourceDays = '';
					    $scope.resourceEvents = [];
					    $scope.instructors = [];
					    $scope.photoCache = {};
					    dayBase = [];

					    // Create the list of days and months
					    while (minClone < max) {

						    var month = minClone.add(1, 'days').format('MMM YYYY');

						    if (!months[month]) {

							    months[month] = {
								    'month'  : month,
								    'sort'   : parseInt(minClone.format('YYYYMM')),
								    'colspan': 0
							    };

						    }

						    months[month].colspan++;

						    dayBase.push(weekend(minClone));

						    $scope.resourceDays += [

							    '<th class="',
							    weekend(minClone),
							    '">',
							    minClone.format('D'),
							    '<br>',
							    minClone.format('dd'),
							    '</th>'

						    ].join('');

					    }

					    _(data).each(function (instructor) {

						    instructor.html = '';

						    var count = 0,

						        filler = function (end) {

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

							    var start = event.startMoment.diff(min, 'days') - 1,

							        colspan = event.endMoment.diff(event.startMoment, 'days'),

							        unavailable = event.CourseId < 0;

							    filler(start);

							    if (unavailable) {

								    instructor.html += '<td class="unavailable" colspan="' +
								                       colspan + '" id="' + event.Id +
								                       '"><div class="details italics">' + (event.ClassNotes || '') +
								                       '</div></td>';

							    } else {

								    event.bioPhoto = bioPhoto;

								    event.pds = colspan > 2 ? event.Course.PDS : '';

								    event.ttms = event.TTMS && (colspan > 4) ? '#' + event.TTMS : '';

								    event.name = colspan > 12 ? event.Instructor.InstructorName : '';

								    event.className = (event.allocatedSeats <
								                       event.Course.Min) ? 'short' : event.className;

								    instructor.html += '<td class="mark ' + event.className + '" colspan="' +
								                       colspan +
								                       '" id="' +
								                       event.Id +
								                       '">' +

								                       _.template($templateCache.get('/partials/calendar-event.html'),
								                                  event) +
								                       '</td>';

							    }

							    count += colspan;

						    });

						    instructor.name = instructor[0].Instructor.InstructorName;

						    instructor.edit = function () {

							    // Dirty hack to get the current class without a million extra data binds
							    var row = _.find(instructor, { Id: parseInt($('td:hover').attr('id'))});

							    row && $scope.edit.apply({'row': row});

						    };

						    filler(max.diff(min, 'days'));

						    $scope.instructors.push(instructor);

					    });

					    // Sort by instructor name
					    $scope.instructors = _.sortBy($scope.instructors, 'name');
					    $scope.resourceMonths = _.sortBy(months, 'sort');

				    },

				    'beforeSubmit': function (scope, isNew) {

					    if (isNew && scope.data.CourseId < 0) {

						    delete scope.data.Host;
						    delete scope.data.Other;
						    delete scope.data.CourseId;

						    scope.data.TTMS = '*';

					    }

				    },

				    /**
				     * This is our modal dialog used for editing existing classes as well as building new classes
				     * @param scope
				     * @param isNew
				     */
				    'edit': function (scope, isNew) {

					    // Only add valid date-ranges to FC
					    var getDates = function () {

						        // Handle unique titles for leave/class
						        var title = scope.data.CourseId < 0 ? 'UNAVAILABLE' : 'THIS COURSE';

						        return scope.data.Start && scope.data.End ?

						               {
							               'title'           : title,
							               'start'           : scope.data.Start,
							               'end'             : scope.data.End,
							               'className'       : 'success',
							               'editable'        : true,
							               'durationEditable': true,
							               'allDay'          : true
						               }

							        : null;

					        },

					        update = function (event) {

						        var format = 'D MMM YYYY';

						        scope.data.Start = event.start.format(format);
						        scope.data.End = event.end.format(format);

						        scope.modal.$setDirty();

					        };

					    // If this is a new class, pre-fill the reserved seats with 0
					    if (isNew) {

						    scope.data.UnitId = $scope.unit.Id;
						    scope.data.Host = 0;
						    scope.data.Other = 0;

					    }

					    // Some init settings for FullCalendar
					    scope.uiConfigInstructor = {

						    'weekends'     : false,
						    'allDayDefault': true,
						    'header'       : {
							    'left'  : 'title',
							    'center': '',
							    'right' : 'today prev,next'
						    },

						    'buttonText': {
							    today: 'Go to Today'
						    },

						    'eventResize': update,

						    'eventDrop': update,

						    'dayClick': function (start) {

							    if (scope.data.CourseId) {

								    var course = caches.MasterCourseList[scope.data.CourseId] ||
								                 {'Days': 1},

								        end = start.clone();

								    while (course.Days > 0) {

									    if (end.isoWeekday() < 6) {
										    course.Days -= 1;
									    }

									    end.add(1, 'days');

								    }

								    scope.data.Start = start.toISOString();
								    scope.data.End = end.toISOString();

								    scope.modal.$setDirty();

								    scope.eventsInstructor[0] = [getDates()];

							    }

						    }
					    };

					    // Set the default calendar location if this is an existing class
					    if (scope.data.Start) {
						    scope.uiConfigInstructor.defaultDate = scope.data.Start;
					    }

					    // Setup uour empty calendar for FullCalendar
					    scope.eventsInstructor = [];

					    // Monitors the InstructorId to load their teaching schedule
					    scope.$watch('data.InstructorId', function (instructor) {

						    // If we have selected an instructor, try to get their teaching schedule
						    if (instructor) {

							    // Filter out only classes taught by this instructor
							    var schedule = _.filter($scope.rawSchedule, {'InstructorId': instructor}),

							        // Produce the array that FullCalendar expects
							        result = _.map(schedule, function (row) {

								        return {
									        'title'    : row.CourseId ? caches.MasterCourseList[row.CourseId].PDS : 'UNAVAILABLE',
									        'start'    : row.Start,
									        'end'      : row.End,
									        'className': 'info'
								        }

							        });

							    // Only add valid dates otherwise FullCalendar will just implode....
							    getDates() && result.push(getDates());

							    // update the event source for the calendar
							    scope.eventsInstructor[0] = result;

						    } else {

							    var thisClass = getDates();

							    // Make sure we remove any old events
							    scope.eventsInstructor[0] = thisClass ? [thisClass] : [];

						    }

					    });

					    /**
					     * Get Open Seats, performs live counting of remaining seat openings in modals
					     *
					     * @returns
					     */
					    scope.getOpenSeats = function (countOnly) {

						    // Only attempt this if a CourseID exists
						    if (scope.data.CourseId > 0) {

							    var requests = _(scope.data.Requests_JSON).reduce(function (count, request) {

								        // Only count seats pending (1) or approved (2) against total
								        return  (request[0] < 3) ? count + request[1].length : count;

							        }, 0),

							        open = (caches.MasterCourseList[scope.data.CourseId].Max -
							                (scope.data.Host || 0) -
							                (scope.data.Other || 0) -
							                requests);

							    return countOnly ? open :

							           open < 0 ? 'Overbooked by ' + Math.abs(open) :

							           open > 0 ? open + ' Open Seats' :

							           'Class Full';

						    } else {

							    return '';

						    }

					    };

					    scope.data.requests = utils.requestDecode(scope.data.Requests_JSON);

				    }

			    })
				;

			// Bind the seat request function
			$scope.request = utils.requestSeats($scope, $modal, SharePoint);

			self

				.bind('filter')

				.then(function (data) {

					      // Load our unit data based on the dropdown
					      $scope.unit = angular.copy(caches.Units[parseInt($scope.filter.match(/\d+/)[0])]);

					      // Add our fake "instructor unavailable placeholder
					      $scope.unit.Courses.unshift(
						      {
							      'Id'   : -1,
							      'label': '<div><h5>*** Instructor Unavailable to Teach ***</h5></div>'
						      });

					      // Bind the unit.courses to coursesDropdown for selectize
					      $scope.coursesDropdown = $scope.unit.Courses;

					      // Bind the filtered instructor list for this unit
					      $scope.instructorDropdown = _.filter(angular.copy(caches.Instructors),
					                                           {'UnitId': $scope.unit.Id});

					      // Get a copy of the data into rawSchedule for showing in modal
					      $scope.rawSchedule = _.reject(angular.copy(data), 'Archived');

					      // We can always request in this view
					      $scope.canRequest = true;

					      // Finish data binding and processing
					      self.initialize(data).then(utils.processScheduledRow);

				      });

		}
	])
;
