/*global angular, PRODUCTION, FTSS */
/**
 * FTSS Initializer
 *
 */

(function () {

	"use strict";

	// Prevent parallel execution (for fail over execution)
	if (FTSS.ng) { return }

	// Remove our slow load message
	clearTimeout(window.slowLoad);

	_TIMER.add('ftss');

	// Record our page load times only once and only for slow connections
	FTSS.performance = (window.performance.now() > 9999) ? function (send) {

		send.D = _TIMER.get();
		FTSS.performance = angular.noop;

	} : angular.noop;


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
			'$locationProvider',
			'$compileProvider',
			'$sceDelegateProvider',
			'cfpLoadingBarProvider',
			function ($routeProvider, $modalProvider, $locationProvider, $compileProvider, $sceDelegateProvider, cfpLoadingBarProvider) {

				// Disable angular debugging for production mode
				$compileProvider.debugInfoEnabled(!PRODUCTION);

				// Allow AF Portal iframe
				$sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('^https://www.my.af.mil/.+$')]);

				// Disable the spinner globally
				cfpLoadingBarProvider.includeSpinner = false;

				// Our route list for various pages/actions
				var routes = [
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

					if (route !== 'reset') {

						// Route based on name / linker / search to a controller of nameController
						$routeProvider.when('/' + route + '/:link?/:search?', {

							'templateUrl'         : '/partials/' + route + '.html',
							'controller'          : route + 'Controller',
							'reloadOnSearch'      : false,
							'caseInsensitiveMatch': true,
							'routeName'           : route

						});

					} else {

						$routeProvider.when('/reset', {});

					}

				}

				// Send all other requests to our home page
				$routeProvider.otherwise({'redirectTo': '/home'});

				$locationProvider.html5Mode(false);

				// Defaults for angular-strop modal directive
				angular.extend($modalProvider.defaults, {
					'container': 'body',
					'animation': 'am-fade-and-scale',
					'template' : '/partials/modal-template.html'
				});

			}
		]);

	// Set the base SP collection used by FTSS
	var base = 'https://cs1.eis.af.mil/sites/FTSS/';

	// Only bind the prefetch values in production mode
	if (PRODUCTION && FTSS.PREFETCH) {
		FTSS.ng.value('SP_PREFETCH', FTSS.PREFETCH);
	}

	// Flush to reduce memory burden
	delete  FTSS.PREFETCH;

	FTSS.ng.value('SP_CONFIG',

	              PRODUCTION ?

	              {

		              // These are the ng-sharepoint parameters for the PRODUCTION version of FTSS
		              'offline'     : false,
		              'baseURL'     : base + 'live/_vti_bin/ListData.svc/',
		              'user'        : {'url': base + 'live/_vti_bin/UserGroup.asmx'},
		              'people'      : {'url': 'https://cs1.eis.af.mil/_vti_bin/People.asmx'},
		              'cacheVersion': 26

	              } : {

		              // These are the ng-sharepoint parameters for the DEVELOPMENT version of FTSS
		              'offline'     : false,
		              'baseURL'     : base + 'dev2/_vti_bin/ListData.svc/',
		              'user'        : {'url': base + 'dev2/_vti_bin/UserGroup.asmx'},
		              'people'      : {'url': base + 'dev2/_vti_bin/People.asmx'},
		              'cacheVersion': 26

	              });

	// Default template for lo-dash _.template() function
	_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

	// This probably doesn't belong here? :-D
	FTSS.supportEmail = '372trs.trg.ftss@us.af.mil';
	FTSS.J4Email = '982TRG.J4scheduling@us.af.mil';

	// Helper variable for handling production vs development mode photos
	FTSS.photoURL = base + 'media/photos/';

	if (!PRODUCTION) {

		FTSS.ng.run([
			            'SharePoint',
			            function (SharePoint) {

				            FTSS.SP = SharePoint;

			            }
		            ])

	}

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