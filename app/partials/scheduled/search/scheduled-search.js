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

			    }),

			    today = moment();

			$scope.request = utils.requestSeats($scope, $modal, self);

			self

				.bind('filter')

				.then(function (data) {

					      $scope.autoApprove = $scope.hasRole
					      (['ftd',
					        'scheduling'
					       ]);

					      $scope.canRequest = $scope.hasRole(
						      ['mtf',
						       'ftd',
						       'scheduling'
						      ]);

					      self.initialize(data).then(function (row, key, collection) {

						      // Delete if this class is cancelled or just unavailability
						      if (!row.CourseId || row.Archived) {

							      delete collection[row.Id];

						      } else {

							      utils.processScheduledRow(row);

							      row.Archived = row.openSeats < 1;

							      // Also delete if this is an old class
							      if (row.startMoment.diff(today, 'days') < 0) {
								      delete collection[row.Id];
							      }
						      }

					      });

				      });

		}
	])
;
