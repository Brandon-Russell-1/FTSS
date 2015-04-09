/*global FTSS, angular */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'requestSeats',

		[
			'$timeout',
			'SharePoint',
			'classProcessor',
			'utilities',
			'notifier',

			function ($timeout, SharePoint, classProcessor, utilities, notifier) {

				return {
					'restrict'   : 'E',
					'templateUrl': '/partials/request-seats-button.html',
					'replace'    : true,
					'scope'      : true,
					'link'       : function ($scope) {

						var modal;

						if (!$scope.canRequest) {
							return;
						}

						// We use .data because of child scopes with a modal
						$scope.data = {
							'HostId': $scope.host.Id
						};

						// Action performed when the user presses the request seat button (use $parent for external use)
						$scope.$parent.requestSeats = function () {

							//  Action performed when the users presses submit
							$scope.submit = function () {

								// Our sharepoint batch operation expects an array of operations
								var send = [
									{

										'__metadata': 'Requests',

										'ClassId': $scope.row.Id,

										'HostId': $scope.data.HostId,

										'UnitId': $scope.row.UnitId,

										'Notes': $scope.data.Notes,

										'Status': $scope.autoApprove ? 'Approved' : 'Pending',

										'Students_JSON': $scope.data.People

									}
								];

								// Send our email notification out
								notifier[($scope.autoApprove ? 'autoApprove' : 'requestSeats')](
									{

										'subject'   : $scope.row.Course.PDS + ' - ' + $scope.row.Course.Number,
										'host'      : caches.Hosts[$scope.data.HostId].Unit,
										'seats'     : $scope.data.peopleCount,
										'dates'     : $scope.row.dateRange,
										'students'  : _.keys($scope.data.People).join('\n'),
										'notes'     : $scope.data.Notes,
										'recipients': $scope.row.FTD.Email + ';' +
										              caches.Hosts[$scope.data.HostId].Email

									}
								);

								// If this is an auto approve, we need to update the class approved count
								$scope.autoApprove && send.push(
									{
										'cache'     : true,
										'__metadata': $scope.row.__metadata,
										'Approved'  : ($scope.row.Approved || 0) + $scope.data.peopleCount
									});

								// Send the operation as a batch (similar to a SQL transaction) to ensure everything worked
								SharePoint.batch(send).then(function (results) {

									utilities.alert[results.success ? 'success' : 'error']();

									modal.modal.destroy();

								});

							};

							// Open the modal
							modal = utilities.modal('request-seats', $scope);

						};

					}

				}

			}

		]
	)

}());