/*global FTSS, angular, utils, moment, _ */

FTSS.ng.controller(
	'ttmsController',

	[
		'$scope',
		'SharePoint',
		function ($scope, SharePoint) {

			var self = FTSS.controller($scope, {

				'sort' : 'age',
				'group': 'location',

				'grouping': {
					'location': 'Location'
				},

				'sorting': {

					'Start': 'Start Date',
					'age'  : 'Age'

				},

				'model' : 'ttms',

				// We only want classes with requests
				'filter': "TTMS eq null and Archived eq false"

			});

			self

				.bind()

				.then(function (data) {

					      $scope.edit = angular.noop;

					      $scope.addTTMS = function (row) {

						      if (_.isEmpty(row.TTMS)) {
							      return;
						      }

						      // Call sharePoint.update() with our data and handle the success/failure response
						      SharePoint

							      .update({
								              'cache'     : true,
								              '__metadata': row.__metadata,
								              'TTMS'      : row.TTMS
							              })

							      .then(function (resp) {

								            // HTTP 204 is the status given for a successful update, there will be no body
								            if (resp.status === 204) {

									            utils.alert.update();

									            row.Archived = true;

									            self.process();

								            } else {

									            utils.alert.error('Please try again later.');

								            }

							            });

					      };

					      self.initialize(data).then(function (row) {

						      utils.cacheFiller(row);

						      if (row.ClassNotes) {

							      row.ClassNotes = 'FTD: ' + row.ClassNotes;

						      }

						      row.age = moment(row.Created).fromNow();

						      row.location = row.FTD.LongName + ': ' + row.FTD.LCode;

					      });

				      });

		}
	]);

