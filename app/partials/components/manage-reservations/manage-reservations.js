/*global FTSS, angular */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'manageReservations',

		[
			'appAssets',

			function (appAssets) {

				return {
					'replace'    : true,
					'scope'      : true,
					'templateUrl': '/partials/manage-reservations.html',
					'link'       : function ($scope, el) {

						// Enable the add reservation button
						$scope.allHaveValues = true;

						// The collection of reservations
						$scope.data.Reservations_JSON = $scope.data.Reservations_JSON || [];

						$scope.hostList = angular.copy(caches.Hosts);

						$scope.hostList[0] = {'Id': 0, 'label': ' General Reservation'};

						// Load the data from SharePoint
						appAssets.process(function (data) {

							// Collection of TRQI types
							$scope.trqiTypes = angular.copy(data.trqiTypes);

							// Collection of quota types
							$scope.quotaTypes = angular.copy(data.quotaTypes);

						});

						$scope.addReservation = function () {

							$scope.allHaveValues = false;

							$scope.data.Reservations_JSON.push({
								'HostId': null,
								'Qty'   : null
							});

						};

						$scope.removeReservation = function (index) {

							$scope.data.Reservations_JSON.splice(index, 1);
							$scope.updateTotals();

						};

						$scope.updateTotals = function () {

							$scope.allHaveValues = _.all($scope.data.Reservations_JSON, 'Qty');

							$scope.data.Approved = _.sum($scope.data.Reservations_JSON, 'Qty') +
							                       _.sum($scope.data.Students_JSON, 'Count');

							// Only attempt this if a CourseID exists
							if ($scope.data.CourseId > 0) {

								// Update the course for this model
								$scope.data.Course = caches.MasterCourseList[$scope.data.CourseId];

								var open = $scope.data.Course.Max - ($scope.data.Approved || 0);

								$scope.data.OpenSeats = open < 0 ? 'Overbooked by ' + Math.abs(open) :

								                        open > 0 ? open + ' Open Seats' :

								                        'Class Full';

							} else {

								$scope.data.Course = {
									'Days': 'n/a',
									'Max' : 0,
									'Min' : 0
								};

								$scope.data.Hours = null;

								$scope.data.OpenSeats = '';

							}

						};

						$scope.isNew && $scope.addReservation();

						$scope.$watch('data.CourseId', $scope.updateTotals);

					}

				}

			}

		]
	)

}());