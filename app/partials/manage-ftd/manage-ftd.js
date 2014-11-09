/*global FTSS, _, caches */

FTSS.ng.controller(
	'manage-ftdController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		'SP_CONFIG',
		function ($scope, $timeout, SharePoint, SP_CONFIG) {

			$scope.pageLimit = 50;

			var self = FTSS.controller($scope, {

				'sort' : 'InstructorName',
				'model': 'instructors',

				'modal': 'instructor-stats',
				'edit' : function (scope) {

					// Get a copy of the model
					var read = _.clone(FTSS.models.stats),

					    fetchStats = function (id) {

						    // Only do this for a valid entry
						    if (id) {

							    // Only include this instructor
							    read.params.$filter = '(InstructorId eq ' + id + ')';

							    // Request the classes for this instructor from SP
							    SharePoint.read(read).then(function (results) {

								    // Fill all the data relationships
								    _(results).each(utils.cacheFiller);

								    // for aggregate instructor stats
								    scope.stats = {
									    'Instructor Hours': 0,
									    'Classes Taught'  : 0,
									    'Total Students' : 0
								    };

								    // add the data back to the scope
								    scope.history = results;

								    _(results).each(function (course) {

									    scope.stats['Classes Taught']++;

									    scope.stats['Instructor Hours'] += course.Course.Hours;

									    scope.stats['Total Students'] += course.allocatedSeats;

								    })

							    });

						    }

					    };

					// Watch data.Id, this allows us to flip through instructors with the traverse directive
					scope.$watch('data.Id', fetchStats);

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

			$scope.addInstructor = function () {

				$scope.addNew = true;
				$scope.row = {};

				$scope.close = function () {
					$scope.row = {};
					$scope.addNew = false;
				}

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