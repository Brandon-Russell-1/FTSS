/*global FTSS, angular */

(function () {

	"use strict";

	FTSS.ng.directive(
		'editStudents',

		[
			'$timeout',
			'SharePoint',
			'classProcessor',
			'utilities',

			function ($timeout, SharePoint, classProcessor, utilities) {

				return {
					'restrict'   : 'A',
					'templateUrl': '/partials/edit-students-placeholder.html',
					'scope'      : true,
					'link'       : function (scope, el) {

						scope.data = scope.data || scope.row.Class || scope.row;

						scope.embed = el[0].hasAttribute('embed');

						scope.editStudents = function () {

							// If we have any registered students, load them async
							if (scope.data.Approved) {

								var read = FTSS.models('requests');

								read.params.$filter = 'ClassId eq ' + scope.data.Id;

								SharePoint.read(read).then(function (requests) {

									scope.loadingStudents = false;
									scope.students = classProcessor.requestProcessor(requests);

								});

								scope.loadingStudents = true;

							}

							// Open our modal dialog when embed is false
							!scope.embed && utilities.modal('edit-students', scope);

						};

						scope.embed && scope.editStudents();

					}

				};

			}
		]
	);

}());
