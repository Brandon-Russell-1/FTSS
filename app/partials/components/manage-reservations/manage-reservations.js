/*global FTSS, angular */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'manageReservations',

		[
			'$timeout',
			'SharePoint',
			'classProcessor',
			'utilities',
			'notifier',

			function ($timeout, SharePoint, classProcessor, utilities, notifier) {

				return {
					'replace'    : true,
					'scope'      : true,
					'templateUrl': '/partials/manage-reservations.html',
					'link'       : function ($scope, el) {

						// Enable the add reservation button
						$scope.allHaveValues = true;

						// The collection of reservations
						$scope.data.reservations = $scope.data.reservations || [];

						// Collection of quota types
						$scope.quotaTypes = [

							{'Id': 'AN', 'label': '<b>AN</b><i> - Enlisted Guard/Reserve</i>'},
							{'Id': 'AP', 'label': '<b>AP</b><i> - Enlisted AD, Unit Funded</i>'},
							{'Id': 'AT', 'label': '<b>AT</b><i> - Enlisted AD, AETC Funded</i>'},
							{'Id': 'CN', 'label': '<b>CN</b><i> - Civilian, Unit Funded</i>'},
							{'Id': 'CP', 'label': '<b>CP</b><i> - Civilian, Unit Funded</i>'},
							{'Id': 'CT', 'label': '<b>CT</b><i> - Civilian, AETC Funded</i>'}

						];

						$scope.addReservation = function () {

							$scope.data.reservations.push({
								'HostId': null,
								'Qty'   : null
							});

							$scope.allHaveValues = false;

						};

						$scope.removeReservation = function (index) {

							$scope.data.reservations.splice(index, 1);
							$scope.updateTotals();

						};

						$scope.updateTotals = function () {

							$scope.allHaveValues = _.all($scope.data.reservations, 'Qty');

							$scope.data.Approved = _.sum($scope.data.reservations, 'Qty') + _.sum($scope.students, 'count');

						};

						$scope.isNew && $scope.addReservation();

					}

				}

			}

		]
	)

}());