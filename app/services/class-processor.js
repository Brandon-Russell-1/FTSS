/*global FTSS */

FTSS.ng.service('classProcessor', [

	'utilities',
	'dateTools',
	'SharePoint',
	'$q',

	/**
	 * @name classProcessor
	 */
		function (utilities, dateTools, SharePoint, $q) {

		var _self = this;

		/**
		 * Perform data aggregation of classes & instructor availabilitiy
		 *
		 * @name classProcessor#interleaveRequest
		 * @param {ControllerHelper} self
		 * @param {Scope} $scope
		 * @param {Boolean} isFTD
		 * @returns {Promise}
		 */
		this.interleaveRequest = function (self, $scope, isFTD) {

			// Use $q.defer for promise-style callback
			var defer = $q.defer(),

			// THe combined collection of data
				collection = {},

			// THe model for getting instructor availability
				unavailableModel = FTSS.models('unavailable'),

				count = 0;

			unavailableModel.params.$filter = [
				'Start gt ' + dateTools.startDayCreator(-3),
				'UnitId eq ' + $scope.ftd.Id
			].join(' and ');

			isFTD && unavailableModel.params.$select.push('Notes');

			// Execute availability SP call
			SharePoint.read(unavailableModel).then(dataCombiner);

			// Execute schedule class SP call
			self.bind().then(dataCombiner);

			// Return our promise
			return defer.promise;

			/**
			 * Perform data grouping of class/unavailability
			 * @param data
			 */
			function dataCombiner(data) {

				count++;

				// Add each row to the collection
				_.each(data, function (row) {
					// Give us a unique index based off of list(Id) format
					collection[row.__metadata.uri.split('/').pop()] = row;
				});

				// On the second run, fire completion
				if (count > 1) {

					// We use async to make sure everything else is loaded (caches/security)
					utilities.addAsync(function () {

						// Fire our then() callback
						defer.resolve(collection);

						// Delete classes that ended more than 30 days aga
						utilities.purgeOldClasses(collection, 3);

						// Finish data binding and processing
						self.initialize(collection).then(_self.processRow);

						// Get a copy of the data into rawSchedule for showing in modal
						$scope.rawSchedule = angular.copy(collection);

					});

				}

			}

		};

		/**
		 * Performs conversion of scheduled class data from JSON to a downloadable CSV file
		 *
		 * @name classProcessor#csvExport
		 */
		this.csvExport = function () {

			var scope = this,

				csvData = (function () {

					var csv = [];

					_.each(scope.groups, function (group) {

						_.each(group, function (row) {

							row.Course = row.Course || {};

							csv.push({
								'MDS'              : row.Course.MDS || '',
								'PDS'              : row.Course.PDS || '',
								'Number'           : row.Course.Number || '',
								'IMDS'             : row.Course.IMDS || '',
								'G081'             : row.Course.G081 || '',
								'Title'            : row.Course.Title || '',
								'TTMS'             : row.TTMS || '',
								'Start/Grad Roster': row.TTMSLink || '',
								'Instructor'       : row.name || '',
								'Hours'            : row.Hours || row.Course.Hours || '',
								'Dates'            : row.dateRange,
								'Host'             : row.Host || 0,
								'Other'            : row.Other || 0,
								'Total Seats'      : row.allocatedSeats || 0,
								'Min'              : row.Course.Min || '',
								'Max'              : row.Course.Max || '',
								'Room'             : row.Location || '',
								'Notes'            : row.ClassNotes,
								'J4 Notes'         : row.J4Notes

							});

						})

					});

					return new CSV(csv, {header: true}).encode();

				}()),

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

		/**
		 * Cache Filler adds any missing cache lookups
		 *
		 * @name classProcessor#cacheFiller
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

			row.etca = row.Course && row.TTMS ?
			           'https://www.my.af.mil/etcacourses/showcourse.asp?as_course_id=' + row.Course.Number :
			           '';

			// Add course data for TS
			if (row.TS) {
				row.Course = {
					'PDS'   : 'TS',
					'Number': row.TS
				}
			}

			dateTools.dateRange(row);

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
		 *
		 * @name classProcessor#requestProcessor
		 */
		this.requestProcessor = function (requests) {

			return _.map(requests, _self.singleRequestProcess);

		};

		/**
		 * Re-decorate our request item with cache/style/count info
		 *
		 * @name classProcessor#singleRequestProcess
		 * @param {Object} request
		 * @returns {Object} request
		 */
		this.singleRequestProcess = function (request) {

			// Get the Host info from cache
			request.Host = caches.Hosts[request.HostId] || {};

			// Get the FTD info from cache
			request.Unit = caches.Units[request.UnitId] || {};

			// Get the number of students
			request.count = _.size(request.Students_JSON);

			// Add classes for the current status
			request.style = {
				'Approved' : 'text-success',
				'Pending'  : 'text-info',
				'Denied'   : 'text-danger',
				'Cancelled': 'text-muted'
			}[request.Status];

			// Format the request date
			request.date = moment(request.Created).format('D MMM YYYY');

			// Generate object for selectize directive (needed for editing lists)
			request.data = {

				'People'     : request.Students_JSON,
				'peopleCount': request.count

			};

			// Generate the left overlay if the Class data is present
			if (request.Class) {
				request.studentList = '<h5>Class #' + (request.Class.TTMS || ' Pending') + '</h5>' +
				                      '<em>' + _.keys(request.Students_JSON).join('</em><em>') + '</em>' +
				                      '<br><f>Requested: ' + request.date + '<br>By: ' + request.CreatedBy.Name + '</f>';
			}


			return request;

		};

		/**
		 * @name classProcessor#processRow
		 * @param row
		 */
		this.processRow = function (row, key) {

			row.Key = key;

			// For fake courses (unavalability events), we only need to load a few pieces of data
			if (row.__metadata.type === 'Microsoft.SharePoint.DataService.UnavailableItem') {

				row.NA = true;

				// Add our class for this event
				row.className = 'ignore';

				row.ClassNotes = row.Notes;

				// Try to load the instructor's data
				row.Instructor = caches.Instructors[row.InstructorId] || {};

				dateTools.dateRange(row);

				// Setup the search params
				row.search = [
					row.Instructor.Name,
					'unavailable',
					row.startMoment.format('MMMM'),
					row.ClassNotes,
					'#na'
				].join(' ');

			} else {

				// Run through the cacheFiller
				_self.cacheFiller(row);

				// Determine classes (color codes) based on openSeats
				row.className =

					row.MTT ? 'mtt' :

					row.TS ? 'trainingSession' :

					(row.allocatedSeats < row.Course.Min) ? 'short' :

					row.openSeats > 0 ? 'success' :

					row.openSeats < 0 ? 'danger' :

					'warning';

				// Setup our smart filters
				row.search = {
					'success'        : 'open',
					'warning'        : 'full',
					'danger'         : 'over',
					'short'          : 'under',
					'mtt'            : 'mtt',
					'trainingSession': 'ts'
				}[row.className];

				// Map the status to our colors codes
				row.availability = {
					'success': 'Open Seats',
					'warning': 'No Open Seats',
					'danger' : 'Seat Limit Exceeded'
				}[row.className];

				// The link to a TTMS start/grad roster
				row.TTMSLink = [
					'https://krpt.ttms.us.af.mil/TTMSReportsApp/wait.aspx',
					'?webTier=CSGR.dll&dbinstance=SMPRO&cbMaskID=F',
					'&Content=PDF&rtm=rptCSGR_PDS&rbSort=name&CLASS_SD=',
					row.Course.Number,
					row.TTMS,
					'     ',
					row.startMoment.format('DD/MMM/YYYY').toUpperCase()
				].join('');

				// Setup our search fields for this view
				row.search = [
					'#' + row.search,
					row.ClassNotes,
					row.Course.text,
					row.Instructor.Name || 'needs instructor',
					'ttms:' + row.TTMS,
					row.FTD.text,
					row.startMoment.format('MMMM YYYY'),
					'room:' + row.Location

				].join(' ');

				// Hide the J4 notes if they have the leading #
				row.J4Notes = (row.J4Notes && row.J4Notes[0] === '#') ? '' : row.J4Notes;

			}

			// Our processor for the left overlay list of courses
			row.shortDates =
				row.startMoment.format('M/D/YY') + ' - ' + row.endMoment.clone().add(-1, 'days').format('M/D/YY');

		};

		/**
		 * @name classProcessor#getOpenSeats
		 * @param data
		 * @param countOnly
		 * @returns {*}
		 */
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