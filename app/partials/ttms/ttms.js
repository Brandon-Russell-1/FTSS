/*global FTSS, angular, utils, moment, _ */

FTSS.ng.controller(
	'ttmsController',

	[
		'$scope',
		'SharePoint',
		function ($scope, SharePoint) {

			var self = FTSS.controller($scope, {

				'sort'  : 'Created',
				'group' : 'location',
				'model' : 'ttms',

				// We only want classes with requests
				'filter': "TTMS eq null and Archived eq false"

			});

			$scope.inlineUpdate = function (field, setArchive) {

				self.inlineUpdate.call(this, field, function (data) {

					if (setArchive) {
						data.Archived = true;
					}

				});

			};

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

