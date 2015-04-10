/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'my-unitController',

	[
		'$scope',
		'classProcessor',
		'controllerHelper',
		'loading',
		function ($scope, classProcessor, controllerHelper, loading) {

			$scope.ftss.hasArchiveOption = true;

			$scope.$watch('host.Id', function (hostId) {

				if (!hostId) return;

				loading(true);

				var self = controllerHelper($scope, {

						'sort'  : 'Class.Start',
						'group' : 'Course',
						'model' : 'requests',
						'filter': 'HostId eq ' + hostId

					}),

					lastMonth = moment().add(-1, 'months');

				self.bind().then(function (data) {

					self.initialize(data).then(function (row) {

						/*	d.search = d.Unit;

						 // Add the FTD data if this unit has one assigned
						 if (d.FTD) {
						 d.det = caches.Units[d.FTD];
						 d.Location = d.det.Location;
						 d.search += d.det.search;
						 }
						 */

						classProcessor.cacheFiller(row.Class);

						// Get the requested seat count
						classProcessor.singleRequestProcess(row);

						row.Archived = row.Class.endMoment < lastMonth;

						row.Course = row.Class.Course.PDS + ' - ' + row.Class.Course.Number;

						row.Priority = row.Class.Course.Priority;

					});

				});


			});

		}
	]);