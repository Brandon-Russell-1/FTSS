/*global FTSS, angular, utils, _, caches */

FTSS.ng.controller(
	'requestsController',

	[
		'$scope',
		'SharePoint',
		'notifier',
		'classProcessor',
		'controllerHelper',
		'utilities',
		function ($scope, SharePoint, notifier, classProcessor, controllerHelper, utilities) {

			var self = controllerHelper($scope, {

				'sort' : 'Start',
				'group': 'Class.Course.Number',
				'model': 'requests',

				'filter': [
					'UnitId eq ' + $scope.ftd.Id,
					"Status eq 'Pending'"
				].join(' and ')

			});

			/**
			 * Process our FTD response
			 *
			 * @param status
			 * @param response
			 */
			$scope.respond = function (status, response) {

				var scope = this,

					send = [
						// Update the request item
						{
							'__metadata': scope.row.__metadata,
							'Status'    : status,
							'Response'  : response
						},

						// Update the approved seat count for the related class
						{
							'cache'     : true,
							'__metadata': scope.row.Class.__metadata,
							'Approved'  : (scope.row.Class.Approved || 0) + scope.row.data.peopleCount
						}

					];

				// Send the batch operation to SharePoint
				SharePoint.batch(send).then(function (results) {

					if (results.success) {

						// update fields needed for notifier service
						scope.row.Status = status;
						scope.row.Response = response;
						scope.row.students = _.keys(scope.row.Students_JSON).join('\n');

						// Send our email update
						notifier.respondToRequest(scope.row);

						// Update the model by removing this item
						delete self.data[scope.row.Id];
						self.process();

						utilities.alert.update();

					} else {

						utilities.alert.error();

					}

					// close the popover
					scope.$hide();

				});

			};

			self.bind().then(function (data) {

				// No double click action for this one
				$scope.edit = angular.noop;

				self.initialize(data).then(function (row) {

					// Copy for cacheFiller
					row.Class.HostId = row.HostId;

					// Run the cacheFiller
					classProcessor.cacheFiller(row.Class);

					classProcessor.singleRequestProcess(row);

				});

			});

		}
	])
;
