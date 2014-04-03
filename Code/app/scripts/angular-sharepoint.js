/*global angular, db, _, PRODUCTION */

/**
 * Angular SharePoint
 *
 * (c) 2014 Jeff McCoy, http://jeffm.us
 *
 * License: MIT
 */
(function () {

	"use strict";

	var _cache = [];

	db.open({
		        'server' : 'FTSS',
		        'version': 1,
		        'schema' : {
			        'prefs' : {
				        'keyPath': 'q'
			        },
			        'caches': {
				        'keyPath': 'q'
			        }
		        }
	        })

		.done(function (instance) {

			      var runners = _cache.slice(0);

			      _cache = instance;

			      while (runners.length) {
				      runners.shift().call();
			      }

		      });

	angular

		.module('ngSharePoint', [])

		.factory(
		'SharePoint',

		['$http',

		 function ($http) {

			 var _config, _utils = {}, _debounce = {};

			 _config = PRODUCTION ?

			           {
				           'baseURL': '/sites/OO-ED-AM-11/FTSS/Prototype/_vti_bin/ListData.svc/',
				           'userURL': '/_layouts/userdisp.aspx?Force=True',
				           'pplURL' : '/_vti_bin/ListData.svc/UserInformationList',
				           'offline': false,
				           'noCache': false
			           } : {
				           'baseURL': 'http://' + location.hostname + ':8080/_vti_bin/ListData.svc/',
				           'userURL': 'http://' + location.hostname + ':8080/_layouts/userdisp.aspx?Force=True',
				           'pplURL' : 'http://' + location.hostname + ':8080/_vti_bin/ListData.svc/UserInformationList',
				           'offline': true,
				           'noCache': false
			           };

			 /**
			  * Generate a timestamp offset from 1 Jan 2014 (EPOCH was too large and causing SP to throw a 500 error) :-/
			  *
			  * @returns {number} timestamp
			  */
			 _utils.getTimeStamp = function () {
				 return Math.floor(new Date().getTime() / 1000 - 1388552400);
			 };

			 _utils.beforeSend = function (scope) {

				 // Empty the debounce list to prevent etag issues if the user is a really fast clicker!
				 _debounce = {};

				 delete scope.__metadata;

				 if (scope.cache) {
					 scope.Timestamp = _utils.getTimeStamp();
					 delete scope.cache;
				 }

				 _(scope).each(function (s, field) {

					 if (field.indexOf('_JSON') > 0) {
						 scope[field] = s !== null ? JSON.stringify(s) : '';
					 }

				 });

				 return scope;
			 };

			 _utils.getDate = (function () {

				 var dCache = {};

				 return function (date) {

					 if (date && !dCache[date]) {

						 dCache[date] = new Date(Number(date.replace(/[^\d.]/g, '')));

					 }

					 return date ? dCache[date] : null;

				 };

			 }());

			 /**
			  * Creates a sanitized for our cache key
			  * @param options
			  * @returns {*}
			  */
			 _utils.cacheString = function (options) {

				 return options.cache ?

					 // Include the SP List name
					    options.source + JSON.stringify(options.params)

						    // Remove all the junk from our JSON string of the model
						    .replace(/[^\w]/gi, '')

					 : '';

			 };

			 return {

				 /**
				  *
				  */
				 'people': (function () {

					 // This is the cache of our people queries
					 var _cache = {};

					 return function (search, filter) {

						 // Call the filter independently because it may be change while the SP data shouldn't
						 var execFilter = function (data) {

							 return filter ? _.filter(data, function (d) {

								 return filter(d);

							 }) : data;

						 };

						 // If we've already done this search during the app's lifecycle, return it instead
						 if (_cache[search]) {

							 return {
								 'then': function (callback) {
									 callback(execFilter(_cache[search]));
								 }
							 };

						 }

						 // No cache existed so make the SP query
						 return $http(
							 {
								 'dataType': 'json',
								 'method'  : 'GET',
								 'cache'   : true,
								 'url'     : _config.pplURL,
								 'params'  : {
									 '$select': 'Name,WorkEMail',
									 '$filter': "startswith(Name,'" + search + "')",
									 '$top'   : 5
								 }
							 })

							 // Now convert to an array, store a copy in the cache and return results of execFilter()
							 .then(function (response) {

								       var data = _cache[search] = _.toArray(response.data.d);
								       return execFilter(data);

							       });

					 };

				 }()),
				 'user'  : function (scope, sField) {

					 var scopeField = sField || 'user';

					 try {

						 var data = localStorage.getItem('SP_REST_USER');

						 if (data) {

							 data = JSON.parse(data);

							 if (new Date().getTime() - data.updated < 2592000000) {

								 scope[scopeField] = data;
								 return;

							 }

						 }

					 } catch (e) {
					 }

					 return $http(
						 {
							 'method': 'GET',
							 'cache' : true,
							 'url'   : _config.userURL
						 })

						 .then(function (response) {

							       var data, html;

							       data = {
								       'id'     : parseInt(response.data.match(/_spuserid=(\d+);/i)[1], 10),
								       'updated': new Date().getTime()
							       };

							       html = $(response.data.replace(/[ ]src=/g, ' data-src='));

							       html.find('#SPFieldText')
								       .each(function () {

									             var field1, field2;

									             field1 = this.innerHTML.match(/FieldName\=\"(.*)\"/i)[1];
									             field2 = this.innerHTML.match(/FieldInternalName\=\"(.*)\"/i)[1];

									             data[field1] = data[field2] = this.innerText.trim();

								             });

							       localStorage.SP_REST_USER = JSON.stringify(data);

							       scope[scopeField] = data;

						       });

				 },

				 'create': function (scope) {

					 return $http(
						 {
							 'method': 'POST',
							 'url'   : _config.baseURL + scope.__metadata,
							 'data'  : _utils.beforeSend(scope)
						 });

				 },

				 'update': function (scope) {

					 return $http(
						 {
							 'method' : 'POST',
							 'url'    : scope.__metadata.uri,
							 'headers': {
								 'If-Match'     : scope.__metadata.etag,
								 'X-HTTP-Method': 'MERGE'
							 },
							 'data'   : _utils.beforeSend(scope)
						 });

				 },

				 'read': function (optOriginal) {

					 var getData, getCache, cacheString, options;

					 options = angular.copy(optOriginal);

					 // clear emtpy filters before we get started
					 if (options.params && _.isEmpty(options.params.$filter)) {
						 delete options.params.$filter;
					 }

					 // If this request uses caching, then we need to create a localStorage key
					 cacheString = _utils.cacheString(options);

					 /**
					  * getData $http wrapper, wraps the $http service with some SP-specific garbage
					  *
					  * @param opt Object
					  * @returns {*|Promise}
					  */
					 getData = function (opt) {

						 // Join the params list if it is an array
						 _(opt.params).each(function (param, key) {
							 if (param instanceof Array) {
								 opt.params[key] = param.join(',');
							 }
						 });

						 return $http(
							 {
								 'dataType': 'json',
								 'method'  : 'GET',
								 'url'     : _config.baseURL + opt.source,
								 'params'  : opt.params || null
							 })

							 .then(function (response) {

								       var i = 0,

								           data = response.data.d.results || response.data.d,

								           decoder,

								           json = [],

								           date = [];

								       if (data.length) {

									       _(data[0]).each(function (d, f) {

										       var type = typeof(d);

										       if (f.indexOf('_JSON') > 1) {
											       json.push(f);
										       } else if (type === 'string' || type === 'object') {
											       date.push(f);
										       }

									       });

									       decoder = function (v) {

										       if (json.length) {
											       _(json).each(function (field) {

												       v[field] = JSON.parse(v[field]);

											       });
										       }

										       if (date.length) {
											       _(date).each(function (field) {

												       if (typeof v[field] ===
												           'string' &&
												           v[field].indexOf('/Date(') > -1) {

													       v[field] = _utils.getDate(v[field]);

												       }

											       });
										       }

										       return v;

									       };

									       return _.reduce(data, function (o, v) {
										       o[v.Id || i++] = decoder(v);
										       return o;
									       }, {});

								       }

								       return data;

							       });

					 };

					 /**
					  * getCache custom cache resolver/awesomeness generator
					  * This will attempt to read localStorage for any previously cached data and merge
					  * updates with the cache.
					  *
					  * YOU MUST HAVE A SP FIELD NUMBER FIELD NAMED "Timestamp" FOR THIS TO WORK
					  *
					  * The Modified field WOULD have been perfect if SP oData requests filtered times properly :-/
					  *
					  * @param callback
					  */
					 getCache = function (callback) {

						 // Load the cached data, if it doesn't actually exist we'll deal with it later on
						 var runner = function () {

							 _cache.caches.get(cacheString).done(function (cachedData, opts, hasCache, oldStamp) {

								 cachedData = cachedData || {'json': {}, 'time': false};

								 // Offline enabled and the item exists, just return it without checking SP
								 if (_config.offline && cachedData.time) {

									 callback(cachedData.json);
									 return;

								 }

								 hasCache = !!cachedData.time;

								 oldStamp = cachedData.time;

								 // Set a new timestamp before our network call (so we don't miss anything)
								 cachedData.time = _utils.getTimeStamp();

								 // If we already have cached data we need to add the timestamp to the filter
								 if (hasCache) {

									 if (_debounce[cacheString] && cachedData.time -  _debounce[cacheString] < 15) {

										 callback(cachedData.json);
										 return;

									 }

									 // Lazy man's deep object clone
									 opts = JSON.parse(JSON.stringify(options));

									 // Start the filter with the timestamp--just in case SP is being dumb (optimization)
									 opts.params.$filter = '(Timestamp gt ' + oldStamp + ')' +

									                       (opts.params.$filter ?
									                        ' and ' + opts.params.$filter : '');

								 }
								 _debounce[cacheString] = cachedData.time;

								 // Call getData() with the custom opts or options as applicable
								 getData(opts || options)

									 .then(function (data) {

										       // There was some data so we can add that to our cache and update everything
										       if (!_.isEmpty(data)) {

											       // Merge our updates with the cache
											       _(data).each(function (row, key) {
												       cachedData.json[key] = row;
											       });

											       // Fire & forget--just add this and keep going
											       _cache.caches.update(
												       {
													       'item': cachedData,
													       'key' : cacheString
												       });

											       if (hasCache) {

												       // Add a helpful little updated property to our response (but only after caching without it)
												       _(data).each(function (row, key) {
													       cachedData.json[key].updated = true;
												       });

											       }

										       }

										       // All done, do the callback
										       callback(cachedData.json);

									       });


							 });

						 };

						 if (typeof _cache.length === 'number') {
							 _cache.push(runner);
						 } else {
							 runner();
						 }

					 };

					 // If caching is disabled for the service, then override the request
					 if (_config.noCache) {
						 options.cache = false;
					 }

					 // Return the getData or getCache promises
					 return !options.cache ?

						 // Return getData()'s $http promises, no caching
						    getData(options) :

						 // Return getCache()'s custom promises, caching is enabled
						    {

							    'then'   : getCache,
							    'catch'  : function () {
							    },
							    'finally': function () {
							    }

						    };
				 }

			 };

		 }
		]);


}());
