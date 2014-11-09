/*global utils, FTSS, _, angular, moment, caches */

/**
 * Performs nested property lookups without eval or switch(e.length), removed try {} catch(){}
 * due to performance considerations.  Uses a short-circuit for invalid properties & returns false.
 *
 * data = {
 *   a1: { b1: "hello" },
 *	 a2: { b2: { c2: "world" } }
 *	}
 *
 * deepRead(data, "a1.b1") => "hello"
 *
 * deepRead(data, "a2.b2.c2") => "world"
 *
 * deepRead(data, "a1.b2") => false
 *
 * deepRead(data, "a1.b2.c2.any.random.number.of.non-existant.properties") => false
 *
 * @param {object} data - The collection to iterate over
 * @param {string} expression - The string expression to evaluate
 *
 * @return {various | boolean} retVal - Returns the found property or false if not found
 *
 */
utils.deepRead = function (data, expression) {

	// Cache a copy of the split expression, then set to exp
	var exp = (expression || '').split('.'), retVal;

	// Recursively read the object using a do-while loop, uses short-circuit for invalid properties
	do {
		retVal = (retVal || data || {})[exp.shift()] || false;
	} while (retVal !== false && exp.length);

	// Return our retVal or false if not found
	return retVal || false;

};

/**
 *  Generates a date offset UUID for our photo
 *  http://stackoverflow.com/a/8809472/467373
 */
utils.generateUUID = function () {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
	});
	return uuid;
};

/**
 * Cache Filler adds any missing cache lookups
 *
 * @todo Still need to finish cleaning up the last part of this function
 *
 * @param row
 */
utils.cacheFiller = function (row) {

	if (row.CourseId) {
		row.Course = caches.MasterCourseList[row.CourseId];
	}

	if (row.UnitId) {
		row.FTD = caches.Units[row.UnitId];
	}

	if (row.HostId) {
		row.Host = caches.Hosts[row.HostId];
	}

	row.Instructor = caches.Instructors[row.InstructorId] || {};

	row.start = row.Start;
	row.end = row.End;

	row.startMoment = moment(row.Start);
	row.endMoment = moment(row.End).add(-1, 'minutes');

	row.startText = row.startMoment.format('D MMM YYYY');
	row.endText = row.endMoment.format('D MMM YYYY');

	var seats = _.reduce(row.Requests_JSON || [], function (memo, r) {
		memo[r[0]] += r[1].length;
		return memo;
	}, {'1': 0, '2': 0, '3': 0});

	row.approvedSeats = seats[2];
	row.pendingSeats = seats[1];
	row.deniedSeats = seats[3];
	row.requestCount = seats[1] + seats[2] + seats[3];
	row.allocatedSeats = seats[2] + row.Host + row.Other;

	row.openSeats = row.Course.Max - row.allocatedSeats - row.pendingSeats;

};

/**
 * A simple watch destroyer for when we know we don't need all those dirty checks
 */
utils.ignore = (function () {

	var timeout;

	FTSS.ng.run(
		['$timeout',
		 function ($timeout) {
			 timeout = $timeout;
		 }
		]
	);

	return function (scope) {

		timeout(function () {
			scope.$$watchers = [];
		});

	};

}());


// Grab some angular variables for use later on
FTSS.ng.run(
	[
		'SharePoint',
		function (SharePoint) {

			utils.masterReset = function () {

				try {

					window.sessionStorage.clear();
					window.localStorage.clear();
					SharePoint._flushCache();

				} catch (e) {

				}

			};

		}
	]);


utils.watchCount = function (log) {
	var root = angular.element(document.getElementsByTagName('body'));
	var watchers = [];

	var f = function (element) {
		if (element.data().hasOwnProperty('$scope')) {
			angular.forEach(element.data().$scope.$$watchers, function (watcher) {
				log && console.log(watcher.last);
				watchers.push(watcher);
			});
		}

		angular.forEach(element.children(), function (childElement) {
			f(angular.element(childElement));
		});
	};

	f(root);

	return watchers.length;
};

