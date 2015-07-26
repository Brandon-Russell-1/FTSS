/**
 * @name classReservations
 */
FTSS.ng.service('classReservations', [

	function () {

		"use strict";


		/**
		 * @name classReservations#updateTotals
		 * @param scope
		 * @returns {Function}
		 */
		this.updateTotals = function (scope) {

			return function () {

				_.each(scope.Students_JSON, function (students) {

					var host = caches.Hosts[students.HostId] || {};

					students.HostName = host.Unit || 'General Reservation';
					students.HostEmail = host.Email;

					students.Used = _.size(students.Students);
					students.Qty = students.Qty || students.Used;
					students.Diff = students.Qty - students.Used;

				});

				scope.allHaveValues = _.all(scope.Students_JSON, 'Qty');

				scope.Approved = _.sum(scope.Students_JSON, 'Qty');

				// Only attempt this if a CourseID exists
				if (scope.CourseId > 0) {

					// Update the course for this model
					scope.Course = caches.MasterCourseList[scope.CourseId];

					scope.OpenSeatsInt = scope.Course.Max - (scope.Approved || 0);

					scope.OpenSeats = scope.OpenSeatsInt < 0 ? 'Overbooked by ' + Math.abs(scope.OpenSeatsInt) :

					                  scope.OpenSeatsInt > 0 ? scope.OpenSeatsInt + ' Open Seats' :

					                  'Class Full';

				} else {

					scope.Course = {
						'Days': 'n/a',
						'Max' : 0,
						'Min' : 0
					};

					scope.Hours = null;

					scope.OpenSeats = '';
					scope.OpenSeatsInt = 0;

				}

			}

		}


	}

]);
