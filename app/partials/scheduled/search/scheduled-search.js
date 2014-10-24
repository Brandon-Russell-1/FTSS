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
				'group': 'course',

				'grouping': {
					'unit'  : 'Unit',
					'course': 'Course'
				},

				'sorting': {
					'Start' : 'Start Date',
					'course': 'Course',
					'unit'  : 'Unit'
				},

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
