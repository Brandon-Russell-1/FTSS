/*global FTSS, angular, utils, moment, _ */

FTSS.ng.controller(
	'ttmsController',

	[
		'$scope',
		'SharePoint',
		function ($scope, SharePoint) {

			var self = FTSS.controller($scope, {

				    'sort'  : 'startInt',
				    'group' : 'course',
				    'model' : 'ttms',

				    // We only want classes with requests
				    'filter': "TTMS eq null and Archived eq false"

			    }),

			    today = moment();

			$scope.inlineUpdate = function (field, setArchive) {

				self.inlineUpdate.call(this, field, function (data) {

					if (setArchive) {

						data.Archived = true;

					} else {

						// J4-specific request for internal messaging, prefix with '#' to not send an email, issue #12
						if (data.J4Notes[0] !== '#') {

							// Send any notes back to the FTD through email
							utils.sendEmail(
								{
									'to'     : data.FTD.Email,
									'subject': 'J4 Scheduling Update for ' + data.Course.PDS,
									'body'   : _.template('The following notes were left by Sheppard for the ' +
									                      '{{Course.PDS}} class starting {{startText}}:' +
									                      '\n\n{{J4Notes}}',
									                      data)
								});

						}

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

						      row.startInt = moment(row.Start);

						      // Archive classes that have already started
						      if (row.startMoment.diff(today, 'days') < 0) {
							      row.Archived = true;
						      }

						      row.search = [
							      row.ClassNotes,
							      row.Course.text,
							      row.Instructor.InstructorName,
							      row.FTD.text
						      ].join(' ');

						      row.course = [
							      row.Course.PDS,
							      ' - ',
							      row.Course.Number,
							      ' (Max: ',
							      row.Course.Max,
							      ')'
						      ].join('');

					      });

				      });

		}
	]);

