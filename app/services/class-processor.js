/*global FTSS */

FTSS.ng.service('classProcessor', [

	'dateTools',

	function (dateTools) {

		"use strict";

		var _self = this;


		this.csvExport = function () {

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

		};

		/**
		 * Generate bio photo for given object
		 * @param row
		 * @returns {string|*|bioPhoto}
		 */
		this.setupBioPhoto = function (row, link) {

			link = link || (row.Instructor || {}).Photo;

			row.bioPhoto = link ? FTSS.CDN + link + '.jpg' : '';

			return row.bioPhoto;

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

			_self.setupBioPhoto(row);

			// In case of invalid data, we'll do something about it
			if (!row.Course.Id && !row.TS && !row.NA) {
				row.Archived = true;
				return;
			}

			// Backwards-compatibility for classes built before this field was added
			row.Approved = row.Approved || 0;

			row.allocatedSeats = row.Approved + row.Host + row.Other;
			row.openSeats = row.Course.Max ? row.Course.Max - row.allocatedSeats : '';

		};

		/**
		 * Simple request cache filler
		 */
		this.requestProcessor = function (requests) {

			_.each(requests, function (row) {

				row.Host = caches.Hosts[row.HostId] || {};

				row.Unit = caches.Units[row.UnitId] || {};

				row.count = _.size(row.Students_JSON);

			});

			return requests;

		};

		this.processRow = function (row) {

			// For fake courses (unavalability events), we only need to load a few pieces of data
			if (row.NA) {

				// Add our class for this event
				row.className = 'ignore';

				// Try to load the instructor's data
				row.Instructor = caches.Instructors[row.InstructorId] || {};

				dateTools.dateRange(row);

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

				// Setup our search fields for this view
				row.search = [
					row.ClassNotes,
					row.Course.text,
					row.Instructor.InstructorName || 'needs instructor',
					row.TTMS,
					row.FTD.text,
					row.startMoment.format('MMMM')
				].join(' ');

				// Hide the J4 notes if they have the leading #
				row.J4Notes = (row.J4Notes && row.J4Notes[0] === '#') ? '' : row.J4Notes;

			}

		};

		this.getOpenSeats = function (data, countOnly) {

			// Only attempt this if a CourseID exists
			if (data.CourseId > 0) {

				// Update the course for this model
				data.Course = caches.MasterCourseList[data.CourseId];

				var open = data.Course.Max -
				           (data.Host || 0) -
				           (data.Other || 0) -
				           (data.Approved || 0);

				return countOnly ? open :

				       open < 0 ? 'Overbooked by ' + Math.abs(open) :

				       open > 0 ? open + ' Open Seats' :

				       'Class Full';

			} else {

				data.Course = {
					'Days': 'n/a',
					'Max' : 0,
					'Min' : 0
				};

				data.Hours = null;

				return '';

			}

		};

	}

]);