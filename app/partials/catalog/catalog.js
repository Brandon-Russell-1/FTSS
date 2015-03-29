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

			// Increase to 99 due to the simple binding
			$scope.ftss.pageLimit = 99;

			var self = controllerHelper($scope, {

				'sort'        : 'PDS',
				'group'       : 'MDS',
				'model'       : 'catalog',

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
											'cache'     : true,

											// Erase the Class #
											'TTMS'      : null

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

				self.initialize(data).then(function (d) {

					// Ger our official MDS for this course
					d.MDS = courseNubmerParser(d.Number);

					d.search = [
						'mds:' + d.MDS,
						'pds:' + d.PDS,
						d.Number,
						d.Title
					].join(' ');

					d.Units = [];

					_.each(caches.Units, function (u) {

						if (u.Courses_JSON.indexOf(d.Id) > -1) {

							d.Units.push(u.label);
							d.search += ' ' + u.search;

						}

					});

					if (d.Units) {
						d.units = d.Units.sort().join('<br>');
					}

				});


			});
		}
	]);
