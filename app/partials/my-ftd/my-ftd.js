/*global utils, FTSS, caches */

FTSS.ng.controller(
	'my-ftdController',

	[
		'$scope',
		'notifier',
		'dateTools',
		'classProcessor',
		'controllerHelper',
		'utilities',
		function ($scope, notifier, dateTools, classProcessor, controllerHelper, utilities) {

			$scope.ftss.searchPlaceholder =
				'Type here to search the schedule.  Examples: MDS:F-15, PDS:RFV, Robins, wire, 2A5*, March.';

			$scope.export = classProcessor.csvExport;

			$scope.canRequest = true;

			$scope.host && $scope.ftd ? getSchedule() : utilities.addAsync(getSchedule);

			function getSchedule() {

				var self = controllerHelper($scope, {

					'sort'        : 'startMoment',
					'group'       : 'Instructor.Name',
					'model'       : 'scheduled',
					'noEmptyGroup': true,

					'filter': [
						'UnitId eq ' + $scope.ftd.Id,
						'Start gt ' +  dateTools.startDayCreator(-2)
					].join(' and ')

				});

				classProcessor.interleaveRequest(self, $scope);

			}

		}
	])
;
