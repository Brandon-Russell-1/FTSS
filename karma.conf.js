// Karma configuration
// Generated on Thu Jun 19 2014 00:32:57 GMT-0400 (EDT)

module.exports = function (config) {
	config.set({

		           // base path, that will be used to resolve files and exclude
		           basePath      : '',


		           // frameworks to use
		           frameworks    : ['jasmine'],

		           // list of files / patterns to load in the browser
		           files         : [
			           'app/controllers/helper.spec.js',
			           'bower_components/angular/angular.js',
			           'bower_components/angular-route/angular-route.js',
			           'bower_components/angular-sanitize/angular-sanitize.js',
			           'bower_components/jquery/dist/jquery.js',
			           'bower_components/lodash/lodash.js',
			           'bower_components/moment/moment.js',
			           'bower_components/angular-strap/dist/angular-strap.js',
			           'bower_components/ng-file-upload/angular-file-upload.js',
			           'bower_components/angular-animate/angular-animate.js',
			           'bower_components/angular-mocks/angular-mocks.js',
			           'bower_components/angular-ui-calendar/src/calendar.js',
			           'bower_components/microplugin/src/microplugin.js',
			           'bower_components/sifter/sifter.js',
			           'bower_components/selectize/dist/js/selectize.js',
			           'bower_components/n3-line-chart/dist/line-chart.js',
			           'bower_components/angular-loading-bar/build/loading-bar.js',
			           'bower_components/comma-separated-values/csv.js',
			           '_public/js/partials.js',
			           'app/scripts/ftss-init.js',
			           'app/scripts/*.js',
			           'app/**/*.js'
		           ],

		           // list of files to exclude
		           exclude       : [ ],

		           // test results reporter to use
		           // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'

		           // test results reporter to use
		           reporters: ['progress', 'dots', 'coverage'],

		           // configure which files should be tested for coverage
		           preprocessors: {
			           'app/**/*.js': 'coverage'
		           },

		           // web server port
		           port          : 9876,

		           // enable / disable colors in the output (reporters and logs)
		           colors        : true,

		           // level of logging
		           // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		           logLevel      : config.LOG_INFO,

		           // enable / disable watching file and executing tests whenever any file changes
		           autoWatch     : true,

		           // Start these browsers, currently available:
		           // - Chrome
		           // - ChromeCanary
		           // - Firefox
		           // - Opera
		           // - Safari (only Mac)
		           // - PhantomJS
		           // - IE (only Windows)
		           browsers      : ['PhantomJS'],

		           // If browser does not capture in given timeout [ms], kill it
		           captureTimeout: 60000,

		           // Continuous Integration mode
		           // if true, it capture browsers, run tests and exit
		           singleRun     : false
	           });
};
