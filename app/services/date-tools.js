/*global FTSS */

FTSS.ng.service('dateTools', [

	'appAssets',

	function (appAssets) {

		var _y2k = moment('2000-01-01', 'YYYY-MM-DD'),

			/**
			 * @name dateTools
			 */
			_self = this,

			/**
			 *  Holiday and down day list
			 *
			 *  This is our static list of federal holidays and AETC down days.
			 *  We'll try to keep this list updated by calendar year.
			 *
			 *  Family days were pulled from the AETC MFR dated 11-5-2013,
			 *  AETC Family Days for Calendar Years 2015 - 2016.
			 *
			 *  Federal holidays are from opm.gov.
			 *
			 */
			_downDays = {};

		// Load the data from SharePoint
		appAssets.process(function (data) {

			_downDays = data.downDays;

			/**
			 * Calendar-friendly list of holidays and AETC down days
			 *
			 * @name dateTools#downDays
			 * @type {Array}
			 */
			_self.downDays = _.map(_downDays, function (label, date) {

				return {
					'title'    : label,
					'start'    : date,
					'className': 'downDay'
				};

			});

			/**
			 * Simple array of down days in the format YYYY-MM-DD
			 *
			 * @name dateTools#downDaysSimple
			 * @type {Array}
			 */
			_self.downDaysSimple = _.keys(_downDays);

		});

		/**
		 * Reference to our today pseudo-value
		 *
		 * @name dataTools#today
		 */
		this.today = moment().diff(moment('2000-01-01'), 'days');

		/**
		 * Convert a _y2k day offset to the actual day
		 *
		 * @name dateTools#startDayFinder
		 * @param days
		 * @returns {*}
		 */
		this.startDayFinder = function (days) {

			return _y2k.clone().add(days, 'days');

		};

		/**
		 * Convert a moment to the _y2k day offset
		 *
		 * @name dateTools#startDayCreator
		 * @param {moment|Number} start The moment object to reference or month offset to start from
		 * @returns {Number} startOffset
		 */
		this.startDayCreator = function (start) {

			start = _.isNumber(start) ? moment().add(start, 'months').startOf('month') : start;

			return start.diff(_y2k, 'days');

		};

		/**
		 * Create a text date range from a start/end pair
		 *
		 * @name dateTools#dateRange
		 * @param {Object} row
		 */
		this.dateRange = function (row) {

			row.startMoment = _self.startDayFinder(row.Start);
			row.endMoment = row.startMoment.clone().add(row.Days, 'days');

			row.dateRange = row.startMoment.format('D MMM YYYY') +

			                // We need this because FullCalendar goes through to the next morning at 00:00
			                (row.Days > 0 ? (' - ' + row.endMoment.clone().add(-1, 'days').format('D MMM YYYY') ) : '');

		};

		/**
		 * Check if this is a down day (holiday/family day)
		 *
		 * @name datetools#isDownDay
		 * @param {moment} date
		 * @returns boolean
		 */
		this.isDownDay = function (date) {

			return _downDays[date.format('YYYY-MM-DD')];

		};

		/**
		 * Check if this is a weekend
		 *
		 * @param {moment} date
		 * @returns {boolean}
		 */
		this.isWeekend = function (date) {

			return date.isoWeekday() > 5;

		};

	}
]);