/*global FTSS, _, caches */

FTSS.ng.controller(
	'manage-ftdController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		function ($scope, $timeout, SharePoint) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'InstructorName',
				'model': 'instructors',

				'modal'    : 'instructor-stats',
				'edit'     : function (scope) {

					// Get a copy of the model
					var read = _.clone(FTSS.models.stats);

					// Only include this instructor
					read.params.$filter = '(InstructorId eq ' + scope.data.Id + ')';

					// Request the classes for this instructor from SP
					SharePoint.read(read).then(function (results) {

						_(results).each(utils.cacheFiller);

						scope.stats = results;

					});


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

			$scope.inlineUpdate = self.inlineUpdate;

			$scope.stats = function () {

				$scope.edit.apply(this);

			};

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