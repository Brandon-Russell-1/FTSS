/*global FTSS, utils */

/**
 * E898 Directive
 *
 * Generates an XFDL 898
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'e898',

		[
			'$templateCache',
			function ($templateCache) {

				return {
					'restrict': 'A',
					'link'    : function ($scope, $el) {

						$el.bind('click', function () {

							var wrapper = $templateCache.get('/partials/e898-wrapper.html'),

								header = $templateCache.get('/partials/e898-header.html'),

								courseRow = $templateCache.get('/partials/e898-course.html'),

								data = {

									'To'          : caches.Units[$scope.data.targetFTD].LongName,
									'From'        : $scope.myHost.Unit,
									'Month'       : $scope.data.month.format('MMM-YYYY'),
									'Creator'     : $scope.user.short,
									'Date'        : moment().format('D MMM YYYY'),
									'Stats1'      : $scope.monthLabels[1].split('<br>')[0],
									'Stats2'      : $scope.monthLabels[2].split('<br>')[0],
									'Stats3'      : $scope.data.month.format('MMM'),
									'Requirements': []
								},

								offset = 272,

								offsetTitle = 311,

								formData = _.template(header)(data),

								courseData = '';

							// Copy all our requirements into a single array
							_.each($scope.groups, function (group) {
								data.Requirements = data.Requirements.concat(group);
							});


							_.each(data.Requirements, function (course) {

								course.offset = offset;
								course.offsetTitle = offsetTitle;
								course.cafmcl = course.Priority ? 'on' : 'off';

								course.stats1 = course.History[1].join('/');
								course.stats2 = course.History[2].join('/');
								course.stats3 = course.required;
								course.Notes = course.Notes || '';

								courseData += _.template(courseRow)(course)

									.replace(/_INDEX_/g, course.Id);

								offset += 115;
								offsetTitle += 115;

							});

							var blob = new Blob([formData.replace('<!-- COURSEDATA-->', courseData)], {type: "application/x-xfdl"});
							saveAs(blob, '898.xfdl');

						});

					}
				};

			}

		]);

}());
