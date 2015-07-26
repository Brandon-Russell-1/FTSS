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
			'classReservations',

			function (appAssets, classReservations) {

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

							$scope.data.allHaveValues = false;

							$scope.data.Reservations_JSON.push({});

						};

						$scope.removeReservation = function (index) {

							$scope.data.Reservations_JSON.splice(index, 1);
							$scope.updateTotals();

						};

						$scope.isNew && $scope.addReservation();

						$scope.updateTotals = classReservations.updateTotals($scope.data);

						$scope.$watch('data.CourseId', $scope.updateTotals);

					}

				}

			}

		]
	)

}());