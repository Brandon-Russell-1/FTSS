/*global FTSS, _, caches */

/**
 * People Picker directive
 *
 * Creates a selectize people picker that loads data from SharePoint
 */
(function () {

	"use strict";

	FTSS.ng.directive('peoplePicker', function () {

		return {
			'restrict'   : 'E',
			'templateUrl': '/partials/people-picker.html',
			'replace'    : true,
			'link'       : function ($scope, $el, $attrs) {

				var list = $attrs.filter ? _(caches[$attrs.filter]).pluck($attrs.field) : false;

				$scope.picker = {
					'field' : $attrs.field,
					'filter': list ? function (data) {

						return !_(list).contains(data.Id);

					} : false
				};

			}
		};

	});

}());