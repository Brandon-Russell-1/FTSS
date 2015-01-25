/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		function ($scope, $modal) {

			var self = FTSS.controller($scope, {

				    'sort' : 'Start',
				    'group': 'Course.Number',
				    'model': 'scheduledSearch'

			    });

			$scope.autoApprove = $scope.hasRole
			([
				 'ftd',
				 'scheduling'
			 ]);

			$scope.canRequest = $scope.hasRole
			([
				 'mtf',
				 'ftd',
				 'scheduling'
			 ]);

			$scope.request = function() {

				var row = this;

				if ($scope.canRequest && row.openSeats > 0 || $scope.autoApprove) {

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

						if (!$scope.autoApprove) {

							// Send our email notification to the FTD
							utils.sendEmail(
								{
									'to'     : row.FTD.Email,
									'subject': 'New Seat Request for ' + row.Course.PDS,
									'body'   : caches.Hosts[scope.data.HostId].Unit +
									         ' has requested ' +
									         scope.data.Students.length +
									         ' seats for the ' +
									         row.dateRange +
									         ' class:' +
									         '\n\n' + scope.data.Students.join('\n') +
									         '\n\n' + scope.data.Notes
								});

						}

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

					};
				}

			};

			self

				.bind('filter')

				.then(function (data) {

					      self.initialize(data).then(function (row) {

						      utils.processScheduledRow(row);

						      // Hide full classes by default
						      row.Archived = (row.openSeats < 1);

					      });

				      });

		}
	])
;
