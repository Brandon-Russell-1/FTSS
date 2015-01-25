/*global utils */

/**
 *
 */
(function () {

	"use strict";

	var statusMap = [
		    '',
		    'Pending',
		    'Approved',
		    'Denied'
	    ],

	    statusClass = [
		    '',
		    'info',
		    'success',
		    'danger'
	    ],

	    lastWeek = moment().add(-1, 'weeks');

	utils.requestEncode = function (request) {


	};

	utils.requestDecode = function (requests) {

		return _.map(requests, function (request) {

			return {

				'unit': caches.Hosts[request[3]],

				'status': statusMap[request[0]],

				'statusClass': statusClass[request[0]],

				'notes': request[2],

				'response': request[4],

				'students': request[1]

			}

		});

	};

	utils.requestSeats = function ($scope, $modal, self) {

		return function (row) {

			if ($scope.canRequest && row.openSeats > 0 || $scope.autoApprove) {

				var scope = $scope.$new();

				scope.data = row;

				scope.data.Students = [];

				scope.close = $modal(
					{

						'scope'          : scope,
						'backdrop'       : 'static',
						'contentTemplate': '/partials/modal-request-seats.html'

					}).destroy;

				scope.submit = function () {

					if (!$scope.autoApprove) {

						// Send our email notification to the FTD
						utils.sendEmail(
							{
								'to'     : row.FTD.Email,
								'subject': 'New Seat Request for ' + row.Course.PDS,
								'body'   : caches.Hosts[scope.data.HostId].Unit +
								         ' has requested ' +
								         scope.data.Students.length +
								         ' seats for the ' +
								         row.dateRange +
								         ' class:' +
								         '\n\n' + scope.data.Students.join('\n') +
								         '\n\n' + scope.data.Notes
							});

					}

					row.Requests_JSON = row.Requests_JSON || [];

					row.Requests_JSON.push(
						[
							// Status
							scope.autoApprove ? 2 : 1,

							// Students Array
							scope.data.Students,

							// Notes
							scope.data.Notes,

							// Host ID
							scope.data.HostId
						]);

					self._update(scope, {

						'cache'        : true,
						'__metadata'   : row.__metadata,
						'Requests_JSON': row.Requests_JSON

					}, scope.close);

				};
			}
		};

	};

	utils.processScheduledRow = function (row) {

		// For fake courses (unavalability events), we only need to load a few pieces of data
		if (!row.CourseId || row.CourseId < 1) {

			// Make sure the CourseId is -1, it will be null coming from the server
			row.CourseId = -1;

			// Add our class for this event
			row.className = 'ignore';

			// Try to load the instructor's data
			row.Instructor = caches.Instructors[row.InstructorId] || {};

			// Only search by instructor name + unavailable
			row.search = row.Instructor.InstructorName + ' unavailable';

			// Calculate the start time
			row.startMoment = utils.startDayFinder(row.Start);

			// Calculate the end time
			row.endMoment = row.startMoment.clone().add(row.Days - 1, 'days');

		} else {

			// Run through the cacheFiller
			utils.cacheFiller(row);

			// Determine classes (color codes) based on openSeats
			row.className = row.openSeats > 0 ? 'success' :

			                row.openSeats < 0 ? 'danger' :

			                'warning';

			// Map the status to our colors codes
			row.availability = {
				'success': 'Open Seats',
				'warning': 'No Open Seats',
				'danger' : 'Seat Limit Exceeded'
			}[row.className];

			// Cleanup the TTMS presentation
			row.TTMSText = row.TTMS ? ' - ' + row.TTMS : '';

			row.title = [
				row.Course.PDS,
				row.Course.Number,
				row.TTMS || 'Pending Class #'
			].join(' - ');

			// Setup our search fields for this view
			row.search = [
				row.ClassNotes,
				row.Course.text,
				row.Instructor.InstructorName || 'needs instructor',
				row.TTMS,
				row.FTD.text,
				row.startMoment.format('MMMM')
			].join(' ');

			// Auto archive (in the view) older classes
			row.Archived = row.Archived || row.endMoment.isBefore(lastWeek);

			// The URL for our mailTo link
			row.mailFTD = row.FTD.Email +
			              '?subject=FTSS Class Inquiry for ' +
			              row.Course.PDS +
			              ' Class #' +
			              row.TTMS;

			// This is the hover image for each FTD
			row.map = 'https://maps.googleapis.com/maps/api/staticmap?' +
			          'sensor=false&size=400x300&zoom=5&markers=color:red|' +
			          row.FTD.Location.replace(/\s/g, '');

			// Hide the J4 notes if they have the leading #
			row.J4Notes =  (row.J4Notes && row.J4Notes[0] === '#') ? '' : row.J4Notes;

		}

	};

}());
