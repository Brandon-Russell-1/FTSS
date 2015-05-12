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

			utilities.addAsync(generateRequirements);

			function generateRequirements() {

				loading(true);

				var self = controllerHelper($scope, {

					'sort': 'Number',

					'group': 'detRequest.Base',

					'model': 'requirements_stats',

					'filter': 'HostId eq ' + $scope.host.Id,

					'finalProcess': function (groups) {

						$scope.flatData = [];

						// Make a flat copy of our data forth main list
						_.each(groups, function (group) {
							$scope.flatData = $scope.flatData.concat(group);
						});

					}

				});

				$scope.data = {
					'month': moment().add(3, 'months')
				};

				$scope.old = {};

				$scope.history = {};

				$scope.data.Course_Requirements = [];

				$scope.myHost = caches.Hosts[$scope.host.Id];

				// Using the host.FTD property (if it exists) add the ftd object
				$scope.myFTD = $scope.myHost.FTD ? caches.Units[$scope.myHost.FTD] : false;

				$scope.myHost.Location = $scope.myFTD.Location || $scope.myFTD;

				$scope.unitList = _.map(angular.copy(caches.Units), function (unit) {

					geodata.distances(unit, $scope.myHost.Location, unit.Location);

					unit.distanceInt = unit.distanceInt || unit.Base;
					unit.label = '<b>' + unit.Base + '</b><right>' + unit.distance + '</right>';

					return unit;

				});

				self.bind().then(function (backlogStats) {

					// Iterate over our stats data--this will tell us if a user has already been submitted before and track our history
					_.each(backlogStats, function (stat) {

						// This will let us have multiple 898's for one month
						var history = $scope.history[stat.Month] = $scope.history[stat.Month] || {};

						// Iterate over all the courses in an 898
						_.each(stat.Data_JSON, function (course, id) {

							// Build our list of trainee requests so we don't show prior requests still in the AAA
							$scope.old[id] = $scope.old[id] ? $scope.old[id].concat(course[1]) : course[1];

							// This will let us have duplicate course requests in one month
							var h = history[id] = history[id] || {'built': 0, 'required': 0};

							// We have to make -1 a 0 (the default is -1 when FTD hasn't responded)
							h.built += (course[0] < 1) ? 0 : course[0];
							h.required += course[1].length;

						});

					});

				});

				/**
				 * Used by the requirements wizard to report current progress for the user
				 *
				 * @param step
				 * @returns {string}
				 */
				$scope.getProgress = function (step) {

					var map = [

						$scope.data.targetFTD,

						$scope.data.month,

						($scope.ftss.itemCount.value > 0),

						$scope.groups ? _($scope.flatData).pluck('peopleCount').sum() : false,

						(($scope.requests || {}).count > 0)

					];

					switch (step) {

						case 0:
							return map[0] ? 'complete' : 'active';

						case 1:
							return !map[0] ? 'pending' :

							       map[1] ? 'complete' : 'active';

						case 2:
							return (!map[0] || !map[1]) ? 'pending' :

							       map[2] ? 'complete' : 'active';

						case 3:
							return (!map[0] || !map[1] || !map[2]) ? 'pending' :

							       map[3] ? 'complete' : 'active';

						case 4:
							return _.all(map) ? 'active' : 'pending';

					}

				};

				$scope.getOver = function (row) { return row.peopleCount > row.Max };

				$scope.getUnder = function (row) { return row.peopleCount < row.Min };

				$scope.$watch('data.targetFTD', function (ftd) {

					// Bind the unit.courses to coursesDropdown for selectize
					$scope.coursesDropdown = caches.Units[ftd].Courses;

				});

				$scope.$watch('data.month', function (month) {

					if (month) {

						var instance = moment(month).add(-4, 'months'),

							labels = $scope.monthLabels = [];

						_.times(3, function () {
							labels.push(instance.add(1, 'months').format('MMM YYYY'));
						});


					}

				});

				$scope.$watch('data.Course_Requirements', function (text) {

					if ($scope.loaded && text) {

						var courses = {};

						// Iterate over all the requirements
						_.each(text, function (courseId) {

							courses[courseId] = angular.copy(caches.MasterCourseList[courseId]);

						});

						self.initialize(courses).then(function (d) {

							d.peopleCount = 0;

						});

					}

				});

			}

		}
	]
);
