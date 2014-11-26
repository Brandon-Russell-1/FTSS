/*global utils, FTSS, _, caches */

FTSS.ng.controller(
	'catalogController',

	[
		'$scope',
		function ($scope) {

			// Increase to 99 due to the simple binding
			$scope.pageLimit = 99;

			var self = FTSS.controller($scope, {

				'sort' : 'PDS',
				'group': 'MDS',
				'model': 'catalog'

			});

			self

				.bind()

				.then(function (data) {

					      self

						      .initialize(data)

						      .then(function (d) {

							            d.MDS = d.Title.split(' ')[0];

							            d.Units = [];

							            _(caches.Units).each(function (u) {

								            if (u.Courses_JSON.indexOf(d.Id) > -1) {

									            d.Units.push(u.label);

								            }

							            });

							            if (d.Units) {
								            d.units = d.Units.sort().join('<br>');
							            }

						            });


				      });
		}
	]);
