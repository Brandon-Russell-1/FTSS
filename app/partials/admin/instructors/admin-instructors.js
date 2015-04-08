/*global FTSS, _, caches */

FTSS.ng.controller(
	'admin-instructorsController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		'controllerHelper',
		function ($scope, $timeout, SharePoint, controllerHelper) {

			// Yeah...that's a lot.....
			$scope.ftss.pageLimit = 5000;

			var self = controllerHelper($scope, {

				'sort' : 'Name',
				'model': 'instructors',
				'group': 'ftd'

			});

			// Bind inlineUpdate to the scope
			$scope.inlineUpdate = self.inlineUpdate;

			SharePoint.read(FTSS.models('users')).then(function (response) {

				$timeout(function () {

					$scope.users = _.sortBy(response, 'Name');

				});

			});

			self.bind().then(function (data) {

				// Complete the controller initialization
				self.initialize(data).then(function (row) {

					var FTD = caches.Units[row.UnitId] || {};

					row.ftd = FTD.LongName;
					row.search = row.Name + FTD.LongName;

				});


			});

		}
	]);