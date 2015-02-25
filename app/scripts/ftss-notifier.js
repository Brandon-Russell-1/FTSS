/*global FTSS */

FTSS.ng.service('notifier', function () {

	this.generic = sendEmail;

	this.j4Update = function (data) {

		emailWrapper('FTD.Email',
		             'J4 Scheduling Update for {{Course.PDS}} - {{Course.Number}}',
		             'The following notes were left by Sheppard for the {{dateRange}} {{Course.PDS}} class:\n\n{{J4Notes}}')

		(data);

	};

	this.autoApprove = function (data) {

		emailWrapper('{{recipients}}',
		             'Automatic Seat Approval for {{subject}}',
		             '{{seats}} seats were approved for the {{host}}.\n\nDates:  {{dates}}\n\nStudents:\n{{students}}\n\n{{notes}}')

		(data);

	};

	this.requestSeats = function (data) {

		emailWrapper(
			'{{recipients}}',
			'New Seat Request for {{subject}}',
			'The {{host}} has requested {{seats}} seats for the {{dates}} class:\n\n' +
			'{{students}}\n\n{{notes}}\n\n\nView this request: https://cs1.eis.af.mil/sites/ftss#requests')

		(data);

	};

	this.cancelClass = function (data) {

		emailWrapper(
			'',
			'Scheduled Class Cancelled',
			'The following class was cancelled:\n\n{{Course.Number}}{{TTMS}} ({{dateRange}})at {{FTD.LongName}} ({{FTD.LCode}})')

		(data);

	};

	this.updateClass = function (data) {

		emailWrapper(
			'',
			'Scheduled Class Change',
			'The following class dates were changed:\n\n{{Course.Number}}{{TTMS}} at {{FTD.LongName}} ({{FTD.LCode}})\n\n' +
			'Original: {{oldDateRange}}\nUpdated: {{dateRange}}')

		(data);

	};

	this.respondToRequest = function (data) {

		emailWrapper(
			'{{request.Host.Email}}',
			'FTD Seat Request Response for {{Course.PDS}}',
			'Seat request for {{Course.Number}} ({{dateRange}}) {{status}}.\n\n{{row.students}}\n\nFTD Notes:{{response}}')

		(data);

	};


	/**
	 * Wraps/parses our email templates for sending to SharePoint
	 *
	 * @param to String
	 * @param subject String
	 * @param body String
	 * @param data Object
	 */
	function emailWrapper(to, subject, body) {

		return function (data) {
			sendEmail(
				{
					'to'     : _.template(to)(data),
					'subject': _.template(subject)(data),
					'body'   : _.template(body)(data)
				});
		}

	}

	/**
	 * Send Email notification
	 *
	 * Use to send email notification to a user.  The requester is automatically CC'd.
	 * @param send Object Must have to, subject, body properties.
	 */
	function sendEmail(send) {

		// Only create this if this if it is valid and we are running in production mode
		if (PRODUCTION && send.to && send.subject && send.body) {

			SharePoint.create(
				{

					'__metadata': 'Notifier',
					'To'        : send.to,
					'Subject'   : send.subject,
					'Body'      : '\n' + send.body.replace(/(undefined|null)/gi, ' ') +
					            '\n\n\n\nhttp://go.usa.gov/HCAC'

				});

		} else {
			console && console.log(send);
		}

	}

});