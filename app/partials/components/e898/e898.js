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

									'Email'       : caches.Units[$scope.data.targetFTD].Email,
									'To'          : caches.Units[$scope.data.targetFTD].LongName,
									'From'        : $scope.myHost.Unit,
									'Month'       : $scope.data.month.format('MMMM YYYY'),
									'Creator'     : $scope.user.short,
									'Date'        : moment().format('D MMM YYYY'),
									'Stats1'      : $scope.monthLabels[1].split('<br>')[0],
									'Stats2'      : $scope.monthLabels[2].split('<br>')[0],
									'Stats3'      : $scope.data.month.format('MMM'),
									'Requirements': [],
									'Encoded'     : window.btoa(JSON.stringify($scope.data))
								},

								offset = 0,

								offsetTitle = 39,

								courseData = '',

								ftdSigs = '';

							data.FileName = _.template('{{From}} 898 for {{To}} - {{Month}}.xfdl')(data);

							// Copy all our requirements into a single array
							_.each($scope.groups, function (group) {
								data.Requirements = data.Requirements.concat(group);
							});

							_(data.Requirements)

								// List our required classes first
								.sortByOrder(function (row) {

									             return (row.required ? 'a' : 'b') + row.PDS;

								             })

								// Load fields for the XFDL courses
								.each(function (course, index) {

									      course.offset = offset;
									      course.offsetTitle = offsetTitle;
									      course.offsetLine = (index < 1) ? -10 : offset - 25;
									      course.cafmcl = course.Priority ? '*' : '';

									      course.stats1 = course.History[1].join('/').replace('0/0', '0');
									      course.stats2 = course.History[2].join('/').replace('0/0', '0');
									      course.stats3 = course.required;
									      course.Notes = course.Notes || '';

									      courseData += _.template(courseRow)(course)

										      .replace(/_INDEX_/g, course.Id);

									      offset += 115;
									      offsetTitle += 115;

									      ftdSigs += '<itemref>Given' + course.Id + '</itemref><itemref>Notes' + course.Id + '</itemref>';

								      })

								.value();

							var blob = new Blob([

								_.template(header)(data)
									.replace('<!-- FTDSIGN-->', ftdSigs)
									.replace('<!-- COURSEDATA-->', courseData)

							], {type: 'application/vnd.xfdl'});

							saveAs(blob, data.FileName);

						});

					}
				};

			}

		]);

}());
