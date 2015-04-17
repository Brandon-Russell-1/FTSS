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
					'link'       : function (scope, $el) {

						var view = $('#mainView'),

						    content = $('#content'),

							data = {};

						if (!scope.createData) {

							// Let the view CSS know about this modal so we can do some fun stuff
							view.addClass('hasModal');

							// Make a flat copy of our data
							_.each(scope.groups, function (group) {
								_.each(group, function (row) {
									data[row.Id] = row;
								});
							});

							// Bind the traverse action which allows navigating between records without closing/opening the modal
							scope.traverse = scope.update(scope, function (forward) {

								// Wrap in $timeout due to the async callback required--this was simpler than a promise
								$timeout(function () {

									var rows, row, pointer;

									// Array of all tr's on the page (with a scope)
									rows = $('tr.traverse');

									// The currently selected row
									row = $('[traverse="' + scope.data.Id + '"]');

									// Our current row index
									pointer = rows.index(row);

									// Map to the new row dependent on the forward variable
									if (forward) {
										row = rows.eq(++pointer).length && rows.eq(pointer) || rows.first();
									} else {
										row = rows.eq(--pointer).length && rows.eq(pointer) || rows.last();
									}

									// Copy data back into new scope.data variable
									scope.data = data[parseInt(row.attr('traverse'), 10)];

									// Reset the form state
									scope.modal.$setPristine();

								});

							});

							// Watch for the destruction of this element and then remove .modal-selected class
							$el.on("$destroy", function () {
								view.removeClass('hasModal');
								$('tr.traverse').removeClass('modal-selected');
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
