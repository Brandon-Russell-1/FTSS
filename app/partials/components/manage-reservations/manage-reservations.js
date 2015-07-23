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
			'SharePoint',
			'classProcessor',
			'utilities',
			'notifier',

			function (appAssets, SharePoint, classProcessor, utilities, notifier) {

				return {
					'replace'    : true,
					'scope'      : true,
					'templateUrl': '/partials/manage-reservations.html',
					'link'       : function ($scope, el) {

						// Enable the add reservation button
						$scope.allHaveValues = true;

						// The collection of reservations
						$scope.data.Reservations_JSON = $scope.data.Reservations_JSON || [];

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

							$scope.data.Approved = _.sum($scope.data.Reservations_JSON, 'Qty') + _.sum($scope.students, 'count');

						};

						$scope.isNew && $scope.addReservation();

					}

				}

			}

		]
	)

}());