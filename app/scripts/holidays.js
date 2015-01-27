/*global FTSS */

(function () {

	"use strict";

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
	 * @parms flat bool
	 */
	utils.getDownDays = (function () {

		// Class for our events
		var className = 'downDay',

		    // Default text for our family days
		    familyDayLabel = 'AETC Family Day',

		    // Collection of federal holidays
		    holidays = {

			    '2015-01-01': 'New Year\'s Day',
			    '2015-01-19': 'MLK Day',
			    '2015-02-16': 'President\'s Day',
			    '2015-05-25': 'Memorial Day',
			    '2015-07-03': 'Independence Day',
			    '2015-09-07': 'Labor Day',
			    '2015-10-12': 'Columbus Day',
			    '2015-11-11': 'Veterans Day',
			    '2015-11-26': 'Thanksgiving Day',
			    '2015-12-25': 'Christmas Day'
		    },

		    // Array of AETC down days
		    familyDays = [
			    '2015-01-02',
			    '2015-05-22',
			    '2015-07-02',
			    '2015-09-04',
			    '2015-11-27',
			    '2015-12-24',
			    '2015-12-31',
			    '2016-05-27',
			    '2016-07-05',
			    '2016-09-02',
			    '2016-11-25',
			    '2016-12-27'
		    ],

		    // We do this once at run time
		    dataSet = (function () {

			    // Build array of our federal holidays
			    var set = _.map(holidays, function (label, date) {

				    return {
					    'title'    : label,
					    'start'    : date,
					    'className': className
				    };

			    });

			    // Add the family days to the array
			    _.each(familyDays, function (day) {

				    set.push(
					    {
						    'title'    : familyDayLabel,
						    'start'    : day,
						    'className': className
					    });
			    });

			    return set;

		    }()),

		    // Create a lookup table for dates
		    flattened = _.pluck(dataSet, 'start');

		return function (flat) {

			// return the lookup table for the actual dataset
			return flat ? flattened : dataSet;

		};

	}());

}());
