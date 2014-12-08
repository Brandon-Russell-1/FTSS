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

						      if (row.TTMS === '*') {

							      delete collection[row.Id];

						      } else {

							      utils.processScheduledRow(row);

							      row.Archived = row.openSeats < 1;

							      if (row.startMoment.diff(today, 'days') < 0) {
								      delete collection[row.Id];
							      }
						      }

					      });

				      });

		}
	])
;
