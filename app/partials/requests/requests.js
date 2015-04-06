/*global FTSS, angular, utils, _, caches */

FTSS.ng.controller(
	'requestsController',

	[
		'$scope',
		'SharePoint',
		'notifier',
		'classProcessor',
		'controllerHelper',
		function ($scope, SharePoint, notifier, classProcessor, controllerHelper) {

			var self = controllerHelper($scope, {

				'sort' : 'Start',
				'group': 'Class.Course.Number',
				'model': 'requests',

				'filter': 'UnitId eq ' + $scope.ftd.Id

			});

			/**
			 * Process our FTD response
			 *
			 * @param status
			 * @param response
			 */
			$scope.respond = function (status, response) {

				var scope = this;

				self._update(scope.row, {
					'__metadata': scope.row.__metadata,
					'Status'    : status,
					'Response'  : response
				}, function() {

					delete self.data[scope.row.Id];
					scope.$hide();

				});

			};

			self.bind().then(function (data) {

				$scope.edit = angular.noop;

				self.initialize(data).then(function (row) {

					// Copy for cacheFiller
					row.Class.HostId = row.HostId;

					// Run the cacheFiller
					classProcessor.cacheFiller(row.Class);

					// Get the requested seat count
					row.seatCount = _.size(row.Students_JSON);

					row.studentList = _.keys(row.Students_JSON).join('<br>');

				});

			});

		}
	])
;
