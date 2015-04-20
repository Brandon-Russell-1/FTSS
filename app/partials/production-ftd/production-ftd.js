/*global FTSS, _, caches */

FTSS.ng.controller(
	'production-ftdController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		'classProcessor',
		'controllerHelper',
		'loading',
		'utilities',
		'dateTools',
		function ($scope, $timeout, SharePoint, classProcessor, controllerHelper, loading, utilities, dateTools) {

			$scope.ftss.searchPlaceholder =
				'Type here to filter the production data.  Examples: MDS:F-15, PDS:RFV, Robins, wire, 2A5*.';
			$scope.ftss.hasAlternateView = true;

			$scope.ftd ? getProductionData() : utilities.addAsync(getProductionData);

			function getProductionData() {

				// Load the controller
				var self = controllerHelper($scope, {

						'group': 'Instructor.Name',

						'modal': 'instructor-stats',

						'finalProcess': buildProductionView,

						'model': 'scheduled',

						'filter': 'UnitId eq ' + $scope.ftd.Id

					}),

				// Builds our monthly statistics objects
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

					}());

				$scope.stats = self.edit();

				self.bind().then(function (results) {

					var startLimit = dateTools.startDayCreator(moment().add(-1, 'years')),

						endLimit = dateTools.startDayCreator(moment().startOf('month')),

						stats = _(results)

							.reject(function (row) {

								        return !row.CourseId || row.TS || row.Start <= startLimit || row.Start >= endLimit;

							        })

							// Sort oldest to newest
							.sortBy('startMoment')

							// Then reverse
							.reverse()

							// Return the chained value output from lodash
							.value();

					self.initialize(stats).then(classProcessor.processRow);

				});

				/**
				 * Post-process the production data
				 *
				 * @param finalData
				 */
				function buildProductionView(finalData) {

					// FTD-wide stats
					var ftdStats = {
						'hours'      : 0,
						'classes'    : 0,
						'students'   : 0,
						'graph'      : buildMonths(),
						'instructors': _.size(finalData)
					};

					$scope.flatList = [];
					$scope.instructors = {};

					_.each(finalData, function (courses, instructorName) {

						var chart = buildMonths(),

						// for aggregate instructor stats
							stats = {
								'annualHours': 0,
								'hours'      : 0,
								'classes'    : 0,
								'students'   : 0
							};

						_.each(courses, function (course) {

							var hours = course.Hours || course.Course.Hours || 0,

								monthIndex = course.startMoment.format('YYYYMM');

							$scope.flatList.push(course);

							// Tally all courses taught
							stats.classes++;

							// Tally hours, looking for a manual hours override first
							stats.hours += hours;

							// Tally all students taught
							stats.students += course.allocatedSeats;

							chart[monthIndex].hours += hours;
							ftdStats.graph[monthIndex].hours += hours;
							ftdStats.graph[monthIndex].classes++;
							ftdStats.graph[monthIndex].students += course.allocatedSeats;
							ftdStats.graph[monthIndex].impact += (course.allocatedSeats * hours / 8);
							ftdStats.graph[monthIndex].available += course.Course.Max;

							stats.annualHours += hours;

							ftdStats.classes++;
							ftdStats.hours += hours;
							ftdStats.students += course.allocatedSeats;

						});

						$scope.instructors[instructorName] = _.extend(
							courses[0].Instructor,

							{

								'history': courses,

								'historyList': _(courses).map(function (event) {

									return '<i>' + event.Course.PDS + '</i><b>' + event.startMoment.format('MMM-YY') + '</b>';

								}).join('<br>'),

								'stats': stats,

								'chart': _(chart).sortBy('sort').map(function (item) {

									// We use 175 as the theoratical teaching hours in a month
									var pct = item.hours ? Math.round((item.hours / 175) * 100) : 0;

									return '<b><i>' +
									       (item.hours || '') +
									       '</i><em style="height:' +
									       pct +
									       '%">&nbsp;</em>' +

									       '<i>' +
									       item.text +
									       '</i></b>';

								}).join(''),

								// A rough estimate of instructor time utilization
								annualEffectiveness: Math.floor(stats.annualHours / 19.2)

							}
						);

					});


					$scope.ftdStats = ftdStats;

					_.each(ftdStats.graph, function (month) {

						month.utilization = (month.students / month.available) * 100 || 0;

					});

					$scope.graph = _.sortBy(ftdStats.graph, 'sort');

					// Column
					$scope.graphOptions = {
						'lineMode'   : 'basis',
						'tension'    : 1,
						'axes'       : {
							'x' : {
								'type'         : 'date',
								'key'          : 'date',
								'labelFunction': d3.time.format("%b")
							},
							'y' : {'type': 'linear'},
							'y2': {'type': 'linear'}
						},
						'tooltipMode': 'dots',
						'drawLegend' : true,
						'drawDots'   : false,

						'series'     : [
							{
								'y'        : 'impact',
								'label'    : 'Impact',
								'type'     : 'area',
								'thickness': '4px',
								'axis'     : 'y',
								'id'       : 'series_impact',
								'color'    : 'rgb(76, 174, 76)'
							},
							{
								'y'    : 'hours',
								'label': 'Hours',
								'type' : 'column',
								'axis' : 'y',
								'id'   : 'series_hours',
								'color': 'rgb(31, 119, 180)'
							},
							{
								'y'    : 'students',
								'label': 'Students',
								'axis' : 'y2',
								'type' : 'column',
								'id'   : 'series_students',
								'color': 'rgb(174, 199, 232)'
							},
							{
								'y'        : 'utilization',
								'label'    : 'Utilization',
								'type'     : 'line',
								'thickness': '5px',
								'axis'     : 'y2',
								'id'       : 'series_utilization',
								'color'    : 'rgb(255, 127, 14)'
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

				}


			}


		}

	]);