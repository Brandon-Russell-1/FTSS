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

			// This allows us to copy & paste lists of PDS codes for an FTD
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

			// This handles our drag & drop photo operations
			$scope.onFileSelect = function ($files) {

				var reader = new FileReader(),

				    // Get a reference to item's scope
				    scope = this,

				    // Angular is super-dumb about ng-repeat updates so we'll just break the rules and use jQuery...
				    spinner = $('#spinner' + (scope.row.Id || ''));

				// Use jquery to turn on the upload spinner
				spinner.addClass('submitting');

				reader.onload = function (result) {

					var // Get the file buffer
					    rawBuffer = result.target.result,

					    // Create a random file anem
					    rand = utils.generateUUID();

					$.ajax({
						       'url'        : SP_CONFIG.baseURL + 'Bios',
						       'type'       : 'POST',
						       'data'       : rawBuffer,
						       'processData': false,
						       'contentType': 'multipart/form-data',
						       'headers'    : {
							       'accept': "application/json;odata=verbose",
							       'slug'  : FTSS.photoURL + rand + '.jpg'
						       },
						       'success'    : function () {

							       // When complete, remove the spinner and refresh the photo directive
							       var finish = function () {

								       spinner.removeClass('submitting');
								       spinner.data().update();

							       };

							       // Add the new photo URL back to the scope
							       scope.row.Photo = rand;

							       // If this an existing item, call inlineUpdate();
							       if (scope.row.Id) {

								       self.inlineUpdate.call(scope, 'Photo', finish);

							       } else {
								       finish();
							       }

						       },
						       error        : utils.alert.error
					       });
				};

				reader.readAsArrayBuffer($files[0]);

			};

			// Bind inlineUpdate to the scope
			$scope.inlineUpdate = self.inlineUpdate;

			// We use $scope.edit's modal function to show instructor stats
			$scope.stats = function () {

				// We have to pass our context to $scope.edit for the instructor stats
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