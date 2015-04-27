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

			$scope.$watch('host.Id', function (hostId) {

				if (!hostId) return;

				loading(true);

				var self = controllerHelper($scope, {

					'sort': 'Number',

					'group': 'detRequest.Base',

					'model': 'requirements_stats',

					'filter': 'HostId eq ' + hostId,

					'finalProcess': function (groups) {

						$scope.flatData = [];

						// Make a flat copy of our data forth main list
						_.each(groups, function (group) {
							$scope.flatData = $scope.flatData.concat(group);
						});

					}

				});

				self.bind().then(function (backlogStats) {

					$scope.myHost = caches.Hosts[hostId];

					$scope.data = {};

					$scope.old = {};

					$scope.history = {};

					$scope.month = moment().add(3, 'months');
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

						$scope.month,

						($scope.ftss.itemCount.value > 0),

						$scope.groups ? _($scope.flatData).pluck( 'peopleCount').sum(): false,

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

				$scope.updateGrouping = function () {

					$scope.groups = _.groupBy(self.data, function (gp) {

						return gp.detRequest.Base;

					});

				};

				$scope.$watch('month', function (month) {

					if (month) {

						var instance = moment(month),

							labels = $scope.monthLabels = [];

						_.times(3, function () {
							labels.push(instance.add(-1, 'months').format('MMM YYYY'));
						});


					}

				});

				$scope.$watch('data.Course_Requirements', function (text) {

					if ($scope.loaded && text) {

						var courses = {};

						// Using the host.FTD property (if it exists) add the ftd object
						$scope.myFTD = $scope.myHost.FTD ? caches.Units[$scope.myHost.FTD] : false;

						if ($scope.myFTD) {
							$scope.myHost.Location = $scope.myFTD.Location;
						}

						// Iterate over all the requirements
						_.each(text, function (courseId) {

							var course = courses[courseId.Id] = angular.copy(caches.MasterCourseList[courseId]);

							// This will loop over each FTD and add itself to any courses in our list
							_.each(caches.Units, function (u) {

								var local = ($scope.myFTD.Id === u.Id);

								if (local || (course.Units.length < 5 && u.Courses_JSON.indexOf(courseId) > -1)) {

									var unit = {'Base': u.Base};

									// Add the unit to the list of available FTDs for this course
									course.Units.push(unit);

									course.hasLocal = course.hasLocal || local;

									if (local) {

										// For local, set the distance text to Local and distanceInt to 0 for sorting
										unit.distance = 'Local';
										unit.distanceInt = 0;

									} else {

										geodata.distances(unit, $scope.myHost.Location, u.Location);

									}

									unit.style = (unit.distanceInt < 50) ? 'info' : 'warning';

									unit.distanceText = u.Base + ' (' + unit.distance + ')';

								}

							});


						});

						self.initialize(courses).then(function (d) {

							// Finalize listFTD
							d.Units = _.sortBy(d.Units, 'distanceInt');

							// Pre-check our closest FTD if available
							d.detRequest = d.Units[0] || false;

							d.peopleCount = 0;

						});

					}

				});

			});

		}
	]
);
