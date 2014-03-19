/*global angular, RawDeflate, LZString, _ */

/**
 * Angular SharePoint
 *
 * (c) 2014 Jeff McCoy, http://jeffm.us
 *
 * License: MIT
 */
(function () {

	"use strict";

	angular

		.module('ngSharePoint',
	            [
	            ])

		.factory('SharePoint',
	             [
		             '$http',
		             function ($http) {

			             var _config, _utils = {};

			             _config = {
				             //'baseURL': 'https://sheppard.eis.aetc.af.mil/982TRG/373TRS/Det306/scheduling/_vti_bin/ListData.svc/',
				             'baseURL': 'http://dev/_vti_bin/ListData.svc/',
				             'userURL': 'http://dev/_layouts/userdisp.aspx?Force=True',
				             //'pplURL' : 'https://cs3.eis.af.mil/_vti_bin/ListData.svc/UserInformationList',
				             'pplURL' : 'http://dev/_vti_bin/ListData.svc/UserInformationList',
				             'offline': false,
				             'noCache': false
			             };

			             /**
			              * Generate a timestamp offset from 1 Jan 2014 (EPOCH was too large and causing SP to throw a 500 error) :-/
			              *
			              * @returns {number} timestamp
			              */
			             _utils.getTimeStamp = function () {
				             return Math.floor((new Date(new Date())).getTime() / 1000 - 1388552400);
			             };

			             /**
			              * Binds _utils.compress & _utils.decompress to RawDeflate, LZString or a fallback function
			              * for localStorage cache compression
			              *
			              * RawDeflate: https://github.com/dankogai/js-deflate
			              * LZString: https://github.com/pieroxy/lz-string/
			              *
			              * @type {*|deflate|Function}
			              */
			             _utils.compress = RawDeflate && RawDeflate.deflate || LZString && LZString.compressToUTF16 || function (data) {
				             return data;
			             };

			             _utils.decompress = RawDeflate && RawDeflate.inflate || LZString && LZString.decompressFromUTF16 || function (data) {
				             return data;
			             };

			             _utils.beforeSend = function (scope) {

				             delete scope.__metadata;

				             if (scope.cache) {
					             scope.Timestamp = _utils.getTimeStamp();
					             delete scope.cache;
				             }

				             _(scope).each(function (s, field) {

					             if (field.indexOf('_JSON') > 0) {
						             scope[field] = JSON.stringify(s);
					             }

				             });

				             return scope;
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

							             return filter ? _(data).filter(function (d) {

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
						             return $http({
							                          'dataType': 'json',
							                          'method'  : 'GET',
							                          'cache'   : true,
							                          'url'     : _config.pplURL,
							                          'params'  : {
								                          '$select': 'Id,Name',
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
				             'user'  : function ($scope, sField) {

					             var scopeField = sField || 'user';

					             try {

						             var data = localStorage.getItem('SP_REST_USER');

						             if (data) {

							             data = JSON.parse(data);

							             if (new Date().getTime() - data.updated < 2592000000) {

								             $scope[scopeField] = data;
								             return;

							             }

						             }

					             } catch (e) {
					             }

					             return $http({
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

							                   html.find('#SPFieldText').each(function () {

								                   var field1, field2;

								                   field1 = this.innerHTML.match(/FieldName\=\"(.*)\"/i)[1];
								                   field2 = this.innerHTML.match(/FieldInternalName\=\"(.*)\"/i)[1];

								                   data[field1] = data[field2] = this.innerText.trim();

							                   });

							                   localStorage.SP_REST_USER = JSON.stringify(data);

							                   $scope[scopeField] = data;

						                   });

				             },

				             'create': function (scope) {

					             return $http({
						                          'method': 'POST',
						                          'url'   : _config.baseURL + scope.__metadata,
						                          'data'  : _utils.beforeSend(scope)
					                          });

				             },

				             'update': function (scope) {

					             return $http({
						                          'method' : 'POST',
						                          'url'    : scope.__metadata.uri,
						                          'headers': {
							                          'If-Match'     : scope.__metadata.etag,
							                          'X-HTTP-Method': 'MERGE'
						                          },
						                          'data'   : _utils.beforeSend(scope)
					                          });

				             },

				             'read': function (options) {

					             var getData, getCache, cacheString;

					             // If this request uses caching, then we need to create a localStorage key
					             cacheString = options.cache ?

					                           'SP_REST_Cache_' +

						                           // Include the SP List name
					                           options.source +

					                           JSON.stringify(options.params)

						                           // Remove all the junk from our JSON string of the model
						                           .replace(/[^\w]/gi, '_').replace(/(\_)\1+/g, '$1')

						             : '';

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

						             if (opt.params && _.isEmpty(opt.params.$filter)) {
							             delete opt.params.$filter;
						             }

						             return $http({
							                          'dataType': 'json',
							                          'method'  : 'GET',
							                          'url'     : _config.baseURL + opt.source,
							                          'params'  : opt.params || null
						                          })

							             .then(function (response) {

								                   var i = 0,

									                   data = response.data.d.results || response.data.d,

									                   decoder,

									                   json =
										                   [
										                   ];

								                   if (data.length) {

									                   _.chain(data[0])

										                   .keys()

										                   .each(function (f) {
											                         if (f.indexOf('_JSON') > 1) {
												                         json.push(f);
											                         }
										                         });

									                   if (json.length) {

										                   decoder = function (v) {

											                   _(json).each(function (field) {

												                   v[field] = JSON.parse(v[field]);

											                   });

											                   return v;

										                   };

									                   }

									                   try {

										                   data = _.reduce(data, function (o, v) {
											                   o[v.Id || i++] = json ? decoder(v) : v;
											                   return o;
										                   }, {});

									                   } catch (e) {
									                   }

								                   }

								                   return data;

							                   });

					             };

					             /**
					              * getCache custom cache resolver/awesomeness generator
					              * This will attempt to read localStorage for any previously cached data and merge
					              * updates with the cache.
					              *
					              * YOU MUST HAVE A SP FIELD NUMBER FIELD NAMES "Timestamp" FOR THIS TO WORK
					              *
					              * The Modified field WOULD have been perfect if SP oData requests filtered times properly :-/
					              *
					              * @param callback
					              */
					             getCache = function (callback) {

						             var cachedData, timestamp, opts;

						             // Load the cached data, if it doesn't actually exist we'll deal with it later on
						             cachedData = localStorage.getItem(cacheString + 'Data');

						             // Offline enabled and the item exists, just return it without checking SP
						             if (_config.offline && cachedData) {

							             callback(JSON.parse(_utils.compress(cachedData)));

						             } else {

							             // Check to see if localStorage already has a cache of this data
							             timestamp = localStorage.getItem(cacheString + 'Stamp') || false;

							             // If we already have cached data we need to add the timestamp to the filter
							             if (timestamp) {

								             // Lazy man's deep object clone
								             opts = JSON.parse(JSON.stringify(options));

								             // Start our new filter with the timestamp lookup--just in case SP is being dumb about SQL optimization
								             opts.params.$filter = '(Timestamp gt ' + timestamp + ')' + (opts.params.$filter ? ' and ' + opts.params.$filter : '');

							             }

							             // Set a new timestamp before our network call (so we don't miss anything)
							             timestamp = _utils.getTimeStamp();

							             // Call getData() with the custom opts or options as applicable
							             getData(opts || options)

								             .then(function (data) {

									                   // There are a lot of ways to slice this, but this is the easiest and most reliable
									                   try {
										                   cachedData = JSON.parse(_utils.decompress(cachedData));
									                   } catch (e) {
										                   cachedData = {};
									                   }

									                   // There was some data so we can add that to our cache and update everything
									                   if (data !== {}) {

										                   try {

											                   // Merge our updates with the cache
											                   _(data).each(function (row) {
												                   cachedData[row.Id] = row;
											                   });

											                   // Convert new cached object to JSON and compress to UTF16 (for IE compatibility)
											                   localStorage[cacheString + 'Data'] = _utils.compress(JSON.stringify(cachedData));

											                   // Set the timestamp AFTER updating the cache (just in case something goes wrong)
											                   localStorage[cacheString + 'Stamp'] = timestamp;

											                   // Add a helpful little updated property to our response (but only after caching without it)
											                   _(data).each(function (row) {
												                   cachedData[row.Id].updated = true;
											                   });

										                   } catch (e) {


										                   }

									                   }

									                   // All done, do the callback
									                   callback(cachedData);

								                   });

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
