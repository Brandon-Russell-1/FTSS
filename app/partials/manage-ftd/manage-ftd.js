/*global FTSS, _, caches */

FTSS.ng.controller(
	'manage-ftdController',

	[
		'$scope',
		'$timeout',
		'SharePoint',
		'SP_CONFIG',
		'controllerHelper',
		'utilities',
		function ($scope, $timeout, SharePoint, SP_CONFIG, controllerHelper, utilities) {

			$scope.ftss.hasArchiveOption = true;

			var self = controllerHelper($scope, {

				'sort' : 'Name',
				'model': 'instructors',
				'modal': 'instructor-stats'

			});

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

					// Create a random file name
						rand = utilities.generateUUID();

					$.ajax({
						'type'       : 'POST',
						'url'        : FTSS.photoURL.replace('photos/', '_vti_bin/ListData.svc/Photos'),
						'data'       : rawBuffer,
						'processData': false,
						'contentType': 'multipart/form-data',
						'headers'    : {
							'accept': "application/json;odata=verbose",
							'slug'  : FTSS.photoURL + rand + '.jpg'
						},
						'success'    : function () {

							// Add the new photo URL back to the scope
							scope.row.Photo = rand;

							// If this an existing item, call inlineUpdate();
							scope.row.Id ? self.inlineUpdate.call(scope, 'Photo', finish) : finish();

							// When complete, remove the spinner and refresh the photo directive
							function finish() { spinner.removeClass('submitting') }

						},

						error: utilities.alert.error

					});
				};

				reader.readAsArrayBuffer($files[0]);

			};

			$scope.submit = function () {

				var send = $scope.data;

				send.Name = send.Person.DISPLAYNAME;
				send.Email = send.Person.EMAIL;
				send.UnitId = $scope.ftd.Id;
				send.cache = true;
				send.__metadata = 'Instructors';

				delete send.Person;

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
				$scope.data = {};

				$scope.close = function () {
					$scope.addNew = false;
				};

			};

			$scope.updateFTD = function () {

				var det = $scope.det,

					send = {
						'cache'       : true,
						'__metadata'  : det.__metadata,
						'Courses_JSON': det.Courses_JSON,
						'Email'       : det.Email,
						'Phone'       : det.Phone
					};

				self._update(det, send, function () {

					$scope.ftdEdit.$setPristine();
					det.submitted = false;

				}, true);

			};

			$scope.$watch('det.Courses_JSON', function (courses, old) {

				old && $scope.ftdEdit.$setDirty();

			});

			self.bind().then(function (data) {

				var UnitId = $scope.ftd.Id;

				$scope.det = caches.Units[UnitId];

				// Only include instructors for this unit
				data = angular.copy(_.filter(data, {'UnitId': UnitId}));

				// Complete the controller initialization
				self.initialize(data).then(function (row) {

					row.search = row.Name;

				});

			});

		}
	]);