/*global FTSS */

/**
 * Contenteditable directive
 *
 * Allows ng-model binding to contenteditable
 *
 * Source: http://docs.angularjs.org/api/ng/type/ngModel.NgModelController
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'contenteditable',

		[
			'utilities',

			function (utilities) {

				return {

					restrict: 'A', // only activate on element attribute
					require : '?ngModel', // get a hold of NgModelController
					link    : function (scope, element, attrs, ngModel) {
						if (!ngModel) {
							return;
						} // do nothing if no ng-model

						var onEnter = attrs.hasOwnProperty('onenter'),

						    placeholder = attrs.placeholder,

						    original = utilities.deepRead(scope, attrs.ngModel),

						    run = function () {

							    (original !== ngModel.$viewValue) && scope.$eval(attrs.onenter);

						    };

						// Specify how UI should be updated
						ngModel.$render = function () {
							element.text(ngModel.$viewValue || '');
						};

						element.on('keydown', function (e) {
							if (onEnter && e.which === 13) {
								run();
								e.preventDefault();
								e.stopImmediatePropagation();
							}
						});

						// Listen for change events to enable binding
						element.on('blur keyup change', function () {
							scope.$apply(read);
						});

						if (placeholder) {

							var setPlaceholder = function () {

								var model = utilities.deepRead(scope, attrs.ngModel) || placeholder;

								ngModel.$setViewValue(model);
								ngModel.$render();

								(model === placeholder) && element.addClass('placeholder');

							};

							element.on('focus', function () {

								if (ngModel.$viewValue === placeholder) {

									element.empty();
									element.removeClass('placeholder');

								}

							});

							element.on('blur', setPlaceholder);

							setPlaceholder();

						}

						if (attrs.hasOwnProperty('blur')) {
							element.on('blur', function () {
								if (ngModel.$viewValue && ngModel.$viewValue !== placeholder) {
									run();
								}
							});
						}

						read(); // initialize

						// Write data to the model
						function read() {

							var txt = element.text();

							txt && ngModel.$setViewValue(txt);

						}
					}
				};
			}
		]);

}());