/**
 * Performs highlighting of matched search tags to allow users to see exactly what search terms had hits
 *
 * @param {Array} [data] - the data returned from SharePoint.read()
 */
utils.tagHighlight = function (data) {

	try {

		var test, map;

		test = [
		];
		map = FTSS.filters.map();

		// First, generate the array of tags to test against
		_(FTSS.tags).each(function (tag, key) {

			_(tag).each(function (t) {

				if (key !== 'custom') {

					if (map[key]) {

						test.push({
							          id       : key + ':' + t,
							          testField: map[key].split('/').join('.'),
							          testValue: t
						          });

					}

				}

			});


		});

		// Perform tests against all data using the test[] already created, _.all() stops once all tags are marked (if applicable)
		_(data).all(function (req) {

			// Must use _.each() in case a data item matches multiple tags
			_(test).each(function (t, k) {

				/**
				 *  If field and testValue match, add Matched class and delete test-- we shouldn't touch the DOM
				 *  from a controller but for performance reasons, this is much faster than relying on
				 *  AngularJS.
				 */
				if (!req.Archived && utils.deepRead(req, t.testField) === t.testValue) {

					FTSS.search.$control.find('.item[data-value="' + t.id + '"]').addClass('matched');

				}

			});

			// Always test to ensure there are still tags to test against, otherwise exit the loop
			return (test.length > 0);

		});

	} catch (e) {
		FTSS.utils.log(e);
	}

};

/**
 * Handles the page loading indicators (mouse & spinner)
 *
 * @param loading
 */
utils.loading = (function () {

	var body = $('body')[0], loadingState;

	return function (loading) {

		setTimeout(function () {

			if (loadingState !== loading) {

				loadingState = loading;

				body.className = body.className.replace('wait', '');

				if (loading) {

					body.className += ' wait';
				}

				document.body.style.cursor = loading ? 'wait' : '';
				FTSS.search && FTSS.search.close();

			}

		}, 5);

	};

}());

utils.distanceCalc = function (start, end) {

	if (start && end) {

		start = JSON.parse('[' + start + ']');
		end = JSON.parse('[' + end + ']');

		var deg2rad = function (deg) {
			return deg * (Math.PI / 180);
		};

		var R = 3963.1676; // Radius of the earth in miles
		var dLat = deg2rad(end[0] - start[0]);  // deg2rad below
		var dLon = deg2rad(end[1] - start[1]);
		var a = Math.sin(dLat / 2) *
		        Math.sin(dLat / 2) +
		        Math.cos(deg2rad(start[0])) *
		        Math.cos(deg2rad(end[0])) *
		        Math.sin(dLon / 2) *
		        Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return Math.ceil(R * c); // Distance in miles

	}
};

/**
 * IE's version of toLocaleString() is apparently stupid so we'll just do it manually using a regex courtesy of SO
 *
 * http://stackoverflow.com/a/2901298/467373
 *
 * @param x Number the number to chop up
 * @returns {*} String the pretty version of our number
 */
utils.prettyNumber = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


utils.imdsGradeLookup = function (grade) {

	return {

		       '001': 'AB',
		       '002': 'Amn',
		       '003': 'A1C',
		       '004': 'SrA',
		       '005': 'SSgt',
		       '006': 'TSgt',
		       '007': 'MSgt',
		       '008': 'SMSgt',
		       '009': 'CMSgt',

		       '014': '2LT',
		       '015': '1LT',
		       '016': 'Capt',
		       '017': 'Maj',
		       '018': 'Lt Col',
		       '019': 'Col',

		       'G01': 'GS1',
		       'G02': 'GS2',
		       'G03': 'GS3',
		       'G04': 'GS4',
		       'G05': 'GS5',
		       'G06': 'GS6',
		       'G07': 'GS7',
		       'G08': 'GS8',
		       'G09': 'GS9',
		       'G10': 'GS10',
		       'G11': 'GS11',
		       'G12': 'GS12',
		       'G13': 'GS13',
		       'G14': 'GS14',


		       'W01': 'WG1',
		       'W02': 'WG2',
		       'W03': 'WG3',
		       'W04': 'WG4',
		       'W05': 'WG5',
		       'W06': 'WG6',
		       'W07': 'WG7',
		       'W08': 'WG8',
		       'W09': 'WG9',
		       'W10': 'WG10',
		       'W11': 'WG11',
		       'W12': 'WG12',
		       'W13': 'WG13',
		       'W14': 'WG14',

		       'CON': 'Contractor'

	       }[grade] || 'Unknown';

};

