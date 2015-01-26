/*global angular, PRODUCTION, FTSS */
/**
 * FTSS Initializer
 *
 */

(function () {

	"use strict";

	/**
	 * Create the Angular module & declare dependencies
	 *
	 * @type {module}
	 */
	FTSS.ng = angular.module(
		'FTSS',
		[
			'ngRoute',
			'ngSharePoint',
			'mgcrea.ngStrap',
			'partials',
			'angularFileUpload',
			'ngAnimate',
			'ngSanitize',
			'ui.calendar',
			'n3-line-chart',
			'angular-loading-bar'
		]);

	/*
	 * The AngularJS Router will be used to handle various page mappings and links to the HTML Partials for FTSS
	 */
	FTSS.ng.config(
		[
			'$routeProvider',
			'$modalProvider',
			'$datepickerProvider',
			'$locationProvider',
			function ($routeProvider, $modalProvider, $datepickerProvider, $locationProvider) {

				// Our route list for various pages/actions
				var routes =
					    [
						    'home',
						    'requirements',
						    'scheduled',
						    'scheduled-ftd',
						    'ttms',
						    'requests',
						    'catalog',
						    'manage-ftd',
						    'backlog',
						    'hosts',
						    'admin',
						    'admin-instructors',
						    'reset',
						    'production-ftd'
					    ];

				while (routes.length) {

					// Remove the next item from the array
					var route = routes.shift();

					// Route based on name / linker / search to a controller of nameController
					$routeProvider.when('/' + route + '/:link?/:search?', {

						'templateUrl': '/partials/' + route + '.html',
						'controller' : route + 'Controller'

					});

				}

				// Send all other requests to our home page
				$routeProvider.otherwise({'redirectTo': '/home'});

				$locationProvider.html5Mode(false);

				// Defaults for angular-strop modal directive
				angular.extend($modalProvider.defaults, {
					'container': 'body',
					'animation': 'am-fade-and-scale'
				});

			}
		]);

	// Set the base SP collection used by FTSS
	var base = 'https://cs1.eis.af.mil/sites/FTSS/';

	FTSS.ng.value('SP_CONFIG',

	              PRODUCTION ?

	              {

		              // These are the ng-sharepoint parameters for the PRODUCTION version of FTSS
		              'offline'     : false,
		              'baseURL'     : base + 'live/_vti_bin/ListData.svc/',
		              'user'        : {'url': base + 'live/_vti_bin/UserGroup.asmx'},
		              'cacheVersion': 23

	              } : {

		              // These are the ng-sharepoint parameters for the DEVELOPMENT version of FTSS
		              'offline'     : false,
		              'baseURL'     : base + 'dev2/_vti_bin/ListData.svc/',
		              'user'        : {'url': base + 'dev2/_vti_bin/UserGroup.asmx'},
		              'cacheVersion': 23

	              });

	// Default template for lo-dash _.template() function
	_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

	// This probably doesn't belong here? :-D
	FTSS.supportEmail = '372trs.trg.ftss@us.af.mil';
	FTSS.J4Email = '982TRG.J4scheduling@us.af.mil';

	// Helper variable for handling production vs development mode photos
	FTSS.photoURL = PRODUCTION ? base + 'live/Bios/' : base + 'dev2/Bios/';

	// These are the default user preferences for the app
	FTSS.prefs = localStorage.FTSS_prefs ? JSON.parse(localStorage.FTSS_prefs) : {

		// Page limit default
		'limit'   : 50,

		// CSS animations
		'animate' : true,

		// Focus tooltips (when in a field it gives you a popup with instructions)
		'tooltips': true,

		// Enable/disable page instructions
		'page'    : true,

		// Hover tooltips (mainly used with buttons)
		'hover'   : true

	};

}());