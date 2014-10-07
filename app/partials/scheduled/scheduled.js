/*global utils, FTSS, caches */

//FTSS.ng.controller('requestSeats', );

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		'SharePoint',
		function ($scope, $modal, SharePoint) {

			var self = FTSS.controller($scope, {
				'sort' : 'Start',
				'group': 'Course.MDS',

				'grouping': {
					'Course.MDS'  : 'MDS',
					'unit'        : 'Unit',
					'Course.AFSC' : 'AFSC',
					'availability': 'Open Seats'
				},

				'sorting': {
					'Start'      : 'Start Date',
					'course'     : 'Course',
					'unit'       : 'Unit',
					'Course.AFSC': 'AFSC'
				},

				'model': 'scheduled',

				'edit': function (scope, isNew) {

					if (isNew) {

						scope.data.Host = 0;

						scope.data.Other = 0;

					}

					scope.getOpenSeats = function () {

						if (scope.data.CourseId) {

							var requests = scope.data.Requests_JSON ? _(scope.data.Requests_JSON)
								    .pluck(1)
								    .pluck('length')
								    .reduce(function (sum, num) {
									            return sum + num;
								            }) : 0

								;

							return (caches.MasterCourseList[scope.data.CourseId].Max -
							        scope.data.Host - scope.data.Other - requests) + ' Open Seats';

						} else {

							return '';

						}

					};

				}

			});

			$scope.request = function (data) {

				if (data.openSeats > 0) {

					var scope = $scope.$new();

					scope.data = data;

					scope.data.Students = [];

					scope.close = $modal(
						{

							'scope'          : scope,
							'backdrop'       : 'static',
							'contentTemplate': '/partials/modal-request-seats.html'

						}).destroy;

					scope.submit = function () {

						var request = data.Requests_JSON || [];

						request.push([
							             // Status
							             1,

							             // Students Array
							             scope.data.Students,

							             // Notes
							             scope.data.Notes,

							             // Host ID
							             scope.data.HostId
						             ]);

						// Call sharePoint.update() with our data and handle the success/failure response
						SharePoint.update({

							                  'cache'        : true,
							                  '__metadata'   : data.__metadata,
							                  'Requests_JSON': request

						                  })

							.then(function (resp) {

								      scope.submitted = false;

								      // HTTP 204 is the status given for a successful update, there will be no body
								      if (resp.status === 204) {

									      utils.alert.create();

									      self.reload();

									      scope.close();

									      utils.alert.create();

								      } else {

									      utils.alert.error('unknown update issue');

								      }

							      });

					};
				}
			};

			$scope.view = function (data) {

				utils.permaLink({
					                'special': 'ScheduledId eq ' + data.Id,
					                'text'   : data.Course.PDS + ' on ' + data.start
				                }, 'requests');

			};

			self

				.bind('filter')

				.then(function (data) {

					      $scope.canEdit = $scope.hasRole('ftd');

					      self

						      .initialize(data)

						      .then(function (row) {

							            utils.cacheFiller(row);

							            switch (true) {
								            case (row.openSeats > 0):
									            row.openSeatsClass = 'success';
									            break;

								            case (row.openSeats === 0):
									            row.openSeatsClass = 'warning';
									            break;

								            case(row.openSeats < 0):
									            row.openSeatsClass = 'danger';
									            break;
							            }

							            row.availability = {
								            'success': 'Open Seats',
								            'warning': 'No Open Seats',
								            'danger' : 'Seat Limit Exceeded'
							            }[row.openSeatsClass];

						            });

				      });

		}
	])
;
