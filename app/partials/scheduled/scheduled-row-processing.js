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
