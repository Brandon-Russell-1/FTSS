/*global FTSS, _, caches */

/**
 * The FTSS.security() function controls the role-based views and automatic redirectors for pages not authorized.
 * Obviously, in a client-side SPA this can be easily bypassed so the views serve only as a convenience to the user
 * as the security is in the list-based SharePoint security groups on the server.  We are reflecting the limitations
 * already placed on the server so as not to confuse or overwhelm the user.
 */
FTSS.ng.service('security', [

	'SharePoint',
	'$modal',
	'$rootScope',
	'$timeout',

	function (SharePoint, $modal, $rootScope, $timeout) {

		"use strict";

		var _authorizationMatrix = {

				'admin': ['admin'],

				'admin-instructors': ['admin'],

				'requirements': ['mtf', 'ftd'],

				'requests': ['mtf', 'ftd'],

				'manage-ftd': ['ftd'],

				'scheduled-ftd': ['ftd', 'instructor'],

				'production-ftd': ['ftd', 'instructor'],

				'backlog': ['mtf', 'ftd'],

				'my-unit': ['mtf'],

				'my-ftd': ['mtd'],

				'ttms': ['scheduling']

			},

			_isAdmin = false,

			_groups = [],

			_user = false,

			_self = this;

		/**
		 * Allow switching FTDs for certain users
		 */
		this.switchContext = function (contextType) {

			// Workaround for our variable naming vs role naming conflict
			var role = (contextType === 'host') ? 'mtf' : 'ftd';

			// Verify authorization first
			if (_self.hasRole(role)) {

				// Create an object that will pass up from the child scope
				$rootScope[contextType] = {};

				$modal(
					{
						'contentTemplate': '/partials/' + (_isAdmin ? 'switch-' : 'no-assigned-') +
						                   contextType + '.html',
						'backdrop'       : 'static',
						'keyboard'       : false
					});

				// Watch our newFTD variable
				$rootScope.$watch(contextType + '.id', function (id) {

					if (id) {

						localStorage['ftssCached_' + contextType] = JSON.stringify(
							{
								'Id'      : id,
								'LongName': (contextType === 'ftd') ?
								            caches.Units[id].LongName : caches.Hosts[id].Unit
							}
						);

						// Reload the page
						location.reload();

					}

				});


			}

		};

		/**
		 * Test for a particular user role
		 *
		 * @param roles
		 * @returns {boolean}
		 */
		this.hasRole = function (roles) {

			return _isAdmin || _(roles.map ? roles : [roles]).any(function (role) {

					return _groups.indexOf(role) > -1;

				});

		};

		/**
		 * Performs page validation check
		 *
		 */
		this.isAuthorized = function () {

			var page = _authorizationMatrix[$rootScope.ftss.viewTitle];

			return _isAdmin || !page || _.intersection(page, _groups).length > 0

		};

		this.checkHost = function () {

			$rootScope.host = JSON.parse(localStorage.ftssCached_host || false);

			if ($rootScope.host) return true;

			if (_self.hasRole(['mtf'])) {

				caches.Hosts && _self.switchContext('host');

			}

		};


		/**
		 *
		 */
		this.checkFTD = function () {

			$rootScope.ftd = JSON.parse(localStorage.ftssCached_ftd || false);

			if ($rootScope.ftd) return true;

			// Check for email and login name
			var identifier = _user ?

			                 [
				                 (_user.email || '').toLowerCase().trim() || false,
				                 (_user.loginname || '').toLowerCase().trim() || false
			                 ].filter(function (e) {return e}) : [],

			// First try to load from localStorage, otherwise attempt to load from cache
				ftd = caches.Instructors && identifier.length && _(caches.Instructors)

						// Remove empty accounts
						.filter('Email')

						// Try to perform our match against the array elements
						.find(function (test) {

							      var check = test.Email.toLowerCase().trim();
							      return (identifier.indexOf(check) > -1);

						      });

			if (ftd) {

				// Load the $rootScope.ftd variable
				$rootScope.ftd = caches.Units ? caches.Units[ftd.UnitId || ftd.Id] : ftd;

				// Push this back to localStorage for future use
				localStorage.ftssCached_ftd = JSON.stringify(
					{
						'Id'      : $rootScope.ftd.Id,
						'LongName': $rootScope.ftd.LongName
					});

				window.location.reload();

			} else {

				if (identifier && caches.Instructors) {

					// If the user was not found, send to switch FTD to check for the FTD role
					_self.switchContext('ftd');

				}

			}

		};

		/**
		 *
		 */
		this.initialize = function () {

			// Initialize our $rootScope variables
			$rootScope.initInstructorRole = angular.noop;
			$rootScope.rolsceClasses = '';
			$rootScope.roleText = '';

			// First try to check for the cached FTD settings (before the user data is loaded)
			_self.checkFTD(false);

			_self.checkHost();

			// Load our user data into FTSS
			SharePoint.user().then(initSecurity);

		};


		function initSecurity(user) {

			_user = user[0] || user;

			// Shortened display name
			user.short = _user.name ? _user.name.split('USAF')[0] : '';

			// Add a copy of our user data to the rootscope
			$rootScope.user = angular.copy(_user);

			// Check again if this is an FTD user (should only happen the first time for them)
			_self.checkFTD();

			if (!PRODUCTION && location.pathname === '/dev.html') {

				completeSecurity({'name': 'admin'});

			} else {

				// Load the SP groups every time
				SharePoint.groups().then(completeSecurity);

			}

		}

		function completeSecurity(spGroups) {

			// Extract the name of any groups the user is a member of
			_groups = _groups.concat(spGroups.name ? [spGroups.name] : _.pluck(spGroups, 'name'));

			// If no groups were found, just add our "guest" group
			_groups = _groups.length ? _groups : ['guest'];

			// Check for the admin group
			_isAdmin = _groups.indexOf('admin') > -1;

			// Add switchContext() for admins
			if (_isAdmin) {
				$rootScope.switchContext = _self.switchContext;
			}

			if ($rootScope.ftd && _groups.indexOf('guest') > -1) {

				// Add the "instructor" group to this user
				_groups = ['instructor'];

			}

			// Used to modify views based on roles
			$rootScope.roleClasses = _groups.join(' ');

			// This is the text that is displayed in the top-left corner of the app
			$rootScope.roleText = _groups.join(' • ')
				.replace('mtf', 'MTS/UTM')
				.replace('ftd', 'FTD Scheduler/Production Supervisor')
				.replace('curriculum', 'Training/Curriculum Manager')
				.replace('scheduling', 'J4 Scheduler')
				.replace('admin', 'Administrator')
				.replace('instructor', 'FTD Member')
				.replace('guest', 'Visitor');

			// Finish the security code
			$rootScope.ftss.initPage('security');

		}

	}
]);