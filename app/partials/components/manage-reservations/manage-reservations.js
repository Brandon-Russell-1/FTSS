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
					'link'       : function ($scope, el, attrs) {

						$scope.data = $scope.data || $scope.row.Class || $scope.row;

						// Enable toggling of readonly for this view
						$scope.readonly = attrs.hasOwnProperty('readonly') || !$scope.canEdit;

						// Enable the add reservation button
						$scope.data.allHaveValues = true;

						// The collection of reservations
						$scope.data.Reservations_JSON = $scope.data.Reservations_JSON || [];

						// Copy the host list to inject a new host
						$scope.hostList = angular.copy(caches.Hosts);

						// Inject a general host for migration/flexibility
						$scope.hostList[1] = {'Id': 1, 'label': ' General Reservation'};

						// Load the data from SharePoint
						appAssets.process(function (data) {

							// Collection of TRQI types
							$scope.trqiTypes = angular.copy(data.trqiTypes);

							// Collection of quota types
							$scope.quotaTypes = angular.copy(data.quotaTypes);

						});

						/**
						 * watch our classmax to build a seat count picker
						 */
						$scope.$watch('data.Course.Max', function(classMax) {

							classMax && classMax++;

							// Collection for the QTY dropdown
							$scope.quantities = _(1).range(classMax || 12).map(function (seatCount) {

								return {
									'Id'   : seatCount,
									'label': '<b>' + seatCount + '</b><i> seat' + (seatCount > 1 ? 's' : '') + '</i>'
								};

							}).value();

						});

						/**
						 * Add a new reservation to the list
						 *
						 */
						$scope.addReservation = function () {

							$scope.data.allHaveValues = false;

							$scope.data.Reservations_JSON.push({
								'Students': {}
							});

						};

						/**
						 * Removed the specified reservation
						 * @param index
						 */
						$scope.removeReservation = function (index) {

							$scope.data.Reservations_JSON.splice(index, 1);
							$scope.updateTotals();

						};

						// Automatically add a reservation when creating the class
						$scope.isNew && $scope.addReservation();

						// Bind updateTotals to the scope
						$scope.updateTotals = classReservations.updateTotals($scope.data);

						// Watch for course changes to update the seat counts
						$scope.$watch('data.CourseId', $scope.updateTotals);

						$scope.$watch('data.Reservations_JSON', $scope.updateTotals, true);

					}

				}

			}

		]
	)

}());