/*global FTSS, angular */

/**
 *
 */
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
					'link'       : function (scope, $el, $attr) {

						scope.editStudents = function () {

							var read = FTSS.models('requests');

							read.params.$filter = 'ClassId eq ' + scope.row.Id;

							scope.row.Approved ? SharePoint.read(read).then(loadModal) : loadModal();

						};

						function loadModal(data) {

							scope.requestView = scope.row;
							scope.students = classProcessor.requestProcessor(data);

							utilities.modal('modal-edit-students', scope);

						}


					}

				};

			}
		]
	);

}());
