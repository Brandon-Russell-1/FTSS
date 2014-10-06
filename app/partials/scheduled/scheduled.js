/*global utils, FTSS */

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

				'model': 'scheduled'

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

						      .then(function (req) {

							            self.scheduledClass(req);

							            switch (true) {
								            case (req.openSeats > 0):
									            req.openSeatsClass = 'success';
									            break;

								            case (req.openSeats === 0):
									            req.openSeatsClass = 'warning';
									            break;

								            case(req.openSeats < 0):
									            req.openSeatsClass = 'danger';
									            break;
							            }

							            req.availability = {
								            'success': 'Open Seats',
								            'warning': 'No Open Seats',
								            'danger' : 'Seat Limit Exceeded'
							            }[req.openSeatsClass];

						            });

				      });

		}
	])
;
