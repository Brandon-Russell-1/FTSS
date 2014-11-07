/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		'SharePoint',
		function ($scope, $modal, SharePoint) {

			var self = FTSS.controller($scope, {

				'sort' : 'Start',
				'group': 'Course.Number',
				'model': 'scheduled'

			});

			$scope.request = utils.requestSeats($scope, $modal, self);

			self

				.bind('filter')

				.then(function (data) {

					      $scope.autoApprove = $scope.hasRole
					      (['ftd',
					        'scheduler'
					       ]);

					      $scope.canRequest = $scope.hasRole(
						      ['mtf',
						       'ftd',
						       'scheduler'
						      ]);

					      self.initialize(data).then(function (row) {

						      utils.processScheduledRow(row);

						      row.Archived = row.openSeats < 1;

					      });

				      });

		}
	])
;
