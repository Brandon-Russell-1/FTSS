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
			           'vendor/init_globals.js',
			           'bower_components/angular/angular.js',
			           'bower_components/angular-route/angular-route.js',
			           'bower_components/angular-sanitize/angular-sanitize.js',
			           'bower_components/jquery/dist/jquery.js',
			           'bower_components/lodash/dist/lodash.js',
			           'bower_components/IndexedDBShim/dist/IndexedDBShim.js',
			           'bower_components/db.js/src/db.js',
			           'bower_components/momentjs/moment.js',
			           'bower_components/angular-strap/dist/angular-strap.js',
			           'bower_components/ng-file-upload/angular-file-upload.js',
			           'bower_components/angular-animate/angular-animate.js',
			           'bower_components/angular-mocks/angular-mocks.js',
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
