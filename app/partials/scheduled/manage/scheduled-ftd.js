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
		'calendarSupport',
		function ($scope, notifier, dateTools, classProcessor, controllerHelper, utilities, security, calendarSupport) {

			$scope.ftss.searchPlaceholder =
				'Type here to search the schedule.  Examples: MDS:F-15, PDS:RFV, Robins, wire, 2A5*, March.';

			$scope.ftss.hasAlternateView = true;

			$scope.ftd ? getSchedule() : utilities.addAsync(getSchedule);

			function getSchedule() {

				var self = controllerHelper($scope, {

					'sort'          : 'startMoment',
					'group'         : 'Instructor.Name',
					'model'         : 'scheduled',
					'modalPlacement': 'wide',
					'noEmptyGroup'  : true,

					'filter': 'UnitId eq ' + $scope.ftd.Id,

					'beforeSubmit': function (scope, isNew) {

						// For creating instructor unavailability
						if (scope.data.NA) {

							var send = {

								'__metadata'  : scope.data.__metadata || 'Unavailable',
								'UnitId'      : scope.ftd.Id,
								'InstructorId': scope.data.InstructorId,
								'Start'       : scope.data.Archived ? 1 : scope.data.Start,
								'Days'        : scope.data.Days,
								'Notes'       : scope.data.Notes

							};

							if (isNew) {

								// Create our event on SP
								self._create(send, scope.close);

							} else {

								self._update(scope, send, scope.close);

							}

							// Do not do anything else with this data
							scope.modal.$dirty = false;

						} else {

							var newVal = scope.data,

								oldVal = self.data[newVal.Key] || {};

							dateTools.dateRange(scope.data);

							// Notify the instructor of their scheduled class
							isNew && notifier.createClass(scope.data);

							if (!isNew && scope.data.TTMS) {

								switch (true) {

									// Course start/end days have changed
									case(oldVal.Start !== newVal.Start):
									case(oldVal.Days !== newVal.Days):
										classProcessor.cacheFiller(newVal);
										scope.data.oldDateRange = oldVal.dateRange;
										notifier.updateClass(scope.data);

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

						// Short-hand/field equivalent to our recordTypes list
						var records = ['rc', 'mtt', 'ts', 'na'];

						// Bind isNew to scope for stupid green button crap
						scope.isNew = isNew;

						calendarSupport(scope);

						// If this is a new class, pre-fill the reserved seats with 0
						if (isNew) {

							scope.data.UnitId = $scope.unit.Id;
							scope.data.Host = 0;
							scope.data.Other = 0;

						}

						// For consistency in our bioPhoto directive
						scope.bioPhoto = (scope.data.Instructor || {}).Photo;

						/**
						 * Get Open Seats, performs live counting of remaining seat openings in modals
						 *
						 * @returns
						 */
						scope.getOpenSeats = function (countOnly) {

							return classProcessor.getOpenSeats(scope.data, countOnly);

						};

						scope.recordTypes = [
							'Regular Class',
							'Mobile Training Team',
							'Training Session',
							'Leave/TDY/Etc'
						];

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

						// Setup for our current config
						scope.data[records[getRecordIndex()]] = true;

						function getRecordIndex() {
							return scope.recordTypes.indexOf(scope.recordType);
						}


					}

				});

				classProcessor.interleaveRequest(self, $scope, true).then(function () {

					$scope.modalPlacement = 'wide';

					$scope.unavailable = function () {

						var scope = utilities.modal('modal-unavailable', $scope);

						scope.isNew = true;

						scope.data = {

							'NA'          : true,
							'Instructor'  : $scope.me,
							'InstructorId': $scope.me.Id,
							'UnitId'      : $scope.ftd.Id

						};

						scope.submit = function () {

							// Create our event on SP
							self._create({

								'cache'       : true,
								'__metadata'  : 'Unavailable',
								'UnitId'      : $scope.ftd.Id,
								'InstructorId': $scope.me.Id,
								'Start'       : scope.data.Start,
								'Days'        : scope.data.Days,
								'Notes'       : scope.data.Notes

							}, scope.close);

						};

						calendarSupport(scope);

					};

					/**
					 * Cancel event
					 */
					$scope.cancelEvent = function () {

						var scope = this;

						// We set the start day to 1 to indicate a cancellation
						self._update(scope, {
							'cache'     : true,
							'__metadata': scope.data.__metadata,
							'Start'     : 1
						}, function () {

							// If this is class with a TTMS & not a TS, send an email to J4 about this class
							scope.data.TTMS && !scope.data.TS && notifier.cancelClass(scope.data);

							// Remove from the model
							delete self.data[scope.data.Key];

							// Close the dialog
							scope.close();

						})

					};

					$scope.export = classProcessor.csvExport;

					// Identify editing rights
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

				});


			}

		}
	])
;
