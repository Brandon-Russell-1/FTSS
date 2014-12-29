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

					        downDays = FTSS.utils.getDownDays(true),

					        // Check if this is a weekend, holiday or nothing
					        specialDay = function (day) {

						        return (day.isoWeekday() > 5) ? 'weekend' :

						               (downDays.indexOf(day.format('YYYY-MM-DD')) > -1) ? 'downDay' : '';
					        };

					    // Make a flat copy of our data for date range detection
					    _(data).each(function (group, index) {
						    events = events.concat(group);
					    });

					    // Get the earliest start date, minus three days
					    min = moment(Math.min.apply(Math, _.pluck(events, 'startMoment'))).add(-1, 'days');

					    // Get the latest end date, plus three days
					    max = moment(Math.max.apply(Math, _.pluck(events, 'endMoment'))).add(1, 'days');

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

						    dayBase.push(specialDay(minClone));

						    $scope.resourceDays += [

							    '<th class="',
							    specialDay(minClone),
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
								                       event.Days + '" id="' + event.Id +
								                       '"><div class="details italics">' + (event.ClassNotes || '') +
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

								                       _.template($templateCache.get('/partials/calendar-event.html'),
								                                  event) +
								                       '</td>';

							    }

							    // Increment the day counter
							    count += event.Days;

						    });

						    // map our instructor's name
						    instructor.name = instructor[0].Instructor.InstructorName;

						    // Bind the edit function (single click in this case)
						    instructor.edit = function () {

							    // Dirty hack to get the current class without a million extra data binds
							    var row = _.find(instructor, {Id: parseInt($('td:hover').attr('id'))});

							    // complete binding to the edit action with our data
							    row && $scope.edit.apply({'row': row});

						    };

						    createTDs(max.diff(min, 'days'));

						    $scope.instructors.push(instructor);

					    });

					    // Sort by instructor name
					    $scope.instructors = _.sortBy($scope.instructors, 'name');
					    $scope.resourceMonths = _.sortBy(months, 'sort');

				    },

				    'beforeSubmit': function (scope, isNew) {

					    // For creating instructor unavailability
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

						        return scope.data.startMoment &&
						               scope.data.startMoment.isValid() ?

						               [{
							                'title'           : title,
							                'start'           : scope.data.startMoment,
							                'end'             : scope.data.endMoment.clone().add(1, 'days'),
							                'className'       : 'success',
							                'editable'        : true,
							                'durationEditable': true,
							                'allDay'          : true
						                }
						               ]

							        : [];

					        },

					        // Perform our date updates
					        update = function (event) {

						        // Get the start date
						        scope.data.startMoment = event.start;

						        // Update the model's start date
						        scope.data.Start = event.start.format('YYYY-MM-DD');

						        // Update our end date for the modal view
						        scope.data.endMoment = event.end;

						        // Get the number of days
						        scope.data.Days = event.end.diff(event.start, 'days');

						        // Let the view know of our changes
						        scope.modal.$setDirty();

					        };

					    // If this is a new class, pre-fill the reserved seats with 0
					    if (isNew) {

						    scope.data.UnitId = $scope.unit.Id;
						    scope.data.Host = 0;
						    scope.data.Other = 0;

					    }

					    // Setup uour empty calendar for FullCalendar
					    scope.eventsInstructor = [];

					    // Monitors the InstructorId to load their teaching schedule
					    scope.$watch('data.InstructorId', function (instructor) {

						    // If we have selected an instructor, try to get their teaching schedule
						    if (instructor) {

							    // Build this instructor schedule and add it to the first calendar
							    scope.eventsInstructor[0] = _($scope.rawSchedule)

								                                // Limit to just this instructor
								                                .filter({'InstructorId': instructor})

								                                // Do not include the current class in this list
								                                .reject({'Id': scope.data.Id})

								                                // Convert to a FullCalender-friendly dataset
								                                .map(function (row) {

									                                     return {
										                                     'title': (caches.MasterCourseList[row.CourseId] ||
										                                               {}).PDS ||
										                                     'UNAVAILABLE',
										                                     'start': row.startMoment,
										                                     'end': row.endMoment.clone().add(1,
										                                                                      'days'),
										                                     'className': 'info'
									                                     }

								                                     })

								                                .value() || [];

						    } else {

							    // Make sure we remove any old events
							    scope.eventsInstructor[0] = [];

						    }

						    // Add our down days and holidays ot a different calendar
						    scope.eventsInstructor[1] = FTSS.utils.getDownDays();

						    // Finally, add our current class to a third calendar
						    scope.eventsInstructor[2] = getDates();

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
								        return (request[0] < 3) ? count + request[1].length : count;

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

					    // Our shortcut helpers for building different types of classes
					    scope.shortcut = function (shortcut) {

						    switch (shortcut) {

							    // Create a leave/tdy/cto unavailable date range
							    case 0:
								    FTSS.selectizeInstances.CourseId.setValue(-1);
								    break;

							    // Create historical data
							    case 1:
								    scope.data.TTMS = 'OLD';
								    break;

							    // Create a training session
							    default:
								    scope.data.TTMS = 'TS';


						    }

					    };

					    // Wait until the modal is visible
					    scope.$on('modal.show', function () {

						    // Init our calendar
						    FTSS.utils.initInstructorCalendar(
							    {

								    'weekends'     : false,
								    'allDayDefault': true,
								    'header'       : {
									    'left'  : 'title',
									    'center': '',
									    'right' : 'today prev,next'
								    },

								    'defaultDate': scope.data.startMoment,

								    'buttonText': {
									    today: 'Go to Today'
								    },

								    'eventResize': update,

								    'eventDrop': update,

								    /**
								     * This is what auto-calculates our course length
								     * @param start
								     */
								    'dayClick': function (start) {

									    if (scope.data.CourseId > 0) {

										    // Reference the course
										    var course = caches.MasterCourseList[scope.data.CourseId] || {},

										        // copy the days
										        days = Number(course.Days || 1),

										        // get the end date
										        end = start.clone(),

										        downDays = FTSS.utils.getDownDays(true);

										    // loop through the days, sipping weekends
										    while (days > 1) {

											    // Add a day to our range
											    end.add(1, 'days');

											    // Only count this day if it is a weekday and not a down day
											    if (end.isoWeekday() < 6 && downDays.indexOf(end.format('YYYY-MM-DD')) < 0) {
												    days -= 1;
											    }

										    }

										    // Update the model and notify the view
										    update({
											           'start': start,
											           'end'  : end
										           });

										    // Add the updated event back to the calendar
										    scope.eventsInstructor[2] = getDates();

									    }

								    }
							    });

					    });

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

					      // We can always request in this view
					      $scope.canRequest = true;

					      // Finish data binding and processing
					      self.initialize(data).then(utils.processScheduledRow);

					      // Get a copy of the data into rawSchedule for showing in modal
					      $scope.rawSchedule = _.reject(angular.copy(data), 'Archived');
				      });

		}
	])
;
