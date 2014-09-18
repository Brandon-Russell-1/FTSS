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
			'ngSanitize'
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
						    'requests',
						    'instructors',
						    'catalog',
						    'units',
						    'backlog',
						    'hosts'
					    ];

				while (routes.length) {

					var route = routes.shift();

					$routeProvider.when('/' + route + '/:link?/:view?', {

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

				angular.extend($datepickerProvider.defaults, {
					'dateFormat': 'd MMM yyyy',
					'startWeek' : 1,
					'autoclose' : true
				});

			}
		]);

	FTSS.ng.value('SP_CONFIG', PRODUCTION ?
	                           {
		                           'baseURL': '/sites/OO-ED-AM-11/FTSS/Prototype/_vti_bin/ListData.svc/'
	                           } : {

		                           'baseURL': 'http://virtualpc/dev/_vti_bin/ListData.svc/',
		                           'userURL': 'http://virtualpc/_layouts/userdisp.aspx?Force=True',
		                           'pplURL' : 'http://virtualpc/_vti_bin/ListData.svc/UserInformationList'

	                           });

	FTSS.people = {};
	FTSS.utils = {};

	FTSS.prefs = localStorage.FTSS_prefs ? JSON.parse(localStorage.FTSS_prefs) : {

		'limit': 35,

		'animate': true,

		'tooltips': true,

		'page': true,

		'hover': true

	};

}());