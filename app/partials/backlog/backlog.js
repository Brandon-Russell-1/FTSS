/*global FTSS, caches, _, moment, utils, angular */

FTSS.ng.controller(
	'backlogController',

	[
		'$scope',
		'SharePoint',
		'$timeout',
		'controllerHelper',
		'utilities',
		'loading',
		'geodata',

		function ($scope, SharePoint, $timeout, controllerHelper, utilities, loading, geodata) {

			var self;

			utilities.addAsync(generateRequirements);

			function generateRequirements() {

				$scope.totalCount = 0;

				$scope.progress = {

					'ftd'    : 'pending',
					'month'  : 'pending',
					'courses': 'pending',
					'seats'  : 'pending',
					'submit' : 'pending'

				};

				$scope.history = {};

				// Load the host data
				$scope.myHost = caches.Hosts[$scope.host.Id];

				// Using the host.FTD property (if it exists) add the ftd object
				$scope.myFTD = $scope.myHost.FTD ? caches.Units[$scope.myHost.FTD] : false;

				// Use our FTD's location if assigned to one
				$scope.myHost.Location = $scope.myFTD.Location || $scope.myFTD;

				// Create a list of available FTDs sorted by distance
				$scope.unitList = _.map(angular.copy(caches.Units), function (unit) {

					geodata.distances(unit, $scope.myHost.Location, unit.Location);

					unit.distanceInt = unit.distanceInt || unit.Base;
					unit.label = '<b>' + unit.Base + '</b><right>' + unit.distance + '</right>';

					return unit;

				});

				$scope.data = {

					// collection of course requirements
					'Course_Requirements': [],

					// Default to 3 months out
					'month': moment().add(3, 'months'),

					// Default to the host's local FTD
					'targetFTD': $scope.myFTD && $scope.myFTD.Id
				};

				$scope.$watch('data.targetFTD', function (ftd) {

					$scope.progress.ftd = ftd ? 'complete' : 'active';
					$scope.progress.month = ftd ? 'complete' : 'pending';
					$scope.progress.courses = ftd ? 'active' : 'pending';

					if (ftd) {

						// Bind the unit.courses to coursesDropdown for selectize
						$scope.coursesDropdown = caches.Units[ftd].Courses;

						self = controllerHelper($scope, {

							'sort': 'Number',

							'group': 'MDS',

							'model': 'requirements_stats',

							'filter': [
								'HostId eq ' + $scope.host.Id,
								'FTDId eq ' + ftd
							].join(' and ')

						});

						self.bind().then(function (backlogStats) {

							$scope.history = _.groupBy(backlogStats, 'Month');

							processCourseRequirements();

						});

					}

				});

				$scope.countSeats = function () {

					$scope.totalCount = 0;

					_.each($scope.groups, function (group) {

						$scope.totalCount += _(group).pluck('required').sum();

					});

					if ($scope.totalCount) {
						$scope.progress.seats = 'complete';
						$scope.progress.submit = 'active';
					} else {
						$scope.progress.submit = 'pending';
					}

				};

				$scope.$watch('data.month', function (month) {

					if (month) {

						var instance = moment(month).add(-4, 'months'),

							labels = $scope.monthLabels = [];

						_.times(3, function () {
							labels.push(instance.add(1, 'months').format('MMM<br>YYYY'));
						});

						processCourseRequirements();

					}

				});

				$scope.$watch('data.Course_Requirements', processCourseRequirements);

				function processCourseRequirements(text) {

					text = text || $scope.courses;

					$scope.progress.courses = text && text.length ? 'complete' : $scope.data.targetFTD ? 'active' : 'pending';

					if ($scope.loaded && self && text) {

						var refMonth = moment($scope.data.month).clone().add(-5, 'months'),

							months = _.times(3, function () {
								return refMonth.add(1, 'months').format('YYYY.MM');
							}),

							courses = {};

						$scope.courses = text;

						$scope.progress.seats = ($scope.progress.courses === 'complete') ? 'active' : 'pending';

						// Iterate over all the requirements
						_.each(text, function (courseId) {

							courses[courseId] = angular.copy(caches.MasterCourseList[courseId]);

							courses[courseId].History = [
								[0, 0],
								[0, 0],
								[0, 0]
							]
						});

						// Iterate over our stats data--this will tell us if a user has already been submitted before and track our history
						_.each($scope.history, function (stats, month) {

							var index = months.indexOf(month);

							// Only look at the last three months history
							if (index > -1) {

								// Consolidate our history data and handle multiple requests in the same month
								_(stats).pluck('Data_JSON').each(function (statGroup) {

									// Iterate over each course in the history for this month
									_.each(statGroup, function (stat, courseId) {

										// Iterate over each course in the list
										_.each(courses, function (course) {

											// If a course matches the history for this month, use loose typing to match Number == String
											if (course.Id == courseId) {

												// Update our stats for the match
												course.History[index][0] += stat[0];
												course.History[index][1] += stat[1];

											}

										});

									});

								}).value();

							}

						});

						self.initialize(courses).then(function (d) {

							d.backlog = 0;
							d.backlogPriority = 0;
							d.required = 0;

						});

					}

				}

			}

		}
	]
);
