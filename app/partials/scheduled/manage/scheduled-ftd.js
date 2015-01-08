/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduled-ftdController',

	[
		'$scope',
		'$modal',
		'SharePoint',
		function ($scope, $modal, SharePoint) {

			// Increase the default page limit to 100 for this view
			$scope.pageLimit = 100;

			var self = FTSS.controller($scope, {

				'sort'          : 'startMoment',
				'group'         : 'Instructor.InstructorName',
				'model'         : 'scheduled',
				'modalPlacement': 'wide',

				'beforeSubmit': function (scope, isNew) {

					// For creating instructor unavailability
					if (isNew && scope.data.CourseId < 0) {

						delete scope.data.Host;
						delete scope.data.Other;
						delete scope.data.CourseId;

						scope.data.TTMS = '*';

					} else {

						var newVal = scope.data,

						    oldVal = self.data[newVal.Id] || {};

						switch (true) {

							// Course start/end days have changed
							case(oldVal.Start !== newVal.Start):
							case(oldVal.Days !== newVal.Day):
/*

								FTSS.utils.sendEmail(
									{
										'to'     : FTSS.J4Email,
										'subject': 'Scheduled Class Change',
										'body'   : ''

									});
*/

								break;

							// Course is archived for the first time
							case (!oldVal.Archived && newVal.Archived):

								break;

						}

					}

				},

				/**
				 * This is our modal dialog used for editing existing classes as well as building new classes
				 * @param scope
				 * @param isNew
				 */
				'edit': function (scope, isNew) {

					// Bind isNew to scope for stupid green button crap
					scope.isNew = isNew;

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

					    },

					    hoursOverride = scope.data.Hours;

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
							scope.eventsInstructor[0] =

							_($scope.rawSchedule)

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

					// Update our data to match the new course
					scope.$watch('data.CourseId', function (id) {

						// If this is a valid course only
						if (id > 0) {

							var course = caches.MasterCourseList[id] || {};

							// We are binding this to scope vs scope.data since it isn't a part of the SP data (just a local thing)
							scope.AcademicDays = course.Days || '-';

							// Just overwrite whatever the user specified since they changed courses
							scope.data.Hours = hoursOverride || course.Hours;

						}

					});

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

									if (isNew && scope.data.CourseId > 0) {

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
											if (end.isoWeekday() < 6 &&
											    downDays.indexOf(end.format('YYYY-MM-DD')) < 0) {
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

			});

			/**
			 * This is a helper to default to searching for only the next three months of scheduled classes.
			 * The idea is to give the scheduler a more manageable set of data to work with.
			 */
			if (!$scope.searchText.$) {

				var format = 'MMMM',

				    month = moment();

				// Type the next three months as a search criteria, i.e. "January or February or March"
				$scope.searchText.$ = [
					month.format(format),
					month.add(1, 'months').format(format),
					month.add(1, 'months').format(format),
				].join(' or ');

			}

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
