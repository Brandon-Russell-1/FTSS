/*global FTSS, angular */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'traverse',

		[
			'$timeout',
			function ($timeout) {

				return {
					'restrict'   : 'E',
					'templateUrl': '/partials/traverse.html',
					'link'       : function (scope, $el, $attr) {

						var data = {};

						if (!scope.createData) {

							if ($attr.bind) {

								data = scope[$attr.bind];

							} else {

								data = [];

								// Make a flat copy of our data
								_.each(scope.groups, function (group) {
									_.each(group, function (row) {
										data.push(row);
									});
								});

							}

							// Bind the traverse action which allows navigating between records without closing/opening the modal
							scope.traverse = scope.update(scope, function () {

								$timeout(function () {

									// Find our current record
									var index = _.findIndex(data, {'Id': scope.data.Id});

									// Go foward if able, otherwise, start over
									scope.data = data[index + 1] || data[0];

									// Reset the form state
									scope.modal.$setPristine();

								});

							});

						} else {

							$el.remove();

						}

					}

				};

			}
		]
	);

}());
