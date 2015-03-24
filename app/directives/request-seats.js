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
					'link'       : function (scope, $el, $attr) {

						scope.requestSeats = function () {

							scope.submit = function () {

								// Our sharepoint batch operation expects an array of operations
								var send = [
									{

										'__metadata': 'Requests',

										'ClassId': row.Id,

										'HostId': scope.data.HostId,

										'UnitId': row.UnitId,

										'Notes': scope.data.Notes,

										'Status': scope.autoApprove ? 'Aprv' : 'Pend',

										'Students_JSON': {}

									}
								];

								// Send our email notification out
								notifier[scope.autoApprove ? 'autoApprove' : 'requestSeats'](
									{

										'subject'   : row.Course.PDS + ' - ' + row.Course.Number,
										'host'      : caches.Hosts[scope.data.HostId].Unit,
										'seats'     : scope.data.Students.length,
										'dates'     : row.dateRange,
										'students'  : scope.data.Students.join('\n'),
										'notes'     : scope.data.Notes,
										'recipients': row.FTD.Email + ';' + caches.Hosts[scope.data.HostId].Email

									}
								);

								if (scope.autoApprove) {
									send.push({
										          'cache'     : true,
										          '__metadata': row.__metadata,
										          'Approved'  : row.Approved + scope.data.count
									          })
								}

								SharePoint.batch(send);

							};

							utilities.modal('modal-request-seats', scope);

						};

					}

				}

			}

		]
	)

}());