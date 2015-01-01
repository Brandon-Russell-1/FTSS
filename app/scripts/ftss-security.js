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

		'requirements': ['mtf',
		                 'ftd'
		],

		'requests': ['approvers',
		             'mtf',
		             'ftd'
		],

		'manage-ftd'   : ['ftd', 'scheduling'],
		'scheduled-ftd': ['ftd', 'scheduling'],

		'backlog': ['approvers',
		            'mtf',
		            'ftd'
		],
		'hosts'  : ['mtf',
		            'ftd'
		],
		'ttms'   : [
			'scheduling'
		]

	};

	FTSS.security = function (SharePoint, $scope, _fn) {

		var initSecurity = function (user) {

			var isAdmin = false,

			    groups = user.groups;


			if (user === 'DEVELOPER') {

				isAdmin = true;

				$scope.roleClasses = 'admin';

				$scope.roleText = '*** DEVELOPER MODE ***';
				;

			} else {

				// Extract the name of any groups the user is a member of
				groups = groups.name ? [groups.name] : _.pluck(groups, 'name');

				groups = groups.length ? groups : ['guest'];

				isAdmin = groups.indexOf('admin') > -1;

				// Used to modify views based on roles
				$scope.roleClasses = groups.join(' ');

				// This is the text that is displayed in the top-left corner of the app
				$scope.roleText = groups.join(' • ')
					.replace('mtf', 'MTS/UTM')
					.replace('ftd', 'FTD Scheduler/Production Supervisor')
					.replace('curriculum', 'Training/Curriculum Manager')
					.replace('scheduling', 'J4 Scheduler')
					.replace('approvers', 'Approver')
					.replace('admin', 'Administrator')
					.replace('guest', 'Visitor');

			}

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
			 * Performs page validation check, this is a private function to help keep things a little more protected
			 *
			 * @private
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

		};

		/**
		 * This eliminates the needless server calls for user/group info when developing FTSS.
		 *
		 * Yes, someone could easily spoof the global variable (if they paused the code during page load
		 * and changed it.  However, this is all just client-view stuff anyway.  Additionally, doing so
		 * would cause them more problems as it would force everything to read from a different SharePoint
		 * site altogether.  Finally, we make a double check by validating the file name matches.
		 *
		 */
		if (PRODUCTION === false && location.pathname === '/dev.html') {

			// We are assuming they are an admin and this is in development mode
			initSecurity('DEVELOPER');

		} else {

			// Load our user data into FTSS
			SharePoint.user($scope).then(initSecurity);

		}

	};

}());
