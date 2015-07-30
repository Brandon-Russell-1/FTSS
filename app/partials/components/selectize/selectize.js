/*global FTSS, caches */

/**
 * Selectize directive
 *
 * generates selectizeJS dropdown menus
 */
(function () {

	"use strict";

	var builder, custom, timeout, SharePoint, sharepointFilters, utilities, courseNumberParser;

	FTSS.selectizeInstances = {};

	builder = function (scope, opts) {

		var loaded, modal, collection;

		// AngularUI tabs creates a new scope so this will let us handle either situation
		modal = scope.modal || scope.$parent.modal;

		collection = _.map(!opts.watch &&
		                   scope.$parent[opts.select] ||
		                   caches[opts.select], function (row) {

			return {
				'sort'  : row[opts.sort],
				'label' : opts.label ? row[opts.label] : row.label,
				'search': row.search,
				'Id'    : row.Id
			};

		});

		return _.defaults(
			opts,

			{
				'labelField'  : opts.label || 'label',
				'maxItems'    : 1,
				'options'     : collection,
				'plugins'     : opts.maxItems > 1 ? [
					'remove_button'
				] : null,
				'onChange'    : function (val) {

					// Do not run when initializing the value
					if (loaded) {

						var self = this;

						// So that Angular will update the model immediately rather than waiting until we click somewhere else
						timeout(function () {

							var oldVal = utilities.deepRead(scope, opts.field),

								newVal = (val && val.map && !isNaN(val[0]) ?

								          val.map(Number) : Number(val)) || val || null;

							// Update the field with the value(s)
							if (!_.isEqual(oldVal, newVal)) {

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

									localStorage['FTSS-selectize-' + opts.remember] = JSON.stringify(newVal);

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
								if (opts.create && val && caches[opts.select]) {

									caches[opts.select].push({'label': val, 'Id': val});

								}

							}

						});

					}

				},
				'onInitialize': function () {

					var self = this,

						remember = opts.remember && JSON.parse(localStorage['FTSS-selectize-' + opts.remember] || false);

					scope.$watch(opts.field, setup);

					function setup(val) {

						if (val && (val.length || val > 0)) {

							// Set the value based on the current model
							val && self.setValue(val);

							remember = false;

						}

						self.refreshOptions(false);

						// Mark the first load as done
						loaded = true;

						if (remember) {

							self.setValue(remember);
							remember = false;

						}
					}

				}
			});

	};

	custom = {

		'appInit': function (scope) {

			var doSearch = function (val) {

				// This causes our explain hover to go away and the field to lose focus (feels more natural)
				FTSS.search.$control.blur();

				// Perform our search if it is valid and unique
				if (val.length) {

					var tags = scope.ftss.tagMap = {};

					_.each(val, function (v) {

						var split = v.split(':');

						tags[split[0]] = tags[split[0]] || [];

						tags[split[0]].push(Number(split[1]) || split[1]);

					});

					timeout(function () {

						utilities.setPermaLink();
						scope.ftss.filter = sharepointFilters.compile(tags);

					});

				}

				FTSS.search.$control.find('.item').addClass('processed');

			};

			return {
				'valueField'   : 'id',
				'persist'      : true,
				'optgroupOrder': [
					'Units',
					'Hosts',
					'MasterCourseList'
				],
				'plugins'      : [
					'optgroup_columns',
					'remove_button'
				],
				// If the users presses, enter we are assuming they wanted to do a search
				'onEnter'      : doSearch,

				// Try to do a search on dropdown close too (we have a fake button for this as a user hint)
				'onDropdownClose': function () {
					doSearch(this.getValue());
				},

				// The primary initializer for the search box, performs async operations with ng-SharePoint
				'onInitialize': function () {

					// Async counter
					var count = 0,

					// Final count for our async operations to complete the process
						CACHE_COUNT = 4,

					// Because of some funky async + closures we need to store a copy of this for action
						_self = this,

						loaded = function (data, groupName, processRow) {

							// Destroy all archived data because it is completely useless to us...
							_.each(data, function (row, key) {

								row.Archived && delete data[key];

							});

							// create the searchBox value of type:Id for eventual filter mapping
							var _idPrefix = groupName.toLowerCase().charAt(0).replace('m', 'c') + ':';

							caches[groupName] = data;

							_.each(data, function (v) {

								processRow(v);

								v.search = v.text;
								v.id = _idPrefix + v.Id;
								v.optgroup = groupName;

							});

							// Add the option group (header) to our searchBox
							_self.addOptionGroup(groupName, {
								'label': {
									         'Units'           : 'FTD',
									         'MasterCourseList': 'Course<right>MDS</right>'
								         }[groupName] || groupName,
								'value': groupName
							});

							// Keep track of our async loads and fire once they are all done (not using $q.all())
							if (++count === CACHE_COUNT) {

								_.each(caches.Units, function (unit) {

									unit.Courses = _.map(unit.Courses_JSON, function (courseId) {

										return caches.MasterCourseList[courseId];

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

								});

								FTSS.tagBoxOpts = [];

								_.each(caches.MasterCourseList, addTagBoxOpts);
								_.each(caches.Units, addTagBoxOpts);

								// Add the options to our searchBox
								_self.addOption(FTSS.tagBoxOpts);

								// Copy that(this) back to FTSS.search
								FTSS.search = _self;

								// Call completion now
								utilities.initPage('selectize');

							}

						};

					SharePoint.read(FTSS.models('catalog')).then(loadCourses);

					SharePoint.read(FTSS.models('units')).then(loadUnits);

					SharePoint.read(FTSS.models('hosts')).then(loadHosts);

					SharePoint.read(FTSS.models('instructors')).then(loadInstructors);

					function addTagBoxOpts(row) {
						FTSS.tagBoxOpts.push(row);
					}

					function loadCourses(response) {

						// Add MCL to Selectize with row callback
						loaded(response, 'MasterCourseList', function (course) {

							// Ensure our course # is always uppercase
							course.Number = course.Number.toUpperCase().trim();

							// Save for later  our unit listings
							course.Units = [];

							course.MDS = courseNumberParser(course.Number);

							/**
							 * Generates string format for dropdown display
							 *
							 * "<div><h5>U2I<em> - J4AMP2A6X6 A41B</em></h5><small>U-2S ELECTRICAL AND ENVIRONMENTAL SYSTEMS</small></div>"
							 *
							 * @type {*|string}
							 */
							course.label = [
								'<div><h5>', course.PDS, '<em> - ', course.Number, '<right>', course.MDS,
								'</right></em></h5>',
								'<small>', course.Title, '</small></div>'
							].join('');

							/**
							 * A text mapping of IMDS/G081 values
							 * @type {string}
							 */
							course.imds_g081 = [];

							course.IMDS && course.imds_g081.push('IMDS: ' + course.IMDS);
							course.G081 && course.imds_g081.push('G081: ' + course.G081);

							course.imds_g081 = course.imds_g081.join(' / ');

							/**
							 * Generates string format for full-text search
							 *
							 * "U2I J4AMP2A6X6 A41B U-2S ELECTRICAL AND ENVIRONMENTAL SYSTEMS"
							 *
							 * @type {*|string}
							 */
							course.text = [
								'pds:' + course.PDS,
								'mds:' + course.MDS,
								course.imds_g081.replace(/\s/g, ''),
								course.Number,
								course.Title
							].join(' ');

						});

					}

					function loadUnits(response) {

						// Add Units to Selectize with row callback
						loaded(response, 'Units', function (v) {

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

						});

					}

					function loadHosts(hosts) {

						loaded(hosts, 'Hosts', function (host) {

							host.text = host.Unit;

						});

					}

					function loadInstructors(response) {

						loaded(response, 'Instructors', function (val) {

							// Fix for stupid SP bug--I hate SP
							val.Email = (val.Email || '').replace('mailto:', '');

							val.text = val.label = val.Name;

						});

					}

				}
			};

		},

		'people': function ($scope, attrs) {

			var once = false;

			return {
				'delimiter'   : '+',
				'loadThrottle': 500,
				'labelField'  : 'DISPLAYNAME',
				'valueField'  : 'DISPLAYNAME',
				'sortField'   : 'DISPLAYNAME',
				'searchField' : 'DISPLAYNAME',
				'persist'     : false,
				'create'      : true,
				'maxItems'    : $scope.$eval(attrs.max) || 2,
				'plugins'     : [
					'remove_button'
				],
				'onInitialize': function () {

					var _self = this,

						list = utilities.deepRead($scope, attrs.students || 'request.Students_JSON');

					if (list) {

						_self.addOption(_.map(list, function (email, student) {

							return {
								'DISPLAYNAME': student,
								'EMAIL'      : email || student
							};

						}));

						_self.setValue(_.keys(list));

					}

				},
				'onChange'    : function (selection) {

					var options = this.options,

						multi = (this.settings.maxItems > 1),

						parent = $scope.reservation || $scope.data || $scope;

					timeout(function () {

						if (multi) {

							parent.Students = {};

							_.each(selection, function (person) {

								var opt = options[person];

								opt.EMAIL = opt.EMAIL === opt.DISPLAYNAME ? '' : opt.EMAIL;

								parent.Students[opt.DISPLAYNAME || person] = opt.EMAIL || '';

							});

							parent.Count = _.size(parent.Students);

						} else {

							parent.Students = options[selection];

						}

						(!$scope.request || once) && ($scope.modal.$setDirty || Function)();

						($scope.updateTotals || Function)();

						once = true;

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
		'sharepointFilters',
		'utilities',
		'courseNumberParser',
		'geodata',
		function ($timeout, _SharePoint_, _sharepointFiltes_, _utilities_, _courseNumberParser_, geodata) {

			return {

				// Restrict it to be an attribute
				'restrict': 'A',

				// Responsible for registering DOM listeners as well as updating the DOM
				'link': function (scope, element, attrs) {

					timeout = $timeout;
					SharePoint = _SharePoint_;
					sharepointFilters = _sharepointFiltes_;
					utilities = _utilities_;
					courseNumberParser = _courseNumberParser_;
					caches.geodata = geodata.map;

					var opts, selectize;

					attrs.max && scope.$watch(attrs.max, watchMax);

					if (scope.ABORT) {
						// Do not continue loading anything is ABORT is set
						return false;
					}

					if (attrs.bind) {

						opts = builder(scope, {
							'sort'     : attrs.sort,
							'sortField': attrs.sort && 'sort',
							'label'    : attrs.label,
							'inline'   : attrs.hasOwnProperty('inline'),
							'remember' : attrs.remember,
							'watch'    : attrs.watch,
							'select'   : attrs.selectize,
							'field'    : attrs.bind,
							'create'   : attrs.hasOwnProperty('create'),
							'maxItems' : scope.$eval(attrs.max) || (attrs.hasOwnProperty('multiple') ? 999 : 1)
						});

					} else {

						opts = custom[attrs.selectize](scope, attrs);

					}

					// Lets us bind subordinate dropdowns
					if (attrs.watch) {

						// Our watch binding
						scope.$watch(attrs.watch, function (find) {

							var select = element[0].selectize;

							if (select) {

								// First, disable and clear the dropdown
								select.disable();
								select.clearOptions();

								// If options exist, add them, refresh and enable the list
								if (find) {

									select.addOption(find);
									select.refreshOptions(false);
									select.setValue(scope.$eval(opts.field));
									select.enable();

								}

							}

						});

					}

					// Strange bug we need to look into later on, just try/catch for now...
					try {
						selectize
							= FTSS.selectizeInstances[opts.field || attrs.selectize]
							= $(element).selectize(opts)[0].selectize;
					} catch (e) {
						utilities.errorHandler(e);
					}

					selectize && scope.modal && scope.modal.$addControl({
						'$setPristine': function () {
							selectize.$control.removeClass('ng-dirty');
						}
					});


					/**
					 * Keep the maxItems value updated
					 * @param max
					 */
					function watchMax(max) {
						if (max && selectize) {
							selectize.settings.maxItems = max;
						}
					}


				}
			};
		}
	]);

}());