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
					'templateUrl': '/partials/request-seats-button.html',
					'replace'    : true,
					'scope'      : true,
					'link'       : function ($scope, el) {

						var modal,

							now = moment().startOf('day');

						if (!$scope.canRequest) {
							return;
						}

						// For resources view, we have to lookup the data first
						if ($scope.getRow) {

							$scope.row = $scope.getRow(el[0].getAttribute('lookup'));

							// Do not show request seat button for classes that have already started
							if ($scope.row.startMoment < now) {
								el[0].innerHTML = '';
								return;
							}
						}

						// We use .data because of child scopes with a modal
						$scope.data = {
							'HostId': $scope.host.Id
						};

						// Action performed when the user presses the request seat button
						$scope.requestSeats = function () {

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

									utilities.alert[results.success ? 'create' : 'error']();

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