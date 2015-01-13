/*global FTSS, _, caches */

FTSS.ng.controller(
	'production-ftdController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		function ($scope, $timeout, SharePoint) {

			$scope.pageLimit = 99;

			var self = FTSS.controller($scope, {

				'sort' : 'InstructorName',
				'model': 'instructors',
				'modal': 'instructor-stats',

				'noFilter': true

			});

			// We use $scope.edit's modal function to show instructor stats
			$scope.stats = function () {

				// We have to pass our context to $scope.edit for the instructor stats
				$scope.edit.apply(this);

			};

			self.bind().then(function (data) {

				var UnitId = $scope.ftd.Id,

				    read = _.clone(FTSS.models.scheduled),

				    nextWeek = moment().add(7, 'days'),

				    yearStart = moment().add(-1, 'years');

				// Only include unarchived instructors for this unit
				data = angular.copy(_.filter(data, {'UnitId': UnitId, 'Archived': false}));

				// Only include this unit
				read.params.$filter = '(UnitId eq ' + UnitId + ')';

				// Request the scheduled data for this unit
				SharePoint.read(read).then(function (results) {

					var stats = _(results)

						    // Ignore our instructor unavailability
						    .reject({'CourseId': null})

						    // Ignore cancelled classes
						    .reject('Archived')

						    // Load the cache data for every row (this one is a little expensive)
						    .each(utils.cacheFiller)

						    // Group the data by InstructorID
						    .groupBy('InstructorId')

						    // Return the chained value output from lodash
						    .value(),

					    ftdStats = {
						    'hours'   : 0,
						    'classes' : 0,
						    'students': 0
					    };

					// Complete the controller initialization
					self.initialize(data).then(function (row) {

						var stat = stats[row.Id],

						    chart = [];

						row.search = row.InstructorName;

						// for aggregate instructor stats
						row.stats = {
							'hours'   : 0,
							'classes' : 0,
							'students': 0
						};

						row.annualHours = 0;

						// add the data back to the scope
						row.history = stat;

						while (chart.length < 12) {
							chart.push(0);
						}

						_(stat).each(function (course) {

							var hours = course.Hours || course.Course.Hours;

							// Tally all courses taught
							row.stats.classes++;

							// Tally hours, looking for a manual hours override first
							row.stats.hours += hours;

							// Tally all students taught
							row.stats.students += course.allocatedSeats;

							// If course was taught in the last year, count hours for annualHours
							if (course.startMoment > yearStart && course.startMoment < nextWeek) {

								chart[course.startMoment.month()] += hours;

								row.annualHours += hours;

								ftdStats.classes++;
								ftdStats.hours += hours;
								ftdStats.students += course.allocatedSeats;

							}
						});

						(function () {

							var max = _.max(chart),

							    months = 'Jan.Feb.Mar.Apr.May.Jun.Jul.Aug.Sep.Oct.Nov.Dec'.split('.');

							row.chart = '';

							_(chart).each(function (item, index) {

								var pct = item ? Math.round((item / max) * 100) : 0;

								row.chart += '<b><em style="height:' + pct + '%">&nbsp;</em>' +

								             '<i>' + months[index] + '</i></b>';


							});

						}());

						// A rough estimate of instructor time utilization
						row.annualEffectiveness = Math.floor(row.annualHours / 19.2);

					});

					$scope.ftdStats = ftdStats;

				});

			});

		}
	]);