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
		if (row.NA) {

			// Add our class for this event
			row.className = 'ignore';

			// Try to load the instructor's data
			row.Instructor = caches.Instructors[row.InstructorId] || {};

			// Calculate the start time
			row.startMoment = utils.startDayFinder(row.Start);

			// Calculate the end time
			row.endMoment = row.startMoment.clone().add(row.Days - 1, 'days');

			// Setup the search params
			row.search = [
				row.Instructor.InstructorName ,
				'unavailable',
				row.startMoment.format('MMMM'),
				row.ClassNotes
			].join(' ');

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

			// Hide the J4 notes if they have the leading #
			row.J4Notes =  (row.J4Notes && row.J4Notes[0] === '#') ? '' : row.J4Notes;

		}

	};

}());
