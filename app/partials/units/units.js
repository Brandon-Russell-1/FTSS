/*global utils, FTSS, _, caches, angular */

FTSS.ng.controller(
	'unitsController',

	[
		'$scope',
		function ($scope) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'Base',
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

						var match = text.split(','),

						    courses = _(caches.MasterCourseList),

						    collection = [];

						_(match).each(function (val) {

							var valid = courses.findWhere({'PDS': val.trim().toUpperCase()}).value();
							valid && collection.push(valid.Id);

						});

						collection.length && FTSS.selectizeInstances.Courses_JSON.setValue(collection);

					};

				}

			});

			self

				.bind()

				.then(function (data) {

					      // Attach all the instructors to this unit
					      _(caches.Instructors).each(function (i) {

						      if (!i.Archived) {

							      var u = data[i.UnitId];

							      u.Instructors = u.Instructors || [];

							      u.Instructors.push(i.label);

						      }

					      });

					      self

						      .initialize(data)

						      .then(function (unit) {

							            // Flatten Instructors into string after sorting
							            if (_.isArray(unit.Instructors)) {

								            unit.InstructorsCount = unit.Instructors.length;

								            unit.Instructors = unit.Instructors.sort().join('<br>');

							            }

							            unit.Squadron = unit.Det < 300 ? '372 TRS' : '373 TRS';

							            if (unit.Courses_JSON) {

								            // Add all the course data to each unit for searching
								            unit.CoursesMap = _(unit.Courses_JSON)

									            .map(function (c) {

										                 return caches.MasterCourseList[c] || false;

									                 })

									            .compact()

									            .value();

								            // Flattened string (yes this is HTML in a controller :-( for Hover
								            unit.CoursesHover = _.map(unit.CoursesMap, function (c) {

									            if (unit.CoursesMap.length > 10) {
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