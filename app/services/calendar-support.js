FTSS.ng.service('calendarSupport', [

	'dateTools',

	function (dateTools) {

		"use strict";

		return function (scope) {

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
							       'end'             : scope.data.endMoment.clone(),
							       'className'       : 'success',
							       'editable'        : true,
							       'durationEditable': true,
							       'allDay'          : true
						       }
					       ]

						: [];

				},

			// Wait for modal init
				setupInit = false,

			// Perform our date updates
				update = function (event) {

					/**
					 *
					 * This is the best hack we can do for now as FC is not respecting local-only
					 * (ambiguous date ranges) as it should.  Basically we let moment fix it for us
					 * to prevent FC from generating UTC-based time that were breaking day calculations
					 *
					 * @type {string}
					 */
					var format = 'YYYY-MM-DD',
						start = moment(event.start.format(format), format),
						end = moment(event.end.format(format), format);

					// Get the start date
					scope.data.startMoment = start;

					// Update the model's start date
					scope.data.Start = dateTools.startDayCreator(start);

					// Update our end date for the modal view
					scope.data.endMoment = end;

					// Get the number of days
					scope.data.Days = end.diff(start, 'days');

					// Let the view know of our changes
					scope.$$childTail.modal.$setDirty();

				};

			// Setup our empty calendar for FullCalendar
			scope.eventsInstructor = [];

			// Monitors the InstructorId to load their teaching schedule
			scope.$watch('data.InstructorId', function (instructor) {

				scope.bioPhoto = (caches.Instructors[instructor] || {}).Photo;

				// If we have selected an instructor, try to get their teaching schedule
				if (instructor) {

					// Build this instructor schedule and add it to the first calendar
					scope.eventsInstructor[0] =

						_(scope.rawSchedule)

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
									     'end'      : row.endMoment,
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

			// Enable toggling of weekend visibility
			scope.$watch('showWeekends', function () {

				// Wait until the modal is ready
				if (typeof scope.showWeekends !== 'boolean') return;

				// Remember this setting
				localStorage.FTSS_FC_ShowWeekends = scope.showWeekends;

				// Init our calendar
				FTSS.initInstructorCalendar(
					{

						'weekends': scope.showWeekends,

						'allDayDefault': true,

						'header': {
							'left'  : 'title',
							'center': '',
							'right' : 'today prev,next'
						},

						// Default to the start of the event or try to get the last created event's start date
						'defaultDate': scope.data.startMoment || moment(localStorage.FTSS_FC_Last_Date || moment()),

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
							if (scope.isNew &&
							    (scope.data.Course || scope.data.NA || scope.data.TS)) {

								// copy the days
								var days = Number((scope.data.Course || {}).Days || 1),

								// get the end date
									end = start.clone();

								// loop through the days, skipping weekends
								while (days > 0) {

									// Only count this day if it is a weekday and not a down day
									!dateTools.isWeekend(end) && !dateTools.isDownDay(end) && days--;

									// Add a day to our range
									end.add(1, 'days');

								}

								// Update the model and notify the view
								update({
									'start': start,
									'end'  : end
								});

								// Add the updated event back to the calendar
								scope.eventsInstructor[2] = getDates();

								// Remember the start of the last event created
								localStorage.FTSS_FC_Last_Date = start.toISOString();

							}

						}
					});

			});


			// Wait until the modal is visible
			scope.$on('modal.show', function () {

				setupInit = true;
				scope.showWeekends = localStorage.FTSS_FC_ShowWeekends === 'true';

			});

		}

	}

]);