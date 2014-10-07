/*global FTSS */

FTSS.ng.controller(
	'requestsController',

	[
		'$scope',
		function ($scope) {

			var self = FTSS.controller($scope, {

				'sort' : 'status',
				'group': 'course',

				'grouping': {
					'course'     : 'Course',
					'status'     : 'Status',
					'Course.MDS' : 'MDS',
					'Course.AFSC': 'AFSC'
				},

				'sorting': {
					'status'     : 'Status',
					'course'     : 'Course',
					'Course.AFSC': 'AFSC'
				},

				'model' : 'scheduled',

				// We only want classes with requests
				'filter': 'Requests_JSON ne null'

			});

			self

				.bind('filter')

				.then(function (data) {

					      var collection = [];

					      _(data).each(function (row) {

						      _(row.Requests_JSON).each(function (request) {

							      row.request = _.zipObject(['Status',
							                                 'Students',
							                                 'Notes',
							                                 'HostId'
							                                ], request);

							      row.request.Host = caches.Hosts[row.request.HostId];

							      collection.push(row);
						      });
					      });

					      self

						      .initialize(data)

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
