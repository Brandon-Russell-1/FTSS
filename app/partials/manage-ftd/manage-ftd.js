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

				'noFilter': true

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

			$scope.submit = function () {

				var send = $scope.row;

				send.UnitId = $scope.data.Id;
				send.cache = true;
				send.__metadata = 'Instructors';

				self._create(send, $scope.close);

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
					$scope.addNew = false;
				}

			};

			self.bind('filter').then(function (data) {

				var UnitId = parseInt($scope.filter.match(/\d+/)[0]),

				    read = _.clone(FTSS.models.scheduled),

				    today = moment().add(7, 'days'),

				    yearStart = moment().add(-1, 'years');

				$scope.data = caches.Units[UnitId];

				data = _.filter(data, {'UnitId': UnitId});

				// Only include this instructor
				read.params.$filter = '(UnitId eq ' + UnitId + ')';

				// Request the classes for this instructor from SP
				SharePoint.read(read).then(function (results) {

					var stats = _(results)

						// Load the cache data for every row (this one is a little expensive)
						.each(utils.cacheFiller)

						// Group the data by InstructorID
						.groupBy('InstructorId')

						// Return the chained value output from lodash
						.value();

					// Complete the controller initialization
					self.initialize(data).then(function (row) {

						var stat = stats[row.Id],

						    chart = [];

						row.search = row.InstructorName;

						// for aggregate instructor stats
						row.stats = {
							'Instructor Hours': 0,
							'Classes Taught'  : 0,
							'Total Students'  : 0
						};

						row.annualHours = 0;

						// add the data back to the scope
						row.history = stat;

						while (chart.length < 12) {
							chart.push(0);
						}

						_(stat).each(function (course) {

							// Tally all courses taught
							row.stats['Classes Taught']++;

							// Tally instructor hours
							row.stats['Instructor Hours'] += course.Course.Hours;

							// Tally all students taught
							row.stats['Total Students'] += course.allocatedSeats;

							// If course was taught in the last year, count hours for annualHours
							if (course.startMoment > yearStart && course.startMoment < today) {

								chart[course.startMoment.month()] += course.Course.Hours;

								row.annualHours += course.Course.Hours;

							}
						});

						(function () {

							var max = _.max(chart),

							    months = 'Jan.Feb.Mar.Apr.May.Jun.Jul.Aug.Sep.Oct.Nov.Dec'.split('.');

							row.chart = '';

							_(chart).each(function (item, index) {

								var pct = item ? Math.round((item / max) * 100) : 0;

								row.chart += '<b><em style="height:' + pct + '%">&nbsp;</em>' +

								             '<i>' + months[index] + '</i></b>';


							});

						}());

						// A rough estimate of instructor time utilization
						row.annualEffectiveness = Math.floor(row.annualHours / 19.2);

						row.InstructorEmail = row.InstructorEmail ?
						                      row.InstructorEmail.replace('mailto:', '') :
						                      '';

					});

				});

			});

		}
	]);