/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		'notifier',
		'classProcessor',
		'controllerHelper',
		'security',
		'utilities',
		function ($scope, $modal, notifier, classProcessor, controllerHelper, security, utilities) {

			var self = controllerHelper($scope, {

				'sort' : 'Start',
				'group': 'CourseId',
				'model': 'scheduledSearch',

				'finalProcess': function (groups) {

					_.each(groups, function (group) {

						group.instructors = _.groupBy(group, 'InstructorId');

					});

				}

			});

			self

				.bind('ftss.filter')

				.then(function (data) {

					      $scope.autoApprove = security.hasRole(['ftd', 'scheduling']);

					      $scope.canEdit = $scope.canRequest =
					      security.hasRole(['mtf', 'ftd', 'scheduling']);

					      self.initialize(data).then(function (row) {

						      classProcessor.processRow(row);

						      // Hide full classes by default
						      row.Archived = (row.openSeats < 1);

						      // The URL for our mailTo link
						      row.mailFTD = row.FTD.Email +
						                    '?subject=FTSS Class Inquiry for ' +
						                    row.Course.PDS +
						                    ' Class #' +
						                    row.TTMS;

						      if (row.MTT) {

							      row.locationName = row.MTT;
							      row.locationCoords = caches.geodataFlat[row.MTT].toString()

						      } else {

							      row.locationName = row.FTD.LongName;
							      row.locationCoords = row.FTD.Location;

						      }

						      // This is the hover image for each FTD
						      row.map = row.locationCoords ?

						                'https://maps.googleapis.com/maps/api/staticmap?' +
						                'sensor=false&size=400x300&zoom=5&markers=color:red|' +
						                row.locationCoords.replace(/\s/g, '')

							      : '';

						      /**
						       * Allows J4/FTD members the ability to edit the Class # directly
						       *
						       * @type {Function}
						       */
						      row.updateTTMS = $scope.autoApprove ? function () {

							      var send = {
								      '__metadata': row.__metadata,
								      'TTMS'      : row.TTMS
							      };

							      self._update(row, send);

						      } : angular.noop;

						      row.request = function () {

							      if ($scope.canRequest && row.openSeats > 0 || $scope.autoApprove) {

								      var scope = $scope.$new();

								      scope.data = row;

								      scope.data.Students = [];

								      scope.close = $modal(
									      {

										      'scope'          : scope,
										      'backdrop'       : 'static',
										      'contentTemplate': '/partials/modal-scheduledSearch.html'

									      }).destroy;

								      scope.submit = function () {

									      // Send our email notification out
									      notifier[$scope.autoApprove ? 'autoApprove' : 'requestSeats'](
										      {

											      'subject'   : row.Course.PDS + ' - ' + row.Course.Number,
											      'host'      : caches.Hosts[scope.data.HostId].Unit,
											      'seats'     : scope.data.Students.length,
											      'dates'     : row.dateRange,
											      'students'  : scope.data.Students.join('\n'),
											      'notes'     : scope.data.Notes,
											      'recipients': row.FTD.Email + ';' +
											                  caches.Hosts[scope.data.HostId].Email

										      }
									      );

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

								      }
								      ;
							      }

						      };

						      row.showStudents = function () {

							      $scope.requestView = row;
							      $scope.students = classProcessor.requestDecode(row.Requests_JSON);

							      utilities.modal('modal-display-students', $scope);

						      }

					      });

				      });

		}
	])
;
