/*global FTSS, angular, utils, moment, _ */

FTSS.ng.controller(
	'ttmsController',

	[
		'$scope',
		'SharePoint',
		function ($scope, SharePoint) {

			var self = FTSS.controller($scope, {

				    'sort' : 'Created',
				    'group': 'location',
				    'model' : 'ttms',

				    // We only want classes with requests
				    'filter': "TTMS eq null and Archived eq false"

			    });

			    $scope.inlineUpdate = function (row, field, setArchive) {

				    if (_.isEmpty(row[field])) {
					    return;
				    }

				    var send = {
					    'cache'     : true,
					    '__metadata': row.__metadata
				    };

				    send[field] = row[field];

				    // Call sharePoint.update() with our data and handle the success/failure response
				    SharePoint

					    .update(send)

					    .then(function (resp) {

						          // HTTP 204 is the status given for a successful update, there will be no body
						          if (resp.status === 204) {

							          utils.alert.update();

							          if (setArchive) {
								          row.Archived = true;
							          }

							          self.process();

						          } else {

							          utils.alert.error('Please try again later.');

						          }

					          });


			    };

			self

				.bind()

				.then(function (data) {

					      $scope.edit = angular.noop;

					      self.initialize(data).then(function (row) {

						      utils.cacheFiller(row);

						      row.age = moment(row.Created).fromNow();

						      row.location = row.FTD.LongName + ': ' + row.FTD.LCode;

					      });

				      });

		}
	]);