utils.flickr = function () {

	var now = moment(),

	    refresh,

	    loadFlickr = function (resp) {

		    var secondsInterval = 12,

		        timer,

		        flip = false,

		        shuffle = function () {

			        var index = Math.floor(Math.random() * resp.items.length),

			            item = resp.items[index];

			        return item ? [index,
			                       item.media.m.replace('_m.', '_c_d.'),
			                       item
			        ] : shuffle();

		        },

		        parent = $('html'),

		        text = $('#bgText');

		    refresh = function () {

			    clearTimeout(timer);

			    if (FTSS._fn.getPage() === 'home') {

				    var item = shuffle();

				    flip = !flip;

				    $(flip ? '#bg2' : '#bg1')

					    .unbind()

					    .load(function () {

						          if (this.height < this.width) {

							          if (flip) {
								          parent.addClass('flip');
							          } else {
								          parent.removeClass('flip');
							          }

							          text.html(
									          '<b>' + item[2].title + '</b>: ' +
									          $(item[2].description.replace(/src=/g, 'fake='))
										          .toArray()
										          .pop()
										          .innerText
							          );

							          timer = setTimeout(refresh, secondsInterval * 1000);

						          } else {

							          resp.items[item[0]] = false;
							          flip = !flip;
							          refresh();

						          }

					          })

					    .attr('src', item[1]);

			    } else {

				    timer = setTimeout(refresh, secondsInterval * 1000);

			    }

		    };

		    refresh();

	    };

	if (localStorage.FTSS_Slides &&
	    now.diff(moment(localStorage.FTSS_Slides), 'days') < 6) {

		loadFlickr(JSON.parse(localStorage.FTSS_Slides_JSON));

	} else {

		$.ajax(
			{
				'cache'   : true,
				'dataType': 'jsonp',
				'url'     : 'https://api.flickr.com/services/feeds/photos_public.gne?id=39513508@N06&format=json&jsoncallback=?'
			})

			.success(function (resp) {

				         localStorage.FTSS_Slides = now.toISOString();
				         localStorage.FTSS_Slides_JSON = JSON.stringify(resp);

				         loadFlickr(resp);

			         });

	}

};

/**
 * Our app-wide alert notification system, this will eventually replace all the other message garbage polluting MainController
 */
utils.alert = (function () {

	var $alert, builder;

	FTSS.ng.run(
		['$alert',
		 function (alert) {
			 $alert = alert;
		 }
		]
	);

	builder = function (opts) {

		$alert(_.defaults(opts || {}, {
			'title'    : 'Record Updated!',
			'content'  : 'Your changes were saved successfully.',
			'placement': 'top-right',
			'type'     : 'success',
			'duration' : 3,
			'show'     : true
		}));

	};

	return {

		'create': function () {
			builder({'title': 'Record Created!'});
		},

		'update': builder,

		'security': function () {

			builder({
				        'title'    : 'Access Denied',
				        'content'  : 'Sorry, you don\'t seem to have permissions to view this page',
				        'placement': 'center',
				        'type'     : 'danger',
				        'duration' : 30

			        });

		},

		'error': function () {

			builder({
				        'type'    : 'danger',
				        'title'   : 'Sorry, something went wrong!',
				        'content' : "Please refresh the page and try again.",
				        'duration': 10
			        });
		}
	};

}());