/*global FTSS, _, caches */

/**
 * Selectize directive
 *
 * generates selectizeJS dropdown menus
 */
(function () {

	"use strict";

	var builder, custom, options = {}, timeout;

	builder = function (scope, opts, utilities) {

		var loaded, modal;

		// AngularUI tabs creates a new scope so this will let us handle either situation
		modal = scope.modal || scope.$parent.modal;

		return _.defaults(
			opts,

			{
				'labelField': opts.label || 'label',
				'maxItems': 1,
				'options': (!opts.watch &&
				            scope.$parent[opts.select] ||
				            options[opts.select] ||
				            caches[opts.select]) ||
				null,
				'plugins': opts.maxItems > 1 ? [
					'remove_button'
				] : null,
				'onChange': function (val) {

					// Do not run when initializing the value
					if (loaded) {

						var self = this;

						// So that Angular will update the model immediately rather than waiting until we click somewhere else
						timeout(function () {

							var oldVal = utilities.deepRead(scope, opts.field),

							    newVal = (val && val.map && !isNaN(val[0]) ?

							              val.map(Number) : Number(val)) || val || null;

							// Update the field with the value(s)
							if (oldVal !== newVal) {

								// Split our dotted notation into an array
								var test = opts.field.split('.'),

								    // Save the last property
								    prop = test.pop(),

								    // Get a reference to the parent object/scope
								    item = test.length ? utilities.deepRead(scope, test) : scope;

								// Write the changes to the child property on the parent object
								item[prop] = newVal;

								// This will allow us to retain the last used setting for faster pre-filling of data
								if (opts.remember) {

									localStorage['FTSS-selectize-' + opts.remember] = newVal;

								}

								// Optional inline updates (does not work with deep bindings)
								if (opts.inline && scope.inlineUpdate) {

									scope.inlineUpdate.call(scope, opts.field);

								} else {

									// Flip the $dirty flag on this modal
									modal && modal.$setDirty();

									// Add ng-dirty class manually as we aren't really a ngForm control
									self.$control.addClass('ng-dirty');

								}

								// Make sure we add the value to the list if it's new
								if (opts.create && val && options[opts.select]) {

									options[opts.select]

										.push({
											      'label': val,
											      'Id'   : val
										      });

								}

							}

						});

					}

				},
				'onInitialize': function () {

					var self, setup;

					self = this;

					setup = function () {

						var remember;

						// Check to see if remember is enabled for this field
						if (opts.remember) {
							remember = localStorage['FTSS-selectize-' + opts.remember];
						}

						// Try to add options again if they weren't loaded before
						if (!opts.watch && options[opts.select]) {
							self.addOption(options[opts.select]);
						}

						loaded = remember;

						// Set the value based on the current model
						self.setValue(utilities.deepRead(scope, opts.field) || remember);

						self.refreshOptions(false);

						// Mark the first load as done
						loaded = true;

					};

					scope.$watch(opts.field, setup);

				}
			});

	};

	custom = {

		'appInit': function (scope, SharePoint, utilities) {

			var sVal,

			    doSearch = function (val) {

				    // This causes our explain hover to go away and the field to lose focus (feels more natural)
				    FTSS.search.$control.blur();

				    // Perform our search if it is valid and unique
				    if (val && val.length > 0 && val !== sVal) {

					    var tags = scope.ftss.tagMap = {};

					    // Keep track of our last search value to prevent duplicate searches
					    sVal = val;

					    _.each(val, function (v) {

						    var split = v.split(':');

						    tags[split[0]] = tags[split[0]] || [];

						    tags[split[0]].push(Number(split[1]) || split[1]);

						    utilities.setPermaLink();
						    utilities.navigate();

					    });

				    }

				    FTSS.search.$control.find('.item').addClass('processed');

			    };

			return {
				'valueField'     : 'id',
				'persist'        : true,
				'optgroupOrder'  : [
					'Units',
					'Hosts',
					'MasterCourseList'
				],
				'plugins'        : [
					'optgroup_columns',
					'remove_button'
				],
				// If the users presses, enter we are assuming they wanted to do a search
				'onEnter'        : doSearch,

				// Try to do a search on dropdown close too (we have a fake button for this as a user hint)
				'onDropdownClose': function () {
					doSearch(this.getValue());
				},

				// The primary initializer for the search box, performs async operations with ng-SharePoint
				'onInitialize'   : function () {

					// Async counter
					var count = 0,

					    // Final count for our async operations to complete the process
					    CACHE_COUNT = 4,

					    // Because of some funky async + closures we need to store a copy of this for action
					    that = this,

					    loaded = function (data, group, text) {

						    // Destroy all archived data because it is completely useless to us...
						    _.each(data, function (row, key) {

							    row.Archived && delete data[key];

						    });

						    // Add the dataset to the caches object for global access
						    caches[group] = data;

						    // create the searchBox value of type:Id for eventual filter mapping
						    // .replace('m', 'c') is a really bad hack but needed to not break course lookups :-/
						    var id = group.toLowerCase().charAt(0).replace('m', 'c') + ':';

						    options[group] = _.chain(data)

							    .map(function (v) {

								         var Id, txt;

								         Id = (v.Id || v);
								         txt = text(v);

								         v.search = v.text || txt.text;

								         return {
									         'Id'      : Id,
									         'id'      : id + Id,
									         'optgroup': group,
									         'label'   : v.label || txt,
									         'data'    : v,
									         'search'  : v.search
								         };

							         })

							    // _.chain() requires value() to get the resultant dataset
							    .value();

						    var headers = {
							    'Units'           : 'FTD',
							    'MasterCourseList': 'Course',
							    'Hosts'           : 'Host Unit'
						    };

						    // Add the option group (header) to our searchBox
						    that.addOptionGroup(group, {
							    'label': headers[group] || group,
							    'value': group
						    });

						    // Keep track of our async loads and fire once they are all done (not using $q.all())
						    if (++count === CACHE_COUNT) {

							    var tagBoxOpts = []

								    .concat(options.MasterCourseList,
							                options.Units,
							                options.Hosts);

							    // Add the options to our searchBox
							    that.addOption(tagBoxOpts);

							    _.each(caches.Units, function (unit) {

								    _.each(unit.Courses_JSON, function (course) {

									    unit.Courses.push(caches.MasterCourseList[course]);

								    });

								    unit.Instructors = _.where(caches.Instructors, {'UnitId': unit.Id});

							    });

							    _.each(caches.Hosts, function (host) {

								    var ftd = caches.Units[host.FTD] || {};

								    host.label = '<b>' +
								                 host.Unit +
								                 '</b><right>' +
								                 (ftd.Det || 'No FTD') +
								                 '</right>';

								    return host.Unit;

							    });

							    // Copy that(this) back to FTSS.search
							    FTSS.search = that;

							    // Call completion now
							    utilities.initPage('selectize');

							    // This shows the page contents for anything still hiding...
							    $('#pageActions .hide').removeClass('hide');

						    }

					    };

					SharePoint.read(FTSS.models('catalog')).then(loadCourses);

					SharePoint.read(FTSS.models('units')).then(loadUnits);

					SharePoint.read(FTSS.models('hosts')).then(loadHosts);

					SharePoint.read(FTSS.models('instructors')).then(loadInstructors);

					function loadCourses(response) {

						// Add MCL to Selectize with row callback
						loaded(response, 'MasterCourseList', function (v) {

							// Save for later  our unit listings
							v.Units = [];

							/**
							 * Generates string format for dropdown display
							 *
							 * "<div><h5>U2I<em> - J4AMP2A6X6 A41B</em></h5><small>U-2S ELECTRICAL AND ENVIRONMENTAL SYSTEMS</small></div>"
							 *
							 * @type {*|string}
							 */
							v.label = [
								'<div><h5>',
								v.PDS,
								'<em> - ',
								v.Number,
								'</em></h5>',
								'<small>',
								v.Title,
								'</small></div>'
							].join('');

							/**
							 * Generates string format for full-text search
							 *
							 * "U2I J4AMP2A6X6 A41B U-2S ELECTRICAL AND ENVIRONMENTAL SYSTEMS"
							 *
							 * @type {*|string}
							 */
							v.text = [
								v.PDS,
								v.Number,
								v.Title
							].join(' ');

							return v.text;
						});

					}

					function loadUnits(response) {

						// Add Units to Selectize with row callback
						loaded(response, 'Units', function (v) {

							v.Courses = [];

							// Use Det # to determine squadron 2XX for 372 TRS / 3XX for 373 TRS
							v.Squadron = v.Det < 300 ? '372 TRS' : '373 TRS';

							/**
							 * Generates string for label full-text search
							 *
							 * "Nellis 213 372 TRS"
							 *
							 * @type {*|string}
							 */
							v.text = [
								v.Base,
								v.Det,
								v.Squadron,
								v.LCode
							].join(' ');

							/**
							 * Generates string for Selectize display
							 *
							 * "Nellis<em> (Det. 213)</em>"
							 *
							 * @type {*|string}
							 */
							v.label = [
								'<b>',
								v.Base,
								'</b><right>&nbsp;(Det ',
								v.Det,
								')</right>'
							].join('');

							/**
							 * Generates LongName property for use throughout app
							 *
							 * "Nellis (Det. 213)"
							 *
							 * @type {*|string}
							 */
							v.LongName = [
								v.Base,
								' (Det. ',
								v.Det,
								')'
							].join('');

							return v.text;

						});

					}

					function loadHosts(hosts) {

						loaded(hosts, 'Hosts', function (host) {

							host.Text = host.Unit;

							return host.Unit;

						});

					}

					function loadInstructors(response) {

						loaded(response, 'Instructors', function (val) {

							// Fix for stupid SP bug--I hate SP
							val.InstructorEmail = val.InstructorEmail ?
							                      val.InstructorEmail.replace('mailto:', '') :
							                      '';

							val.label = val.InstructorName;

							return val.InstructorName;

						});

					}

				}
			};

		},

		'people': function (scope, SharePoint) {

			return {
				'delimiter'   : '+',
				'loadThrottle': 850,
				'labelField'  : 'DISPLAYNAME',
				'valueField'  : 'EMAIL',
				'sortField'   : 'DISPLAYNAME',
				'searchField' : 'DISPLAYNAME',
				'persist'     : false,
				'create'      : true,
				'plugins'     : [
					'remove_button'
				],
				'onChange'    : function (val) {

					var data = this.options[val];

					data && timeout(function () {

						scope.row.name = data.DISPLAYNAME;
						scope.row.email = data.EMAIL;

					});

				},
				'load'        : function (query, callback) {

					// Wait until we have at least five characters
					if (query.length > 5) {

						SharePoint.searchPeople(query).then(callback);

					}

				}
			};
		}

	};

	FTSS.ng.directive('selectize', [
		'$timeout',
		'SharePoint',
		'utilities',
		function ($timeout, SharePoint, utilities) {

			return {

				// Restrict it to be an attribute
				'restrict': 'A',

				// Responsible for registering DOM listeners as well as updating the DOM
				'link'    : function (scope, element, attrs) {

					timeout = $timeout;

					timeout(function () {

						var opts, selectize;

						if (scope.ABORT) {
							// Do not continue loading anything is ABORT is set
							return false;
						}

						if (attrs.bind) {

							opts = builder(scope, {
								'label'   : attrs.label,
								'inline'  : attrs.hasOwnProperty('inline'),
								'remember': attrs.remember,
								'watch'   : attrs.watch,
								'select'  : attrs.selectize,
								'field'   : attrs.bind,
								'create'  : attrs.hasOwnProperty('create'),
								'maxItems': parseInt(attrs.max) || (attrs.hasOwnProperty('multiple') ? 999 : 1)
							}, utilities);

						} else {

							opts = custom[attrs.selectize](scope, SharePoint, utilities);

						}

						// Lets us bind subordinate dropdowns
						if (attrs.watch) {

							var watchList = attrs.watchlist.split('.'),

							    /**
							     * Our watch function that updates and enables/disables this dropdown
							     *
							     * @param find
							     */
							    refresh = function (find) {

								    var select = element[0].selectize;

								    // First, disable and clear the dropdown
								    select.disable();
								    select.clearOptions();

								    // Attempt to load the list of options
								    find = find && caches[watchList[0]][find][watchList[1]];

								    // If options exist, add them, refresh and enable the list
								    if (find) {

									    select.addOption(find);
									    select.refreshOptions(false);
									    select.setValue(scope.data[opts.field]);
									    select.enable();

								    }

							    };

							// Our watch binding
							scope.$watch(attrs.watch, refresh);

						}

						// Strange bug we need to look into later on, just try/catch for now...
						try {
							selectize
							= FTSS.selectizeInstances[opts.field || attrs.selectize]
							= $(element).selectize(opts)[0].selectize;
						} catch (e) {}

						selectize && scope.modal && scope.modal

							.$addControl({
								             '$setPristine': function () {
									             selectize.$control.removeClass('ng-dirty');
								             }
							             });
					});
				}
			};
		}
	]);

}());