/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'hostsController',

	[
		'$scope',
		'controllerHelper',
		function ($scope, controllerHelper) {

			// This is a simple table, lets show it all
			$scope.ftss.pageLimit = 500;

			var self = controllerHelper($scope, {

				'sort' : 'Unit',
				'group': 'det.LongName',
				'model': 'hosts'

			});

			self.bind().then(function (data) {

				self.initialize(data).then(function (d) {

					d.search = d.Unit;

					// Add the FTD data if this unit has one assigned
					if (d.FTD) {
						d.det = caches.Units[d.FTD];
						d.Location = d.det.Location;
						d.search += d.det.search;
					}

				});

			});

		}
	]);