/*global utils, FTSS, caches */

FTSS.ng.controller(
	'scheduledController',

	[
		'$scope',
		'$modal',
		'notifier',
		'classProcessor',
		'controllerHelper',
		'security',
		function ($scope, $modal, notifier, classProcessor, controllerHelper, security) {

			$scope.ftss.searchPlaceholder = 'Type here to search within the available courses.';

			$scope.ftss.hasArchiveOption = true;

			var self = controllerHelper($scope, {

				'sort' : 'Start',
				'group': 'Header',
				'model': 'scheduledSearch',

				'finalProcess': function (groups) {

					_.each(groups, function (group) {

						group.instructors = _.groupBy(group, 'InstructorId');

					});

				}

			});

			self.bind('ftss.filter').then(function (data) {

				$scope.autoApprove = security.hasRole(['ftd', 'scheduling']);

				$scope.canEdit = $scope.canRequest = security.hasRole(['mtf', 'ftd', 'scheduling']);

				// Reference for course headers:  IMDS: XXXXX    G081: XXXXX
				$scope.imds_g081 = {};

				self.initialize(data).then(function (row) {

					classProcessor.processRow(row);

					// Create a grouping header for this view
					row.Header = row.Course.PDS + ' - ' + row.Course.Number + ' (' + row.Course.MDS + ')';

					// Hide full classes by default
					row.Archived = (row.openSeats < 1);

					// The URL for our mailTo link
					row.mailFTD = row.FTD.Email +
					              '?subject=FTSS Class Inquiry for ' +
					              row.Course.PDS +
					              ' Class #' +
					              row.TTMS;

					if (row.MTT) {

						row.locationName = row.MTT;
						row.locationCoords = caches.geodataFlat[row.MTT].toString()

					} else {

						row.locationName = row.FTD.LongName;
						row.locationCoords = row.FTD.Location;

					}

					// This is the hover image for each FTD
					row.map = row.locationCoords ?

					          'https://maps.googleapis.com/maps/api/staticmap?' +
					          'sensor=false&size=400x300&zoom=5&markers=color:red|' +
					          row.locationCoords.replace(/\s/g, '')

						: '';

					/**
					 * Allows J4/FTD members the ability to edit the Class # directly
					 *
					 * @type {Function}
					 */
					row.updateTTMS = $scope.autoApprove ? function () {

						self._update(row, {
							'__metadata': row.__metadata,
							'TTMS'      : row.TTMS
						});

					} : angular.noop;

				});

			});

		}
	])
;
