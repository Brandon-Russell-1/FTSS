/*global FTSS */

FTSS.ng.controller(
	'requestsController',

	[
		'$scope',
		function ($scope) {

			var self = FTSS.controller($scope, {

				'sort' : 'Start',
				'group': 'Course.Number',

				'grouping': {
					'Course.Number': 'Course'
				},

				'sorting': {

					'Start'                  : 'Start Date',
					'request.Students.length': '# Requested',
					'request.Host.Unit'      : 'Unit'

				},

				'model' : 'scheduled',

				// We only want classes with requests
				'filter': 'Requests_JSON ne null'

			});

			self

				.bind('filter')

				.then(function (data) {

					      $scope.edit = angular.noop;

					      var collection = [];

					      _(data).each(function (group) {

						      _(group.Requests_JSON).each(function (request) {

							      var row = _.clone(group);

							      row.request = _.zipObject(['Status',
							                                 'Students',
							                                 'Notes',
							                                 'HostId'
							                                ], request);

							      row.request.Host = caches.Hosts[row.request.HostId];

							      utils.cacheFiller(row);

							      row.search = [
								      row.ClassNotes,
								      row.Course.text,
								      row.Instructor.label,
								      row.TTMS,
								      row.request.Host.Text,
								      row.request.Notes,
								      row.request.Students.join(' ')
							      ].join(' ');

							      collection.push(row);
						      });
					      });

					      self

						      .initialize(collection)

						      .then(function (row) {

							            utils.cacheFiller(row);

							            row.status = {'1': 'Pending', '2': 'Approved', '3': 'Denied'}[row.Status];

							            row.icon = {'1': 'time', '2': 'approve', '3': 'deny'}[row.Status];

							            row.iconClass = {'1': 'info', '2': 'success', '3': 'danger'}[row.Status];

							            row.mail = '?subject=' +
							                       encodeURIComponent('FTD Registration (' + row.Course.Title + ')') +
							                       '&body=' +
							                       encodeURIComponent(row.start +
							                                          ' - ' +
							                                          row.end +
							                                          '\n' +
							                                          row.FTD.Base);


							            row.openSeatsClass = row.reqSeats > row.openSeats ? 'danger' : 'success';

						            });


				      });

		}
	]);
