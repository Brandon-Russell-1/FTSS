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
				'modal': 'instructor-stats'

			});

			self.bind('ftd').then(function (data) {

				var UnitId = $scope.ftd.Id,

				    read = _.clone(FTSS.models.scheduled);

				// Only include unarchived instructors for this unit
				data = angular.copy(_.filter(data, {'Archived': false}));

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

						    .sortBy('startMoment')

						    .reverse()

						    // Group the data by InstructorID
						    .groupBy('InstructorId')

						    // Return the chained value output from lodash
						    .value(),

					    yearStart = moment().add(-12, 'months'),

					    yearEnd = moment().add(-1, 'months'),

					    buildMonths = (function () {

						    var collection = {},

						        month = moment();

						    for (var i = 0; i < 12; i++) {

							    collection[month.add(-1, 'months').format('YYYYMM')] = {
								    'sort'     : parseInt(month.format('YYYYMM'), 10),
								    'text'     : month.format('MMM'),
								    'date'     : month.clone().toDate(),
								    'hours'    : 0,
								    'classes'  : 0,
								    'students' : 0,
								    'impact'   : 0,
								    'available': 0
							    };

						    }

						    return function () {

							    return _.cloneDeep(collection);

						    }

					    }()),

					    ftdStats = {
						    'hours'   : 0,
						    'classes' : 0,
						    'students': 0,
						    'graph'   : buildMonths()
					    };

					// Complete the controller initialization
					self.initialize(data).then(function (row) {

						var stat = stats[row.Id],

						    chart = buildMonths();

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

						_(stat).each(function (course) {

							var hours = course.Hours || course.Course.Hours;

							// Tally all courses taught
							row.stats.classes++;

							// Tally hours, looking for a manual hours override first
							row.stats.hours += hours;

							// Tally all students taught
							row.stats.students += course.allocatedSeats;

							// If course was taught in the last year, count hours for annualHours
							if (course.startMoment > yearStart && course.startMoment < yearEnd) {

								var monthIndex = course.startMoment.format('YYYYMM');

								chart[monthIndex].hours += hours;
								ftdStats.graph[monthIndex].hours += hours;
								ftdStats.graph[monthIndex].classes++;
								ftdStats.graph[monthIndex].students += course.allocatedSeats;
								ftdStats.graph[monthIndex].impact += (course.allocatedSeats * hours / 8);
								ftdStats.graph[monthIndex].available += course.Course.Max;

								row.annualHours += hours;

								ftdStats.classes++;
								ftdStats.hours += hours;
								ftdStats.students += course.allocatedSeats;

							}
						});

						row.chart = '';

						_(chart).sortBy('sort').each(function (item) {

							// We use 175 as the theoratical teaching hours in a month
							var pct = item.hours ? Math.round((item.hours / 175) * 100) : 0;

							row.chart += '<b><i>' +
							             (item.hours || '') +
							             '</i><em style="height:' +
							             pct +
							             '%">&nbsp;</em>' +

							             '<i>' +
							             item.text +
							             '</i></b>';

						});

						// A rough estimate of instructor time utilization
						row.annualEffectiveness = Math.floor(row.annualHours / 19.2);

					});

					$scope.ftdStats = ftdStats;

					_(ftdStats.graph).each(function (month) {

						month.utilization = (month.students / month.available) * 100 || 0;

					});

					$scope.graph = _.sortBy(ftdStats.graph, 'sort');

					// Column
					$scope.graphOptions = {
						lineMode   : "basis",
						tension    : 1,
						axes       : {
							x : {
								type: "date",
								key : "date"
							},
							y : {type: "linear"},
							y2: {type: "linear"}
						},
						tooltipMode: "dots",
						drawLegend : true,
						drawDots   : false,

						series       : [
							{
								y        : "impact",
								label    : "Impact",
								type     : "area",
								color    : "#4CAE4C",
								thickness: "4px",
								axis     : "y",
								id       : "series_impact"
							},
							{
								y    : "hours",
								label: "Hours",
								type : "column",
								axis : "y",
								id   : "series_hours"
							},
							{
								'y'    : "students",
								'label': "Students",
								'axis' : "y2",
								'type' : "column",
								'id'   : "series_students"
							},
							{
								'y'      : 'utilization',
								'label'  : 'Utilization',
								'type'   : 'line',
								thickness: "5px",
								'axis'   : 'y2',
								'id'     : 'series_utilization'
							}
						],
						'tooltip'    : {
							'mode'     : 'scrubber',
							'formatter': function (x, y, series) {

								var text = parseInt(y, 10);

								switch (series.label) {

									case 'Impact':
										return text + '  days (students * training days)';

									case 'Utilization':
										return text + '% seat utilization';

									case 'Hours':
										return text + ' instructor hours';

									default:
										return text + ' ' + series.label;


								}

							}
						},
						'columnsHGap': 15
					};

				});

			});

		}
	]);