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
					'restrict'   : 'E',
					'templateUrl': '/partials/edit-students-button.html',
					'replace'    : true,
					'scope'      : true,
					'link'       : function (scope) {

						scope.editStudents = function () {

							// If we have any registered students, load them async
							if (scope.row.Approved) {

								var read = FTSS.models('requests');

								read.params.$filter = 'ClassId eq ' + scope.row.Id;

								SharePoint.read(read).then(function (requests) {

									scope.loadingStudents = false;
									scope.students = classProcessor.requestProcessor(requests);

								});

								scope.loadingStudents = true;

							}

							// Open our modal dialog
							utilities.modal('modal-edit-students', scope);

						};

					}

				};

			}
		]
	);

}());
