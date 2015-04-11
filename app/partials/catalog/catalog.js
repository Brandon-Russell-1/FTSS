/*global utils, FTSS, _, caches */

FTSS.ng.controller(
	'catalogController',

	[
		'$scope',
		'SharePoint',
		'controllerHelper',
		'security',
		'courseNumberParser',
		function ($scope, SharePoint, controllerHelper, security, courseNubmerParser) {

			$scope.ftss.searchPlaceholder =
				'Type here to search the catalog.  Examples: MDS:F-15, PDS:RFV, Robins, wire, 2A5*.';

			var self = controllerHelper($scope, {

				'sort' : 'PDS',
				'group': 'MDS',
				'model': 'catalog',

				// Actions to perform prior the SP Post operation
				'beforeSubmit': function (scope) {

					// Check to make sure this is an existing course and the Number was changed
					if (scope.data.Id && scope.data.Number !== self.data[scope.data.Id].Number) {

						// Copy the model from FTSS.models
						var model = FTSS.models('courseInvalidate');

						// Search the schedule for active/built classes that match this CourseId
						model.params.$filter = [
							'CourseId eq ' + scope.data.Id,
							'TTMS ne null',
							'Archived eq false'
						].join(' and ');

						SharePoint.read(model).then(function (result) {

							// Create moment() for today
							var today = moment(),

							// Restrict to only future scheduled classes
								collection = [];

							// Iterate over results
							_.each(result, function (test) {

								// Ignore old classes
								if (today < moment(test.Start)) {

									// Nullify TTMS
									collection.push(
										{
											// Pass the URL to modify
											'__metadata': test.__metadata,

											// Tell ngSharePoint to add a cache field
											'cache': true,

											// Erase the Class #
											'TTMS': null

										});

								}

							});

							// If there are classes that needed to be edited, send them to the batch POST action
							collection.length && SharePoint.batch(collection);


						})

					}

				}

			});

			self.bind().then(function (data) {

				// Only permit special roles read/write access (still has server-level security)
				$scope.canEdit = security.hasRole(['curriculum', 'scheduling']);

				self.initialize(data).then(function (course) {

					// Hide invalid courses
					course.Archived = course.PDS.length < 3;

					course.imds_g081 = [];

					course.IMDS && course.imds_g081.push('IMDS: ' + course.IMDS);
					course.G081 && course.imds_g081.push('G081: ' + course.G081);

					course.imds_g081 = course.imds_g081.join(' / ');

					// Ger our official MDS for this course
					course.MDS = courseNubmerParser(course.Number);

					course.search = [
						'mds:' + course.MDS,
						'pds:' + course.PDS,
						course.Number,
						course.Title
					].join(' ');

					course.Units = [];

					_.each(caches.Units, function (u) {

						if (u.Courses_JSON.indexOf(course.Id) > -1) {

							course.Units.push(u.Base + ' (' + u.Det + ')');
							course.search += ' ' + u.search;

						}

					});

					if (course.Units) {
						course.units = course.Units.sort().join('<br>');
					}

				});


			});
		}
	]);
