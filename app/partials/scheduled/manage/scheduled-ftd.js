/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduled-ftdController',

	[
		'$scope',
		'notifier',
		'dateTools',
		'classProcessor',
		'controllerHelper',
		'utilities',
		'security',
		function ($scope, notifier, dateTools, classProcessor, controllerHelper, utilities, security) {

			// Increase the default page limit to 100 for this view
			$scope.pageLimit = 100;

			$scope.ftd ? getSchedule() : utilities.addAsync(getSchedule);

			function getSchedule() {

				var //unitId = $scope.ftd.Id, // || parseInt($scope.filter.match(/\d+/)[0]),

					self = controllerHelper($scope, {

						'sort'          : 'startMoment',
						'group'         : 'Instructor.InstructorName',
						'model'         : 'scheduled',
						'modalPlacement': 'wide',
						'noEmptyGroup'  : true,

						'filter': 'UnitId eq ' + $scope.ftd.Id,

						'beforeSubmit': function (scope, isNew) {

							// For creating instructor unavailability
							if (scope.data.NA) {

								delete scope.data.Host;
								delete scope.data.Other;
								delete scope.data.CourseId;

							} else {

								var newVal = scope.data,

								    oldVal = self.data[newVal.Id] || {};

								if (!isNew && scope.data.TTMS) {

									switch (true) {

										// Course start/end days have changed
										case(oldVal.Start !== newVal.Start):
										case(oldVal.Days !== newVal.Days):
											classProcessor.cacheFiller(newVal);
											scope.data.oldDateRange = oldVal.dateRange;
											notifier.updateClass(scope.data);
											break;

										// Course is archived for the first time
										case (!oldVal.Archived && newVal.Archived):
											notifier.cancelClass(scope.data);


									}

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
								    var title = scope.data.NA ? 'UNAVAILABLE' : 'THIS COURSE';

								    return scope.data.startMoment &&
								           scope.data.startMoment.isValid() ?

								           [
									           {
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
								    scope.data.Start = dateTools.startDayCreator(event.start);

								    // Update our end date for the modal view
								    scope.data.endMoment = event.end;

								    // Get the number of days
								    scope.data.Days = event.end.diff(event.start, 'days') + (event.offset || 0);

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
									scope.eventsInstructor[0] =

									_($scope.rawSchedule)

										// Limit to just this instructor
										.filter({'InstructorId': instructor})

										// Do not include the current class in this list
										.reject({'Id': scope.data.Id})

										// Convert to a FullCalender-friendly dataset
										.map(function (row) {

											     return {
												     'title': row.CourseId ?
												              caches.MasterCourseList[row.CourseId].PDS :
												              'UNAVAILABLE',

												     'start'    : row.startMoment,
												     'end'      : row.endMoment.clone().add(1, 'days'),
												     'className': 'info'
											     }

										     })

										.value() || [];

								} else {

									// Make sure we remove any old events
									scope.eventsInstructor[0] = [];

								}

								// Add our down days and holidays to a different calendar
								scope.eventsInstructor[1] = dateTools.downDays;

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

									// Update the course for this model
									scope.data.Course = caches.MasterCourseList[scope.data.CourseId];

									var requests = _(scope.data.Requests_JSON).reduce(function (count, request) {

										    // Only count seats pending (1) or approved (2) against total
										    return (request[0] < 3) ? count + request[1].length : count;

									    }, 0),

									    open = (scope.data.Course.Max -
									            (scope.data.Host || 0) -
									            (scope.data.Other || 0) -
									            requests);

									return countOnly ? open :

									       open < 0 ? 'Overbooked by ' + Math.abs(open) :

									       open > 0 ? open + ' Open Seats' :

									       'Class Full';

								} else {

									scope.data.Course = {
										'Days': 'n/a',
										'Max' : 0,
										'Min' : 0
									};

									scope.data.Hours = null;

									return '';

								}

							};

							scope.data.requests = classProcessor.requestDecode(scope.data.Requests_JSON);

							// Wrap this in a closure simply for organization--we'll probably move out of here later on
							(function () {

								// Short-hand/field equivalent to our recordTypes list
								var records = ['rc', 'mtt', 'ts', 'na'];

								scope.recordTypes = [
									'Regular Class',
									'Mobile Training Team',
									'Training Session',
									'Leave/TDY/Etc'
								];

								// Our shortcut helpers for building different types of classes
								scope.selectType = function () {

									// Get our current index for this selection
									var record = getRecordIndex();

									// Reset our fields
									records.forEach(function (record) {

										scope.data[record] = false;
										scope.data[record.toUpperCase()] = null;

									});

									// Call our selectize Instance
									(record > 1) && FTSS.selectizeInstances['data.CourseId'].setValue(-1);

									if (record === 3) {
										scope.data.NA = true;
									}

									// Mark our current recordType as true
									scope.data[records[record]] = true;

								};

								// Set the current recordType
								scope.recordType = scope.recordTypes[

									// Regular class for new items
									isNew ? 0 :

										// MTT
									scope.data.MTT ? 1 :

										// Training Session
									scope.data.TS ? 2 :

										// Leave/TDY, otherwise regular class
									scope.data.NA ? 3 : 0

									];

								// Setup for our current config
								scope.data[records[getRecordIndex()]] = true;

								function getRecordIndex() {
									return scope.recordTypes.indexOf(scope.recordType);
								}

							}());

							// Wait until the modal is visible
							scope.$on('modal.show', function () {

								// Init our calendar
								FTSS.initInstructorCalendar(
									{

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

											// Only continue if this is a new and has a course selected
											if (isNew &&
											    (scope.data.Course || scope.data.na || scope.data.TS)) {

												// copy the days
												var days = Number(scope.data.Course.Days || 1),

												    // get the end date
												    end = start.clone();

												// loop through the days, skipping weekends
												while (days > 1) {

													// Add a day to our range
													end.add(1, 'days');

													// Only count this day if it is a weekday and not a down day
													!datetools.isDownDay(end) && days--;

												}

												// Update the model and notify the view, added offset for strange day count issue--needs another look later on
												update({
													       'start' : start,
													       'end'   : end,
													       'offset': 1
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

				self.bind().then(function (data) {

					$scope.canEdit = security.hasRole(['ftd', 'scheduling']);

					// Load our unit data based on the dropdown
					$scope.unit = angular.copy(caches.Units[$scope.ftd.Id]);

					// Bind the unit.courses to coursesDropdown for selectize
					$scope.coursesDropdown = $scope.unit.Courses;

					// Bind the filtered instructor list for this unit
					$scope.instructorDropdown = _.filter(angular.copy(caches.Instructors),
					                                     {'UnitId': $scope.unit.Id});

					// We can always request in this view
					$scope.canRequest = true;

					// Finish data binding and processing
					self.initialize(data).then(classProcessor.processRow);

					// Get a copy of the data into rawSchedule for showing in modal
					$scope.rawSchedule = _.reject(angular.copy(data), 'Archived');
				});

			}

		}
	])
;
