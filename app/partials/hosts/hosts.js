/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'hostsController',

	[
		'$scope',
		function ($scope) {

			var self = FTSS.controller($scope, {

				'sort' : 'Unit',
				'group': 'det.LongName',
				'model': 'hosts'

			});

			self

				.bind()

				.then(function (data) {

					      self

						      .initialize(data)

						      .then(function (d) {

							            d.det = caches.Units[d.FTD];

						            });

				      });

		}
	]);