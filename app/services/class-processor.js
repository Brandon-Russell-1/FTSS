/*global FTSS */

FTSS.ng.service('classProcessor', [

	'dateTools',

	function (dateTools) {

		"use strict";

		var _statusMap = [
			    '',
			    'Pending',
			    'Approved',
			    'Denied'
		    ],

		    _statusClass = [
			    '',
			    'info',
			    'success',
			    'danger'
		    ],

		    _lastWeek = moment().add(-1, 'weeks'),

		    _self = this;

		this.requestEncode = function (requests) {

			return _.map(requests, function (request) {

				return [
					// Status
					_statusMap.indexOf(request.status),

					// Students Array
					request.students,

					// Notes
					request.notes,

					// Host ID
					caches.Hosts.indexOf(request.unit)

				];

			});

		};

		this.requestDecode = function (requests) {

			return _.map(requests, function (request) {

				return {

					'unit': caches.Hosts[request[3]],

					'status': _statusMap[request[0]],

					'statusClass': _statusClass[request[0]],

					'notes': request[2],

					'response': request[4],

					'students': request[1]

				}

			});

		};


		/**
		 * Cache Filler adds any missing cache lookups
		 *
		 * @param row
		 */
		this.cacheFiller = function (row) {

			// Try to add the course data
			row.Course = caches.MasterCourseList[row.CourseId] || {};

			// Try to add the FTD
			row.FTD = caches.Units[row.UnitId] || {};

			// Try to add the host unit data
			row.HostUnit = caches.Hosts[row.HostId] || {};

			// Try to add the instructor data
			row.Instructor = caches.Instructors[row.InstructorId] || {};

			// Add course data for TS
			if (row.TS) {
				row.Course = {
					'PDS'   : 'TS',
					'Number': row.TS
				}
			}

			// The TTMS friendly link for this class
			row.ttmsLink = row.Course && row.TTMS ? row.Course.Number + row.TTMS : '';

			dateTools.dateRange(row);

			// In case of invalid data, we'll do something about it
			if (!row.Course.Id && !row.TS && !row.NA) {
				row.Archived = true;
				return;
			}

			row.approvedSeats = 0;
			row.pendingSeats = 0;
			row.deniedSeats = 0;
			row.requestCount = 0;

			_.each(row.Requests_JSON, function (r) {

				row[['', 'pending', 'approved', 'denied'][r[0]] + 'Seats'] += r[1].length;
				row.requestCount += r[1].length;

			});

			row.allocatedSeats = row.approvedSeats + row.Host + row.Other;
			row.openSeats = row.Course.Max ? row.Course.Max - row.allocatedSeats : '';

		};

		this.processRow = function (row) {

			// For fake courses (unavalability events), we only need to load a few pieces of data
			if (row.NA) {

				// Add our class for this event
				row.className = 'ignore';

				// Try to load the instructor's data
				row.Instructor = caches.Instructors[row.InstructorId] || {};

				// Calculate the start time
				row.startMoment = dateTools.startDayFinder(row.Start);

				// Calculate the end time
				row.endMoment = row.startMoment.clone().add(row.Days - 1, 'days');

				// Setup the search params
				row.search = [
					row.Instructor.InstructorName,
					'unavailable',
					row.startMoment.format('MMMM'),
					row.ClassNotes
				].join(' ');

			} else {

				// Run through the cacheFiller
				_self.cacheFiller(row);

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
				row.Archived = row.Archived || row.endMoment.isBefore(_lastWeek);

				// Hide the J4 notes if they have the leading #
				row.J4Notes = (row.J4Notes && row.J4Notes[0] === '#') ? '' : row.J4Notes;

			}

		};

	}

]);