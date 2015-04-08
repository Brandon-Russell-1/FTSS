/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'my-unitController',

	[
		'$scope',
		'classProcessor',
		'controllerHelper',
		function ($scope, classProcessor, controllerHelper) {

			var self = controllerHelper($scope, {

				'sort' : 'Class.Start',
				'group': 'Course',
				'model': 'requests',
				'filter': 'HostId eq 3'

			});

			self.bind().then(function (data) {

				self.initialize(data).then(function (row) {
console.log(row);
				/*	d.search = d.Unit;

					// Add the FTD data if this unit has one assigned
					if (d.FTD) {
						d.det = caches.Units[d.FTD];
						d.Location = d.det.Location;
						d.search += d.det.search;
					}
*/

					classProcessor.cacheFiller(row.Class);

					// Get the requested seat coun
					classProcessor.singleRequestProcess(row);

					row.Course = row.Class.Course.PDS + ' - ' + row.Class.Course.Number;

					row.Priority = row.Class.Course.Priority;

					row.studentList = _.keys(row.Students_JSON).join('<br>');


				});

			});

		}
	]);