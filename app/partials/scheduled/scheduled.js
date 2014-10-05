/*global app, utils, caches, FTSS, _ */

//FTSS.ng.controller('requestSeats', );

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		function ($scope, $modal) {

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

					scope.data.Students_JSON = [];

					scope.close = $modal(
						{

							'scope'          : scope,
							'backdrop'       : 'static',
							'contentTemplate': '/partials/modal-request-seats.html'

						}).destroy;

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
	]);
