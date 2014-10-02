/*global FTSS, _, caches */

FTSS.ng.controller(
	'unitsController',

	[
		'$scope',
		function ($scope) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'Det',
				'group': 'Squadron',

				'grouping': {
					'Squadron': 'Squadron'
				},

				'sorting': {
					'Base': 'Base',
					'Det' : 'Detachment'
				},

				'model': 'units',

				edit: function () {

					FTSS.pasteAction = function (text) {

						var match = text.toUpperCase().match(/(\w+)/g),

						    courses = _(caches.MasterCourseList),

						    collection = [];

						_(match).each(function (val) {

							var valid = courses.find({'PDS': val});

							valid && collection.push(valid.Id);

						});

						collection.length && FTSS.selectizeInstances.Courses_JSON.setValue(collection);

					};

				}

			});

			self

				.bind()

				.then(function (data) {

					      self

						      .initialize(data)

						      .then(function (unit) {

							            // Flatten Instructors into string

							            unit.Instructors = _.where(caches.Instructors, {'UnitId': unit.Id});

							            unit.InstructorsList = _.pluck(unit.Instructors, 'label').sort().join('<br>');

							            unit.Squadron = unit.Det < 300 ? '372 TRS' : '373 TRS';

							            if (unit.Courses_JSON) {

								            unit.Courses = [];

								            _(unit.Courses_JSON).each(function (course) {

									            unit.Courses.push(caches.MasterCourseList[course]);

								            });

								            // Flattened string (yes this is HTML in a controller :-( for Hover
								            unit.CoursesHover = _.map(unit.Courses, function (c) {

									            if (unit.Courses.length > 10) {
										            return '<div class="col-lg-4" hover="' +
										                   c.Title +
										                   '" left><b>' +
										                   c.PDS +
										                   '</b>: ' +
										                   c.Number +
										                   '</div>';
									            } else {
										            return '<dt class="tiny">' +
										                   c.PDS +
										                   '</dt><dd>' +
										                   c.Number +
										                   '<br><small class="truncate">' +
										                   c.Title +
										                   '</small></dd>';
									            }

								            }).join('');

							            }

						            });

				      });

		}
	]);