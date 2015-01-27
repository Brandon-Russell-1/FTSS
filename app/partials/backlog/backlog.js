/*global FTSS, caches, _, moment, utils, angular */

FTSS.ng.controller(
	'backlogController',

	[
		'$scope',
		'SharePoint',
		'$timeout',
		function ($scope, SharePoint) {

			$scope.month = moment().add(3, 'months');

			// TEMPORARY FOR DEV ONLY **************************


			$scope.data = {

				'Course_Requirements': [
					1371,
					855,
					854,
					1211
				]

			}

			// TEMPORARY FOR DEV ONLY **************************

			var self = FTSS.controller($scope, {

				'sort' : 'course.Number',
				'group': 'detRequest.Base',
				'modal': 'backlog',

				// We bind this controller to the requirement's stats for 898 building & tracking existing requests
				'model': 'requirements_stats',

				'finalProcess': function (groups) {

					$scope.flatData = [];

					// Make a flat copy of our data forth main list
					_.each(groups, function (group) {
						$scope.flatData = $scope.flatData.concat(group);
					});

				},

				'edit': function (scope, isNew, courses) {

					/**
					 * Generates a History property on the given course.
					 *
					 * This will calculate the month names, intervals & lookup any built/required history for
					 * the given months
					 *
					 * @param course - The course to build a history for
					 */
					var getHistory = function (course) {

						var int = 0,

						    month = moment().subtract(1, 'month'),

						    histories = course.History = {};

						while (int++ < 3) {

							var history = $scope.history[

								month
									.add(1, 'month')
									.format('YYMM')

								];

							histories['m' + int] = month.month();
							histories['d' + int] = month.format('MMM YY');
							histories['b' + int] = utils.deepRead(history, course + '.built') || '';
							histories['r' + int] = utils.deepRead(history, course + '.required') || '';

						}


					};

					_.each(courses, function (course) {

						// This just limits how many students are visible by default
						course.limit = 3;

						// Call our history builder for this course
						getHistory(course);

						// Get only the selected students
						course.students = _(course.requirements).map(function (req) {

							return req.selected ? req : false;

						}).filter().value();

					});

					// Add one last month to our momentJS object to get the 90 days out month
					courses.Month = moment().add(3, 'months');

					// This month value will be used as a JSON datestamp later on
					courses.month = courses.Month.toISOString();

					// Copy our courses object to the modal's scope
					scope.courses = courses;

					// If the course is < 50 miles away then this is a local course
					scope.local = courses[0].detRequest.distanceInt < 50;

				},

				'submit': function (scope) {

					scope.submitted = true;

					/**
					 * This object stores all our SharePoint batch calls.
					 *
					 * Because of the size and complexity of the data our _JSON fields will store everything as
					 * simple arrays instead of objects with named properties.  While this does tend to add some
					 * risk of data corruption (if we mess up in a later version and are off on the fields), it
					 * is a HUGE bandwidth saver as it cuts down significantly on the JSON size
					 *
					 */
					var oDataCall = {

						'requirement': {

							'cache': true,

							'__metadata': 'Requirements',

							'UnitId': scope.courses[0].detRequest.Id,

							'HostId': $scope.host.Id,

							'DateNeeded': scope.courses.month,

							'TDY': !scope.local,

							'Notes': scope.notes,

							'Requirements_JSON': []

						},

						'stats': {

							'cache': true,

							'__metadata': 'RequirementsStats',

							'Month': scope.courses.Month.format('YYMM'),

							'HostId': $scope.host.Id,

							'Data_JSON': {}

						}

					};

					// Iterate over each course in the modal and parse/add to oDataCall
					_.each(scope.courses, function (course) {

						var req = [
							    // Course
							    course.course.Id,

							    // Priority
							    course.priority,

							    // Notes
							    course.CourseNotes || '',

							    // Students
							    [],

							    // History
							    course.History
						    ],

						    //Students by ID # or name if no ID #
						    history = [];

						delete course.requirements;

						// Iterate through all the students and add to the 898 and stats respectively
						_.each(course.students, function (requirement) {

							requirement.selected = false;

							history.push(requirement.id);

							// Add each student (requirement) to the 898
							req[3].push(
								[
									// IMDS Id
									requirement.id,

									// IMDS Grade
									requirement.grade,

									// Name
									requirement.name,

									// Course date
									requirement.dueDate
								]);

						});

						$scope.checkStudent(course);

						// Add the requirement to the 898 call
						oDataCall.requirement.Requirements_JSON.push(req);

						// Add the stats for this requirement to the stats call
						oDataCall.stats.Data_JSON[course.course.Id] = [

							// This is the # of seats built (default to < 0)
							-1,

							// This is the list of student IDs for this request
							history
						];

					});

					SharePoint.batch(oDataCall).then(function (result) {

						if (result.success) {

							self.reload();

							scope.close();
							utils.alert.create();

							scope.submitted = false;

						} else {

							utils.alert.error('Batch 898 Creation failure');

						}

					});

				}

			});


			// Bind to $scope.filter for now just because it's easy---but probably should be refactored in FTSS.controller
			self.bind('filter').then(function (backlogStats) {

				//$scope.data = {};

				$scope.old = {};
				$scope.history = {};

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

				self.initialize().then();

			});

			/**
			 * Handles CSS class creation for TDY, local or unavailable courses
			 *
			 * @param row
			 * @returns {string}
			 */
			$scope.requestType = function (row) {

				var req = row.detRequest || _.find(row, 'Id').detRequest;

				return !req ? 'danger' :

				       (req.distanceInt < 50) ? 'info' :

				       'warning';

			};

			/**
			 * Used by the requirements wizard to report current progress for the user
			 *
			 * @param step
			 * @returns {string}
			 */
			$scope.getProgress = function (step) {

				var map = [

					$scope.month,

					($scope.count.value > 0),

					$scope.groups ? _.all($scope.flatData, function (course) {

						return (course.requirements || '').length;

					}) : false,

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

			$scope.getOver = function (row) {

				return row.requirements.length > row.course.Max;

			};

			$scope.getUnder = function (row) {

				return !row.requirements || row.requirements.length < row.course.Min;

			};

			$scope.buildKey = function () {

			};

			$scope.updateGrouping = function () {

				$scope.groups = _.groupBy(self.data, function (gp) {

					return gp.detRequest.Base;

				});

			};

			$scope.$watch('loaded', function (loaded) {
				if (loaded) {
					refreshCourses($scope.data.Course_Requirements);
				}
			});

			$scope.$watch('data.Course_Requirements', refreshCourses);

			function refreshCourses(text) {

				if ($scope.loaded && text) {

					var courses = {};

					// Read the host object from our dropdown selection
					$scope.host = FTSS.search.options[FTSS.search.getValue()].data || {};

					// Using the host.FTD property (if it exists) add the ftd object
					$scope.ftd = $scope.host.FTD ? caches.Units[$scope.host.FTD] : false;

					if ($scope.ftd) {
						$scope.host.Location = $scope.ftd.Location;
					}

					// Iterate over all the requirements
					_.each(text, function (c, k) {

						// This should always work--but just in case, get our course data from the course catalog
						//var course = _.findWhere(caches.MasterCourseList, {'IMDS': k}) || {};
						var course = caches.MasterCourseList[c];

						// If it's valid, add the course to the courses object
						if (course.Id) {

							courses[course.Id] = {
								'MDS'         : course.Title.split(' ')[0],
								'Id'          : course.Id,
								'requirements': c,
								'course'      : course,
								'priority'    : course.priority,
								'Priority'    : course.priority ? 'Priority Course(s)' : 'Regular Course(s)',
								'listFTD'     : []
							};

						}

					});

					// This will loop over each FTD and add itself to any courses in our list
					_.each(caches.Units, function (u) {

						var unit = angular.copy(u);

						_.each(unit.Courses_JSON, function (c) {

							var course = courses[c];

							if (course) {

								// Local if the host's FTD is requested
								unit.local = ($scope.ftd.Id === unit.Id);

								if (unit.local || course.listFTD.length < 5) {

									// Add the unit to the list of available FTDs for this course
									course.listFTD.push(unit);

									course.hasLocal = course.hasLocal || unit.local;

									if (unit.local) {

										// For local, set the distance text to Local and distanceInt to 0 for sorting
										unit.distance = 'Local';
										unit.distanceInt = 0;

									} else {

										// Not local so attempt to do our Cartesian calculation for a distance estimate
										var d = utils.distanceCalc($scope.host.Location, unit.Location) || 'unknown';

										// If the results aren't valid, just set distanceInt to past the Sun--yes, overkill?
										unit.distanceInt = parseInt(d, 10) || 99999999;

										// we can't just use toLocale() thanks to our favorite browser (IE)...grrrr
										unit.distance = utils.prettyNumber(d) + ' miles';

									}

									unit.distanceText = unit.Base + ' (' + unit.distance + ')';

								}

							}

						});

						delete unit.Courses;
						delete unit.Instructors;
						delete unit.Courses_JSON;

					});

					self

						// Send the generated data through the controller init function
						.initialize(courses)

						.then(function (d) {

							      d.search = d.course.search;

							      // Finalize listFTD
							      d.listFTD = _.sortBy(d.listFTD, 'distanceInt');

							      // Pre-check our closest FTD if available
							      d.detRequest = d.listFTD[0] || false;

							      d.requirements = [];

						      });

				}

			}
		}
	])
;
