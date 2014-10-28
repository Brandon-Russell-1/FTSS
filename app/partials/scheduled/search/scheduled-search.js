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

			$scope.request = utils.requestSeats($scope, $modal, SharePoint);

			self

				.bind('filter')

				.then(function (data) {

					      $scope.canRequest = $scope.hasRole(
						      ['mtf',
						       'ftd'
						      ]);

					      self.initialize(data).then(function (row) {

						      utils.processScheduledRow(row);

						      row.Archived = row.openSeats < 1;

					      });

				      });

		}
	])
;
