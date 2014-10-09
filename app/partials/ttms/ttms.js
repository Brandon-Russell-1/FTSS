/*global FTSS, angular */

FTSS.ng.controller(
	'ttmsController',

	[
		'$scope',
		function ($scope) {

			var self = FTSS.controller($scope, {

				'sort' : 'age',
				'group': 'location',

				'grouping': {
					'location': 'Location'
				},

				'sorting': {

					'Start': 'Start Date',
					'age'  : 'Age'

				},

				'model' : 'ttms',

				// We only want classes with requests
				'filter': "TTMS eq 'PENDING' and Archived eq false"

			});

			self

				.bind()

				.then(function (data) {

					      $scope.edit = angular.noop;

					      self.initialize(data).then(function (row) {

						      utils.cacheFiller(row);

						      row.age = moment(row.Created).fromNow();

						      row.location = row.FTD.LongName + ': ' + row.FTD.LCode;

					      });

				      });

		}
	]);
