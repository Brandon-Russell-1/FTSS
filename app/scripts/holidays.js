/*global FTSS */

/**
 *
 */
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
	 * @returns {{title: string, start: string, className: string}[]}
	 */
	FTSS.utils.getDownDays = (function () {

		var className = 'downDay',

		    familyDayLabel = 'AETC Family Day',

		    dataSet = [

			    {
				    'title'    : 'New Year\'s Day',
				    'start'    : '2015-01-01',
				    'className': className
			    },

			    {
				    'title'    : 'MLK Day',
				    'start'    : '2015-01-19',
				    'className': className
			    },

			    {
				    'title'    : 'President\'s Day',
				    'start'    : '2015-02-16',
				    'className': className
			    },

			    {
				    'title'    : 'Memorial Day',
				    'start'    : '2015-05-25',
				    'className': className
			    },

			    {
				    'title'    : 'Independence Day',
				    'start'    : '2015-07-03',
				    'className': className
			    },

			    {
				    'title'    : 'Labor Day',
				    'start'    : '2015-09-07',
				    'className': className
			    },

			    {
				    'title'    : 'Columbus Day',
				    'start'    : '2015-10-12',
				    'className': className
			    },

			    {
				    'title'    : 'Veterans Day',
				    'start'    : '2015-11-11',
				    'className': className
			    },

			    {
				    'title'    : 'Thanksgiving Day',
				    'start'    : '2015-11-26',
				    'className': className
			    },

			    {
				    'title'    : 'Christmas Day',
				    'start'    : '2015-12-25',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-01-02',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-05-22',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-07-02',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-09-04',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-11-27',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-12-24',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2015-12-31',
				    'className': className
			    },

			    {
				    'title'    : familyDayLabel,
				    'start'    : '2016-05-27',
				    'className': className
			    },
			    {
				    'title'    : familyDayLabel,
				    'start'    : '2016-07-05',
				    'className': className
			    },
			    {
				    'title'    : familyDayLabel,
				    'start'    : '2016-09-02',
				    'className': className
			    },
			    {
				    'title'    : familyDayLabel,
				    'start'    : '2016-11-25',
				    'className': className
			    },
			    {
				    'title'    : familyDayLabel,
				    'start'    : '2016-12-27',
				    'className': className
			    }

		    ],

		    flattened = _.pluck(dataSet, 'start');

		return function (flat) {

			return flat ? flattened : dataSet;

		};

	}());

}());
