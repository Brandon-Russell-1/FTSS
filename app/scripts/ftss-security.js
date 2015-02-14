/*global FTSS, _ */

/**
 * The FTSS.security() function controls the role-based views and automatic redirectors for pages not authorized.
 * Obviously, in a client-side SPA this can be easily bypassed so the views serve only as a convenience to the user
 * as the security is in the list-based SharePoint security groups on the server.  We are reflecting the limitations
 * already placed on the server so as not to confuse or overwhelm the user.
 */
(function () {

	"use strict";

	var authorizationMatrix = {

		    'admin': ['admin'],

		    'admin-instructors': ['admin'],

		    'requirements': [
			    'mtf',
			    'ftd'
		    ],

		    'requests': [
			    'approvers',
			    'mtf',
			    'ftd'
		    ],

		    'manage-ftd'    : ['ftd', 'scheduling'],
		    'scheduled-ftd' : ['ftd', 'scheduling', 'instructor'],
		    'production-ftd': ['ftd', 'instructor'],

		    'backlog': [
			    'approvers',
			    'mtf',
			    'ftd'
		    ],
		    'hosts'  : [
			    'mtf',
			    'ftd'
		    ],
		    'ttms'   : [
			    'scheduling'
		    ]

	    },

	    isAdmin = false,

	    groups = [];

	FTSS.security = function (SharePoint, $scope, _fn) {

		// Initialize our $scope variables
		$scope.initInstructorRole = angular.noop;
		$scope.roleClasses = '';
		$scope.roleText = '';

		/**
		 * This eliminates the needless server calls for user/group info when developing FTSS.
		 *
		 * Yes, someone could easily spoof the global variable (if they paused the code during page load
		 * and changed it.  However, this is all just client-view stuff anyway.  Additionally, doing so
		 * would cause them more problems as it would force everything to read from a different SharePoint
		 * site altogether.  Finally, we make a double check by validating the file name matches.
		 *
		 */
		if (!PRODUCTION && location.pathname === '/dev.html') {

			isAdmin = true;

			$scope.roleClasses = 'admin';

			$scope.roleText = 'DEVELOPER MODE';

			$scope.ftd = {
				'Id'      : 9,
				'LongName': 'Robins AFB (Det. 306)'
			};

			completeSecurity();

		} else {

			// First try to check for the cached FTD settings (before the user data is loaded)
			checkFTD();

			// Load our user data into FTSS
			SharePoint.user().then(initSecurity);

		}

		function initSecurity(user) {

			$scope.myEmail = user.email || user.loginname;

			// Check again if this is an FTD user (should only happen the first time for them)
			checkFTD(user);

			// Load the SP groups every time
			SharePoint.groups().then(function (spGroups) {

				// Extract the name of any groups the user is a member of
				groups = groups.concat(spGroups.name ? [spGroups.name] : _.pluck(spGroups, 'name'));

				// If no groups were found, just add our "guest" group
				groups = groups.length ? groups : ['guest'];

				// Check for the admin group
				isAdmin = groups.indexOf('admin') > -1;

				// Used to modify views based on roles
				$scope.roleClasses = groups.join(' ');

				// This is the text that is displayed in the top-left corner of the app
				$scope.roleText = groups.join(' • ')
					.replace('mtf', 'MTS/UTM')
					.replace('ftd', 'FTD Scheduler/Production Supervisor')
					.replace('curriculum', 'Training/Curriculum Manager')
					.replace('scheduling', 'J4 Scheduler')
					.replace('admin', 'Administrator')
					.replace('instructor', 'FTD Member')
					.replace('guest', 'Visitor');

				// Finish the security code
				completeSecurity();

			});

		}

		/**
		 *
		 * @param user
		 */
		function checkFTD(user) {

			if ($scope.ftd) {
				return;
			}

			// Check for email and loginname
			var identifier = user ?

			                 [
				                 (user.email || '').toLowerCase().trim() || false,
				                 (user.loginname || '').toLowerCase().trim() || false
			                 ].filter(function (e) {return e}) : [],

			    // First try to load from localStorage, otherwise attempt to load from cache
			    ftd = JSON.parse(localStorage.ftssCachedFTD || false) ||

			          (caches.Instructors && identifier.length && _(caches.Instructors)

				          // Remove empty accounts
				          .filter('InstructorEmail')

				          // Try to perform our match against the array elements
				          .find(function (test) {

					                var check = test.InstructorEmail.toLowerCase().trim();
					                return (identifier.indexOf(check) > -1);

				                }));

			if (ftd) {

				// Load the $scope.ftd variable
				$scope.ftd = caches.Units ? caches.Units[ftd.UnitId || ftd.Id] : ftd;

				// Add the "instructor" group to this user
				groups.push('instructor');

				// Push this back to localStorage for future use
				localStorage.ftssCachedFTD = JSON.stringify(
					{
						'Id'      : $scope.ftd.Id,
						'LongName': $scope.ftd.LongName
					});

			} else {

				$scope.initInstructorRole = function () {

					checkFTD(user);

					// Only notify the user if this is the first time this page load
					if ($scope.hasRole('ftd') && !$scope.ftd) {

						utils.modal('no-assigned-ftd', $scope);

					}

				};

			}

		}

		/**
		 * Complete security by binding $scope.hasRole(), $scope.isAuthorized() and then running doInitPage()
		 */
		function completeSecurity() {

			/**
			 * Allow switching FTDs for certain users
			 */
			$scope.switchFTD = function () {

				// Only allow admins to do this
				if ($scope.hasRole('ftd')) {

					// Create an object that will pass up from the child scope
					$scope.newFTD = {};

					// Launch the modal dialog
					utils.modal(isAdmin ? 'switch-ftd' : 'no-assigned-ftd', $scope);

					// Watch our newFTD variable
					$scope.$watch('newFTD.id', function (id) {

						if (id) {

							// Update the localStorage variable
							localStorage.ftssCachedFTD = JSON.stringify(
								{
									'Id'      : caches.Units[id].Id,
									'LongName': caches.Units[id].LongName
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
			$scope.hasRole = function (roles) {

				return isAdmin || _(roles.map ? roles : [roles]).any(function (role) {

						return groups.indexOf(role) > -1;

					});

			};

			/**
			 * Performs page validation check
			 *
			 */
			$scope.isAuthorized = isAdmin ?

			                      function () {

				                      $scope.abort = false;
				                      return true;

			                      } :

			                      function () {

				                      var page = authorizationMatrix[_fn.getPage()];

				                      $scope.abort = page ? (_.intersection(page, groups).length < 1) : false;

				                      return !$scope.abort;

			                      };

			// Call doInitPage() as this might be the last item in the async chain to complete
			_fn.doInitPage();

		}

	};

}());
