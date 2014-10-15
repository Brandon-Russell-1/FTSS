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

			$scope.request = function (row) {

				if (row.openSeats > 0) {

					var scope = $scope.$new();

					scope.data = row;

					scope.data.Students = [];

					scope.close = $modal(
						{

							'scope'          : scope,
							'backdrop'       : 'static',
							'contentTemplate': '/partials/modal-request-seats.html'

						}).destroy;

					scope.submit = function () {

						row.Requests_JSON = row.Requests_JSON || [];

						row.Requests_JSON.push([
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
							                  '__metadata'   : row.__metadata,
							                  'Requests_JSON': row.Requests_JSON

						                  })

							.then(function (resp) {

								      scope.submitted = false;

								      // HTTP 204 is the status given for a successful update, there will be no body
								      if (resp.status === 204) {

									      utils.alert.create();

									      self.process();

									      scope.close();

									      utils.alert.create();

								      } else {

									      utils.alert.error('unknown update issue');

								      }

							      });

					};
				}
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

								            case(row.openSeats < 0):
									            row.openSeatsClass = 'danger';
									            break;

								            default:
									            row.openSeatsClass = 'warning';
							            }

							            row.availability = {
								            'success': 'Open Seats',
								            'warning': 'No Open Seats',
								            'danger' : 'Seat Limit Exceeded'
							            }[row.openSeatsClass];

							            row.mailFTD = row.FTD.Email +
							                          '?subject=FTSS Class Inquiry for ' +
							                          row.Course.PDS +
							                          ' Class #' +
							                          row.TTMS;

							            // This is the hover image for each FTD
							            row.map = 'https://maps.googleapis.com/maps/api/staticmap?' +
							                      'sensor=false&size=400x300&zoom=5&markers=color:red|' +
							                      row.FTD.Location.replace(/\s/g, '');

						            });

				      });

		}
	])
;
