/*global FTSS, _, caches */

FTSS.ng.controller(
	'manage-ftdController',

	[
		'$scope',
		'$timeout',
		function ($scope, $timeout) {

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

			$scope.onFileSelect = function ($files) {

				var reader = new FileReader(),

				    scope = this;

				$timeout(function () {
					scope.row.submitted = true;
				});

				reader.onload = function (result) {

					var rawBuffer = result.target.result,

					    rand = utils.generateUUID(),

					    url = (PRODUCTION ?

					           'https://cs1.eis.af.mil/sites/FTSS/rebuild' :

					           'http://virtualpc/dev') + '/_vti_bin/ListData.svc/Bios',

					    slug = (PRODUCTION ? 'https://cs1.eis.af.mil/sites/FTSS/rebuild/Bios/' : '/dev/Bios/');

					$.ajax({
						       'url'        : url,
						       'type'       : 'POST',
						       'data'       : rawBuffer,
						       'processData': false,
						       'contentType': 'multipart/form-data',
						       'headers'    : {
							       'accept': "application/json;odata=verbose",
							       'slug'  : slug + rand + '.jpg'
						       },
						       'success'    : function () {

							       scope.row.Photo = rand;

							       self.inlineUpdate.call(scope, 'Photo', function () {
								       scope.row.submitted = false;
							       });

						       },
						       error        : function () {
							       utils.alert.error();
						       }
					       });
				};

				reader.readAsArrayBuffer($files[0]);

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