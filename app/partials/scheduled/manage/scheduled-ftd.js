/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduled-ftdController',

	[
		'$scope',
		'$modal',
		'SharePoint',
		function ($scope, $modal, SharePoint) {

			var self = FTSS.controller($scope, {
				'sort' : 'Start',
				'group': 'Course.MDS',

				'grouping': {
					'Course.MDS'  : 'MDS',
					'Course.AFSC' : 'AFSC',
					'availability': 'Open Seats'
				},

				'sorting': {
					'Start'      : 'Start Date',
					'course'     : 'Course',
					'Course.AFSC': 'AFSC'
				},

				'model': 'scheduled',

				'finalProcess': function (data) {

					var events = [];

					_(data).each(function (group) {
						events = events.concat(group);
					});

					$scope.schedule.fullCalendar('removeEvents');

					$scope.schedule.fullCalendar('addEventSource', events);

				},

				'edit': function (scope, isNew) {

					if (isNew) {

						scope.data.Host = 0;
						scope.data.Other = 0;

					}

					scope.getOpenSeats = function () {

						if (scope.data.CourseId) {

							var requests = _(scope.data.Requests_JSON).reduce(function (count, request) {

								    // Only count seats pending (1) or approved (2) against total
								    return  (request[0] < 3) ? count + request[1].length : count;

							    }, 0),

							    open = (caches.MasterCourseList[scope.data.CourseId].Max -
							            (scope.data.Host || 0) -
							            (scope.data.Other || 0) -
							            requests);

							switch (true) {

								case (open > 0):
									return open + ' Open Seats';

								case (open < 0):
									return 'Overbooked by ' + Math.abs(open);

								default:
									return 'Class Full';

							}

						} else {

							return '';

						}

					};

				}

			});

			$scope.request = utils.requestSeats($scope, $modal, SharePoint);

			$scope.events = [
				[]
			];

			/* config object */
			$scope.uiConfig = {
				calendar: {
					height     : 600,
					editable   : true,
					weekends   : false,
					header     : {
						left  : 'title',
						center: '',
						right : 'today prev,next'
					},
					eventClick : function (event) {
						$scope.edit.apply({'row': event});
					},
					eventDrop  : function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
						console.log(dayDelta);
					},
					eventResize: function (event, dayDelta, minuteDelta, revertFunc, jsEvent, ui, view) {
						console.log(dayDelta);
					}
				}
			};

			self

				.bind('filter')

				.then(function (data) {

					      $scope.canRequest = true;

					      self.initialize(data).then(utils.processScheduledRow);

				      });

		}
	])
;
