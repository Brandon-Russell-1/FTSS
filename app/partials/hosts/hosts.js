/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'hostsController',

	[
		'$scope',
		function ($scope) {

			var self = FTSS.controller($scope, {

				'sort' : 'Unit',
				'group': 'det.LongName',
				'model': 'hosts',

				'edit': function(scope) {

					scope.$watch('data.FTD', function(ftd) {

						if (ftd) {
							scope.data.Location = caches.Units[ftd].Location;
						}

					})

				}

			});

			self

				.bind()

				.then(function (data) {

					      self

						      .initialize(data)

						      .then(function (d) {

							            d.search = d.Unit;

							            // Add the FTD data if this unit has one assigned
							            if (d.FTD) {
								            d.det = caches.Units[d.FTD];
								            d.search += d.det.search;
							            }

						            });

				      });

		}
	]);