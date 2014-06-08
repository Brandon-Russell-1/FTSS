/*global FTSS, caches, _, moment */

FTSS.ng.controller(
	'requirementsController',

	[
		'$scope',
		'SharePoint',
		function ($scope, SharePoint) {

			var self = FTSS.controller($scope, {
				'sort' : 'Course.PDS',
				'group': 'Month',

				'grouping': {
					'Month': 'Month'
				},

				'sorting': {
					'Course.PDS': 'Course'
				},

				'model': 'requirements',

				'edit': function (scope, create, row) {

					scope.data = row;

				}

			});

			self

				.bind('filter')

				.then(function (data) {

					      var stepBuilder, historyBuilder, processed;

					      stepBuilder = function (d) {

						      var hasActive = false,

						          getState = function (prop) {

							          var test = d[prop];

							          switch (true) {

								          case hasActive:
									          return 'pending';

								          case (test && test.substring(0, 3) === 'NO:'):
									          hasActive = true;
									          d.Denied = true;
									          d[prop] = {
										          'status': 'Denied',
										          'user'  : test.substring(3)
									          };
									          return 'denied';

								          case !!test:
									          d[prop] = {
										          'status': 'Approved',
										          'user'  : test
									          };
									          return 'complete';

								          default:
									          d.ActiveProp = prop;
									          hasActive = true;
									          return 'active';
							          }
						          };

						      d.steps = [
							      {
								      'text'  : 'MTF',
								      'status': 'complete'
							      },

							      {
								      'key'   : 'ApprovedCC',
								      'text'  : 'Group/CC',
								      'status': getState('ApprovedCC')
							      }
						      ];

						      if (d.TDY && !d.Funded) {

							      d.steps.push(
								      {
									      'key'   : 'ApprovedMAJCOM',
									      'text'  : 'MAJCOM',
									      'status': getState('ApprovedMAJCOM')
								      });

						      }

						      d.steps.push(
							      {
								      'key'   : 'Built',
								      'text'  : 'FTD',
								      'status': hasActive ? 'pending' : d.Archived ? 'complete' : 'active'
							      });


					      };

					      historyBuilder = function (d, r) {

						      _.each([1,
						              2,
						              3
						             ],

						             function (v) {

							             d['History' + v] = r[4]['d' + v] || 'Month ' + v;

							             var requested = r[4]['r' + v] || 0,

							                 built = r[4]['b' + v] || 0;

							             d.Requirements[r[0]]['history' + v] = (function () {

								             switch (true) {

									             case (requested < 1):

										             return  {
											             'style': 'text-muted',
											             'text' : 'None',
											             'val'  : '0'
										             };

									             case (requested > built):

										             var val = requested + ' / ' + built;

										             return {
											             'style': 'text-danger bold',
											             'text' : val,
											             'val'  : val
										             };

									             default:

										             return {
											             'style': 'text-success',
											             'text' : requested,
											             'val'  : requested + ' / ' + built
										             };

								             }

							             }());

						             });

					      };

					      processed = _.map(data, function (d) {

						      d.Host = caches.Hosts[d.HostId];
						      d.FTD = caches.Units[d.UnitId];

						      d.Month = moment(d.DateNeeded).format('MMMM YYYY');

						      d.totalSeats = 0;
						      d.Requirements = {};
						      d.History = {};

						      d.email = encodeURI('subject=FTSS 898 Submission - ' +
						                          d.Month +
						                          ' for ' +
						                          d.FTD.LongName);

						      stepBuilder(d);

						      _.each(d.Requirements_JSON, function (r) {

							      r[4] = r[4] || {};

							      var course = caches.MasterCourseList[r[0]],

							          students = _(r[3]).pluck(2).sort().value();

							      d.totalSeats += r[3].length;

							      d.Requirements[r[0]] = {

								      'course': course,

								      'priority': r[1],

								      'notes': r[2],

								      'seatCount': r[3].length,

								      'hover': '<dl>' +
								               '<dt>Notes</dt><dd><i>' + r[2] + '</i></dd></dl>' +
								               '<dl>' +
								               '<dt>Students</dt><dd> - ' + students.join('<br> - ') + '</dd></dl>'

							      };

							      historyBuilder(d, r);

						      });

						      delete d.Requirements_JSON;

						      return d;

					      });

					      self.initialize(processed).then();

				      });

			$scope.doUpdate = function (row, approve) {

				var send = {

					'cache': true,

					'__metadata': row.__metadata

				};

				if (row.ActiveProp) {

					SharePoint.user(row);

					send[row.ActiveProp] = (approve ? '' : 'NO:') + row.user.Name;

					// Call sharePoint.update() with our data and handle the success/failure response
					SharePoint.update(send).then(function (resp) {

						// HTTP 204 is the status given for a successful update, there will be no body
						if (resp.status === 204) {

							utils.alert.update();

							// Call actions.process() to reprocess the data by our controllers
							self.reload();

						} else {

							utils.alert.error('Unable to approve or deny 898.');

						}


					});

				}


			};

			$scope.approve = function () {

				$scope.doUpdate(this.row, true);

			};

			$scope.deny = function () {

				$scope.doUpdate(this.row, false);

			};

		}
	]);
