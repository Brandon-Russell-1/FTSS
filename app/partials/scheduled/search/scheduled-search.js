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
		'SharePoint',
		function ($scope, $modal, notifier, classProcessor, controllerHelper, security, utilities, SharePoint) {

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

					      $scope.canEdit = $scope.canRequest = security.hasRole(['mtf', 'ftd', 'scheduling']);

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

							      self._update(row, {
								      '__metadata': row.__metadata,
								      'TTMS'      : row.TTMS
							      });

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

									      // Our sharepoint batch operation expects an array of operations
									      var send = [
										      {

											      '__metadata': 'Requests',

											      'ClassId': row.Id,

											      'HostId': scope.data.HostId,

											      'UnitId': row.UnitId,

											      'Notes': scope.data.Notes,

											      'Status': scope.autoApprove ? 'Aprv' : 'Dend',

											      'Students_JSON': {}

										      }
									      ];

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

									      if (scope.autoApprove) {
										      send.push({
											                'cache'     : true,
											                '__metadata': row.__metadata,
											                'Approved'  : row.Approved + scope.data.count
										                })
									      }

									      SharePoint.batch(send);

								      };

							      }

						      };

						      row.showStudents = function () {

							      var read = FTSS.models('requests');

							      read.params.$filter = 'ClassId eq ' + row.Id;

							      row.Approved ? SharePoint.read(read).then(loadModal) : loadModal();

							      function loadModal(data) {

								      $scope.requestView = row;
								      $scope.students = classProcessor.requestProcessor(data);

								      utilities.modal('modal-display-students', $scope);

							      }

						      }

					      });

				      });

		}
	])
;
