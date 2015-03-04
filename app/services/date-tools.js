/*global FTSS */

FTSS.ng.service('dateTools', [

	function () {

		var _y2k = moment('2000-01-01', 'YYYY-MM-DD'),

		    _familyDay = 'AETC Family Day',

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
		    _downDays = {

			    // Federal holidays
			    '2015-01-01': 'New Year\'s Day',
			    '2015-01-19': 'MLK Day',
			    '2015-02-16': 'President\'s Day',
			    '2015-05-25': 'Memorial Day',
			    '2015-07-03': 'Independence Day',
			    '2015-09-07': 'Labor Day',
			    '2015-10-12': 'Columbus Day',
			    '2015-11-11': 'Veterans Day',
			    '2015-11-26': 'Thanksgiving Day',
			    '2015-12-25': 'Christmas Day',

			    // AETC down days
			    '2015-01-02': _familyDay,
			    '2015-05-22': _familyDay,
			    '2015-07-02': _familyDay,
			    '2015-09-04': _familyDay,
			    '2015-11-27': _familyDay,
			    '2015-12-24': _familyDay,
			    '2015-12-31': _familyDay,
			    '2016-05-27': _familyDay,
			    '2016-07-05': _familyDay,
			    '2016-09-02': _familyDay,
			    '2016-11-25': _familyDay,
			    '2016-12-27': _familyDay
		    };

		/**
		 * Calendar-friendly list of holidays and AETC down days
		 *
		 * @type {Array}
		 */
		this.downDays = _.map(_downDays, function (label, date) {

			return {
				'title'    : label,
				'start'    : date,
				'className': 'downDay'
			};

		});

		/**
		 * Simple array of down days in the format YYYY-MM-DD
		 *
		 * @type {Array}
		 */
		this.downDaysSimple = _.keys(_downDays);

		/**
		 * Convert a _y2k day offset to the actual day
		 *
		 * @param days
		 * @returns {*}
		 */
		this.startDayFinder = function (days) {

			return _y2k.clone().add(days, 'days');

		};

		/**
		 * Convert a moment to the _y2k day offset
		 *
		 * @param start
		 * @returns {*}
		 */
		this.startDayCreator = function (start) {

			return start.diff(_y2k, 'days');

		};

		/**
		 * Create a text date range from a start/end pair
		 *
		 * @param row
		 */
		this.dateRange = function (row) {

			row.startMoment = _self.startDayFinder(row.Start);
			row.endMoment = row.startMoment.clone().add(row.Days, 'days');

			row.dateRange = row.startMoment.format('D MMM YYYY') +

			                // We need this because FullCalendar goes through to the next morning at 00:00
			                (row.Days > 0 ? (' - ' + row.endMoment.clone().add(-1, 'days').format('D MMM YYYY') ) : '');

		};

		/**
		 * Check if this is a down day or not (weekend/holiday/family day)
		 *
		 * @param date
		 * @returns boolean
		 */
		this.isDownDay = function (date) {

			return date.isoWeekday() > 5 ||

			       _downDays[date.format('YYYY-MM-DD')];

		};

	}
]);