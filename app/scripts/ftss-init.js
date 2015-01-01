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
			'ui.calendar'
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
						    'reset'
					    ];

				while (routes.length) {

					var route = routes.shift();

					$routeProvider.when('/' + route + '/:link?/:search?', {

						'templateUrl': '/partials/' + route + '.html',
						'controller' : route + 'Controller'

					});

				}

				$routeProvider.otherwise({'redirectTo': '/home'});

				$locationProvider.html5Mode(false);

				angular.extend($modalProvider.defaults, {
					'container': 'body',
					'animation': 'am-fade-and-scale'
				});

			}
		]);

	var base = 'https://cs1.eis.af.mil/sites/FTSS/';

	FTSS.ng.value('SP_CONFIG',

	              PRODUCTION ?

	              {

		              'offline'     : false,
		              'baseURL'     : base + 'live/_vti_bin/ListData.svc/',
		              'user'        : { 'url': base + 'live/_vti_bin/UserGroup.asmx' },
		              'cacheVersion': 17

	              } : {

		              'offline'     : true,
		              'baseURL'     : base + 'development/_vti_bin/ListData.svc/',
		              'user'        : { 'url': base + 'development/_vti_bin/UserGroup.asmx' },
		              'cacheVersion': 17

	              });

	prefetchData && prefetchData() && delete window.prefetchData;

	_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

	FTSS.utils = {};

	FTSS.supportEmail = '372trs.trg.ftss@us.af.mil';

	FTSS.photoURL = PRODUCTION ? base + 'live/Bios/' : base + 'development/Bios/';

	FTSS.prefs = localStorage.FTSS_prefs ? JSON.parse(localStorage.FTSS_prefs) : {

		'limit': 50,

		'animate': true,

		'tooltips': true,

		'page': true,

		'hover': true

	};

}());