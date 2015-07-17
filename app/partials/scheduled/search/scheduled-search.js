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
		'geodata',
		function ($scope, $modal, notifier, classProcessor, controllerHelper, security, geodata) {

			$scope.ftss.searchPlaceholder = 'Type here to search within the available courses.';

			var self = controllerHelper($scope, {

				'sort' : 'Start',
				'group': 'Header',
				'model': 'scheduledSearch',

				'finalProcess': function () {

					/**
					 * Determines if we had no search results or not
					 * @returns boolean
					 */
					$scope.isEmpty = function () {
						return ($scope.ftss.tagMap.c || $scope.ftss.tagMap.u) && !parseInt($scope.ftss.itemCount.value, 10);
					};

				}

			});

			self.bind('ftss.filter').then(function (data) {

				$scope.autoApprove = security.hasRole(['ftd', 'scheduling']);

				$scope.canEdit = $scope.canRequest = security.hasRole(['utm', 'mts', 'ftd', 'scheduling']);

				// Reference for course headers:  IMDS: XXXXX    G081: XXXXX
				$scope.imds_g081 = {};

				self.initialize(data).then(function (row) {

					classProcessor.processRow(row);

					// Create a grouping header for this view
					row.Header = row.Course.PDS + ' - ' + row.Course.Number + ' (' + row.Course.MDS + ')';

					// Hide full classes by default
					row.Full = (row.openSeats < 1);

					// Simple left overlay for courses
					row.OverlayHover = _.template('Min: {{Course.Min}} / Max: {{Course.Max}}<br>{{ClassNotes}}')(row);

					row.locationName = row.MTT || row.FTD.LongName;
					row.locationCoords = (geodata.index[row.MTT] || row.FTD.Location).toString();

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
