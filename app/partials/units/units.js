/*global FTSS, _, caches */

FTSS.ng.controller(
	'unitsController',

	[
		'$scope',
		function ($scope) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'Det',
				'group': 'LongName',

				'grouping': {
					'LongName': 'Squadron'
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

			self.bind().then(function (data) {

				self.initialize(data).then();

			});

		}
	]);