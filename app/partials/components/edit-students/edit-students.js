/*global FTSS, angular */

(function () {

	"use strict";

	FTSS.ng.directive(
		'editStudents',

		[
			'$timeout',
			'SharePoint',
			'classProcessor',
			'utilities',
			'security',

			function ($timeout, SharePoint, classProcessor, utilities, security) {

				return {
					'scope'      : true,
					'templateUrl': function (elem, attrs) {
						return '/partials/edit-students-' + (attrs.templateurl || 'placeholder') + '.html';
					},
					'link'       : function (scope, el, attrs) {

						// Support embed instead of modal dialog
						scope.embed = (attrs.templateurl === 'embed');

						scope.canEditSeats = security.hasRole(['ftd', 'scheduling']);

						// For resources view, we have to lookup the data first
						if (scope.getRow) {

							scope.data = scope.getRow(el[0].getAttribute('lookup'));

						} else {

							scope.data = scope.data || scope.row.Class || scope.row;
						}

						// Process our student data if there are approved seats
						scope.editStudents = function () {

							// If we have any registered students, load them async
							if (scope.data.Approved) {

								var read = FTSS.models('requests');

								// Search for all requests for this particular class
								read.params.$filter = 'ClassId eq ' + scope.data.Id;

								SharePoint.read(read).then(function (requests) {

									// Disable to show the list of requests
									scope.loadingStudents = false;

									// Process all the students rows
									scope.students = classProcessor.requestProcessor(requests);

								});

								// Set to disable rendering an empty list
								scope.loadingStudents = true;

							}

							// Open our modal dialog when embed is false
							!scope.embed && utilities.modal('edit-students', scope);

						};

						//  Action performed when the users presses submit
						scope.submit = function () {

							// Get a reference to the request object
							var request = this.request,

								// get a reference to the data object
								classData = this.data,

								// track the difference in seats
								diff = request.count - request.peopleCount,

							// the first change to send to sharepoint, we'll just resend everything for simplicities sake
								send = [
									{

										// metadata to idenfity which record to update
										'__metadata': request.__metadata,

										// The FTD response
										'Response': request.Response,

										// The current status--"Canceled" if there are no more seats allocated
										'Status': (request.peopleCount < 1) ? 'Cancelled' : request.Status,

										// Copy the updated student list from selectize
										'Students_JSON': request.People

									}
								];

							// Only update the scheduled model for additions.cancellations
							(diff !== 0) && send.push({

								// the scheduled model is cached
								'cache': true,

								// Tell SharePoint what record to update
								'__metadata': classData.__metadata,

								// Upate only the Approved field
								'Approved': classData.Approved - diff,

								// On success, update our parent model as well
								'callback': function (response) {

									// The Approved seat count
									scope.data.Approved = (classData.Approved - diff);

									// The etag so we can still do other edits in for this class
									scope.data.__metadata.etag = response.etag;

								}

							});

							// Reset our dirty tracking for the form
							this.modal.$setPristine();

							// Send the operation as a batch (similar to a SQL transaction) to ensure everything worked
							SharePoint.batch(send).then(function (results) {

								utilities.alert[results.success ? 'create' : 'error']();

							});

						};

						scope.embed && scope.editStudents();

					}

				};

			}
		]
	);

}());
