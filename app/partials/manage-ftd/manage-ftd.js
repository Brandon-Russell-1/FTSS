/*global FTSS, _, caches */

FTSS.ng.controller(
	'manage-ftdController',

	[
		'$scope',
		function ($scope) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'InstructorName',
				'model': 'instructors',

				'edit': function (scope, create) {

					if (create) {

						scope.data.UnitId = $scope.data.Id;

					}

				}

			});

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

			//$scope.submit = self.update($scope, false, false, FTSS.models.units);
			$scope.submit = function () {

				send = {
					'cache'       : true,
					'__metadata'  : $scope.data.__metadata,
					'Courses_JSON': $scope.data.Courses_JSON,
					'Email'       : $scope.data.Email
				};

				self._update($scope, send, $scope.modal.$setPristine);

			};

			$scope.inlineUpdate = self.inlineUpdate;

			self.bind('filter').then(function (data) {

				var UnitId = parseInt(FTSS.search.getValue().pop().split(':').pop());

				$scope.data = caches.Units[UnitId];

				self.initialize(data).then(function (row) {

					row.InstructorEmail = row.InstructorEmail ?
					                      row.InstructorEmail.replace('mailto:', '') :
					                      '';


				});

			});

		}
	]);