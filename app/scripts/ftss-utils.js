/*global utils, FTSS, _, angular, moment, caches */

(function () {


	FTSS.ng.run(
		[
			'$timeout',
			'SharePoint',
			'$alert',
			'$location',
			'$modal',
			function ($timeout, SharePoint, $alert, $location, $modal) {

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
					var exp = expression.join ? expression : (expression || '').split('.'), retVal;

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
				 * @param row
				 */
				utils.cacheFiller = function (row) {

					// Try to add the course data
					row.Course = caches.MasterCourseList[row.CourseId] || {};

					// Try to add the FTD
					row.FTD = caches.Units[row.UnitId] || {};

					// Try to add the host unit data
					row.HostUnit = caches.Hosts[row.HostId] || {};

					// Try to add the instructor data
					row.Instructor = caches.Instructors[row.InstructorId] || {};

					// Add course data for TS
					if (row.TS) {
						row.Course = {
							'PDS'   : 'TS',
							'Number': row.TS
						}
					}

					// The TTMS friendly link for this class
					row.ttmsLink = row.Course && row.TTMS ? row.Course.Number + row.TTMS : '';

					utils.dateRange(row);

					// In case of invalid data, we'll do something about it
					if (!row.Course.Id && !row.TS && !row.NA) {
						row.Archived = true;
						return;
					}

					row.approvedSeats = 0;
					row.pendingSeats = 0;
					row.deniedSeats = 0;
					row.requestCount = 0;

					_.each(row.Requests_JSON, function (r) {

						row[['', 'pending', 'approved', 'denied'][r[0]] + 'Seats'] += r[1].length;
						row.requestCount += r[1].length;

					});

					row.allocatedSeats = row.approvedSeats + row.Host + row.Other;
					row.openSeats = row.Course.Max ? row.Course.Max - row.allocatedSeats : '';

				};


				/**
				 * Destroys all local caches and resets the app
				 */
				utils.masterReset = function () {

					try {

						// Clear the session storage used for DoD Consent tracking
						window.sessionStorage.clear();

						// Clear the local storage use for preferences/
						window.localStorage.clear();

						// Attempt to flush the IndexedDB cache as well
						SharePoint._flushCache(function () {

							window.location = '#home';
							window.location.reload(true);

						});

					} catch (e) {

						utils.errorHandler(e);

					}
				};

				/**
				 * Automatically uploads diagnostic info in the background when errors occur
				 *
				 * @param err
				 */
				utils.errorHandler = function (err) {

					console && console.log(err);

					if (PRODUCTION) {

						try {

							SharePoint.create(
								{

									'__metadata': 'ErrorLog',
									'Page'      : window.location.hash,
									'Stack'     : err.stack || (new Error()).stack || null,
									'Contents'  : JSON.stringify(err, null, 2)

								});

						} catch (e) {}

					}

				};

				/**
				 * Convert arrayBuffer to base64.
				 *
				 * http://stackoverflow.com/a/9458996
				 *
				 *
				 * @param buffer
				 * @returns {*|string}
				 * @private
				 */
				utils._arrayBufferToBase64 = function (buffer) {
					var binary = '';
					var bytes = new Uint8Array(buffer);
					var len = bytes.byteLength;
					for (var i = 0; i < len; i++) {
						binary += String.fromCharCode(bytes[i]);
					}
					return window.btoa(binary);
				};

				/**
				 * Performs highlighting of matched search tags to allow users to see exactly what search terms had hits
				 *
				 * @param {Array} [data] - the data returned from SharePoint.read()
				 */
				utils.tagHighlight = function (data) {

					try {

						var test = [],

						    map = FTSS.filters.map();

						// First, generate the array of tags to test against
						_.each(FTSS.tags, function (tag, key) {

							_.each(tag, function (t) {

								if (map[key]) {

									test.push({
										          id       : key + ':' + t,
										          testField: map[key].split('/').join('.'),
										          testValue: t
									          });

								}

							});

						});

						// Perform tests against all data using the test[] already created,
						// _.all() stops once all tags are marked (if applicable)
						_.all(data, function (req) {

							// Must use _.each() in case a data item matches multiple tags
							_.each(test, function (t, k) {

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
					}

				};

				/**
				 * Handles the page loading indicators (mouse & spinner)
				 * Always determines whether content is visible or not
				 *
				 * @param loading
				 */
				utils.loading = (function () {

					var body = $('body')[0];

					// Return our module pattern
					return function (updateState) {

						// Capture the current loading state
						var loadingState = (body.className.indexOf('wait') > -1);

						// Always tyr to close the search box
						FTSS.search && FTSS.search.close();

						// Only do something if the state has changed
						if (loadingState !== updateState) {

							if (updateState) {

								body.className += ' wait';
								document.body.style.cursor = 'wait';


							} else {

								body.className = body.className.replace('wait', '');
								document.body.style.cursor = '';

							}


						}

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

					var str = (x > 1000 ? Math.round(x / 100) : Math.round(x / 10) * 10).toString();

					return (x > 1000) ? (str[0] + '.' + str[1]).replace('.0', '') + 'K ' : str;
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

							        return item ? [
								        index,
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

				utils.modal = function (template, $scope) {

					var scope = $scope.$new();

					scope.modal = $modal({
						                     contentTemplate: '/partials/' + template + '.html', scope: scope,
						                     show           : true
					                     });

					scope.close = scope.modal.destroy;

				},

				/**
				 * Our app-wide alert notification system, this will eventually replace all the other message garbage polluting MainController
				 */
					utils.alert = (function () {

						var builder;

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

							'error': function (err) {

								utils.errorHandler(err);

								builder({
									        'type'    : 'danger',
									        'title'   : 'Sorry, something went wrong!',
									        'content' : "Please refresh the page and try again.",
									        'duration': 20
								        });
							}
						};

					}());


			}
		]
	)
	;

}());