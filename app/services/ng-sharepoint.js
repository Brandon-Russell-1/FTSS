/**
 * Angular SharePoint
 *
 * An AngularJS module for interacting with Microsoft SharePoint's oData REST API
 *
 * (c) 2014 Jeff McCoy, http://jeffm.us
 *
 * License: MIT
 */

(function(window, angular, undefined) {

/*global _, angular */

var _cache, _config, _utils, _debounce, CONST;

// When caching is enabled, this variable stores references to queries to limit how fast a call can occur
_debounce = {};

angular

	// Define the module
	.module('ngSharePoint', [])

	// Optional config values
	.value('SP_CONFIG', null)

	// Optional config values
	.value('SP_PREFETCH', null)

	// Create our factory
	.factory('SharePoint',

             [
	             '$http',
	             '$q',
	             'SP_CONFIG',
	             'SP_PREFETCH',

	             function ($http, $q, SP_CONFIG, SP_PREFETCH) {

		             configuration(SP_CONFIG);

		             cache();

		             return main.apply(this, arguments);

	             }
             ]);

/*global _utils, angular */


_utils = {

	/**
	 * Generate a timestamp offset from 1 Jan 2014 (EPOCH was too large and causing SP to throw a 500 error) :-/
	 *
	 * @returns {number} timestamp
	 */
	'getTimeStamp': function () {
		return Math.floor(new Date().getTime() / 1000 - CONST.EPOCH_OFFSET);
	},

	/**
	 * Performs object cleanup prior to sending to SharePoint to prevent 500 errors
	 *
	 * @param scope
	 * @returns {*}
	 */
	'beforeSend': function (scope) {

		var scopeClone = angular.copy(scope);

		// Empty the debounce list to prevent etag issues if the user is a really fast clicker!
		_debounce = {};

		// Add the timestamp if this is a cached request
		if (scopeClone.cache) {
			scopeClone.Timestamp = _utils.getTimeStamp();
		}

		// Remove non-model properties to prevent needless transmission/SP errors
		delete scopeClone.__metadata;
		delete scopeClone.callback;
		delete scopeClone.cache;

		// JSON-encode any fields with the FIELD_JSON_TRAIL value
		_.each(scopeClone, function (s, field) {

			if (field.indexOf(CONST.FIELD_JSON_TRAIL) > 0) {
				scopeClone[field] = s !== null ? JSON.stringify(s) : '';
			}

		});

		return scopeClone;
	},

	/**
	 * Creates a sanitized string for our cache key
	 * @param options
	 * @returns {*}
	 */
	'cacheString': function (options) {

		// Remove all the junk from our JSON string of the model
		return JSON.stringify(options).replace(/[^\w]/gi, '')

	},


	'xmlToJSON': function (xml, tag) {

		var data = [];

		angular.element(xml).find(tag).each(function (key, element) {

			var row = {};

			_.each(element.children, function (el) {
				row[el.nodeName] = el.innerText;
			});

			_.each(element.attributes, function (prop) {
				row[prop.name] = prop.value;
			});

			if (xml.length > 1) {

				data.push(row);

			} else {

				data = row;

			}

		});

		return data;

	}

};

function cache() {

	// If caching is enabled/available set it up
	if (!_config.noCache) {

		// Array to hold our callbacks while the cache DB is still loading, this will change to the cacheDB after init
		_cache = [];

		var request = window.indexedDB.open('angularSharePoint', _config.cacheVersion);

		request.onupgradeneeded = function (event) {

			var db = event.target.result;

			event.target.transaction.onerror = databaseError;

			// Only flush the cache if it already exists
			if (db.objectStoreNames.length > 0) {

				db.deleteObjectStore('caches');

			}

			// Create an objectStore to hold our cache strings
			db.createObjectStore('caches', {'keyPath': 'q'});

		};

		// Once the DB is loaded, try to run any cached callbacks and setup the cacheDB reference
		request.onsuccess = function (event) {

			// Clone the _cache array to runners[]
			var runners = _cache.slice(0),

			    db = event.target.result;

			// Remap _cache to instance (now acts as the cacheDB)
			_cache = {

				'get': function (key) {

					return {
						'then': function (callback) {

							var query = db
								.transaction('caches')
								.objectStore('caches')
								.get(key);

							query.onerror = databaseError;

							query.onsuccess = function (e) {
								callback(e.target.result && e.target.result.d || {'json': {}, 'time': 0});
							}

						}
					}


				},

				'put': function (key, data) {

					var query = db
						.transaction('caches', 'readwrite')
						.objectStore('caches');

					query.onerror = databaseError;

					query.put(
						{
							'd': data,
							'q': key
						});

				},

				'clear': function (callback) {

					var clear = db
						.transaction('caches', 'readwrite')
						.objectStore('caches')
						.clear();

					clear.onsuccess = clear.onerror = callback;

				}

			};

			// Run all the callbacks async
			while (runners.length) {

				// Use shift() to reduce the array and pass a callback
				setTimeout(runners.shift(), 25);

			}

		};

	}

}

function databaseError(e) {
	console && console.error('An IndexedDB error has occurred', e);
	_config.logger && _config.logger(e);
}
;function configuration(SP_CONFIG) {

	// Constants for the service
	CONST = {

		// MS in a day,
		'JS_DAY'          : 86400000,

		// For caching, this is the initial timing offset (1 Jan 2014).  SP gives intermitten 500 errors if you use EPOCH
		'EPOCH_OFFSET'    : 1388552400,

		// The field name suffix for any JSON fields that will be automatically encoded/decoded by ng-sharepoint
		'FIELD_JSON_TRAIL': '_JSON',

		// For SP 2010 use 2.0 for 2013 it's 3.0.  This was added due to random 500 errors from a SP farm when this header wasn't sent (this is NOT required by the oData Spec)!
		'ODATA_VERSION'   : '2.0',

		'SOAP': {

			'userinfo': '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetCurrentUserInfo xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/" /></soap12:Body></soap12:Envelope>',

			'groups': '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><GetGroupCollectionFromUser xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/"><userLoginName>_USER_</userLoginName></GetGroupCollectionFromUser></soap12:Body></soap12:Envelope>',

			'usersearch': '<?xml version="1.0" encoding="utf-8"?> <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"> <soap12:Body> <SearchPrincipals xmlns="http://schemas.microsoft.com/sharepoint/soap/"> <searchText>_SEARCH_</searchText> <maxResults>_LIMIT_</maxResults> <principalType>User</principalType> </SearchPrincipals> </soap12:Body> </soap12:Envelope>',

			'useradd': '<?xml version="1.0" encoding="utf-8"?> <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"> <soap12:Body> <ResolvePrincipals xmlns="http://schemas.microsoft.com/sharepoint/soap/"> <principalKeys>_USERS_</principalKeys> <principalType>User</principalType> <addToUserInfoList>true</addToUserInfoList> </ResolvePrincipals> </soap12:Body> </soap12:Envelope>'
		}

	};

	_config = _.defaults(
			SP_CONFIG || {},

			{
				// The URL for ListData.svc, default: /_vti_bin/ListData.svc
				'baseURL'     : '/_vti_bin/ListData.svc/',

				// Enable offline mode, doesn't check for changes if data is already cached
				'offline'     : false,

				// Override all caching options (automatic if db isn't loaded)
				'noCache'     : !window.indexedDB || false,

				// User-defined value.  Changing this will force all users to flush/re-validate all caches, useful for schema changes
				'cacheVersion': 1,

				// Number of milliseconds to wait before sending GET requests (calls will be batched together)
				'batchReadWait': 50
			}
	);

	_config.people = _.defaults(
			SP_CONFIG.people || {},

			{

				// The URL for loading SP users
				'url': '/_vti_bin/People.asmx',

				'limit': 10

			}
	);

	_config.user = _.defaults(
			SP_CONFIG.user || {},

			{
				// The URL for loading user data, default: /_vti_bin/UserGroup.asmx
				'url'   : '/_vti_bin/UserGroup.asmx',

				// Determines whether user groups are loaded when user data is requested or not
				'groups': true
			}
	);


}
;function main($http, $q, SP_CONFIG, SP_PREFETCH) {

	// This is the cache of our people queries
	var _cachePeople = {},

		_batchTimer = 0,

		_batchStore = [],

		_self = {

			'_flushCache': function (callback) {

				// Handle async operations
				_cache.push ? _cache.push(clear) : clear();

				function clear() {

					_cache.clear(callback);

				}
			},

			'searchPeople': function (search) {

				var deferred = $q.defer();

				// If we've already done this search during the app's lifecycle, return it instead
				if (_cachePeople[search]) {

					deferred.resolve(_cachePeople[search]);

				} else {

					$http({
						'method' : 'POST',
						'url'    : _config.people.url,
						'headers': {
							'Content-Type': 'application/soap+xml; charset=utf-8'
						},
						data     : CONST.SOAP.usersearch.replace('_SEARCH_', search).replace('_LIMIT_', _config.people.limit)
					})

						.then(function (response) {

							      _cachePeople[search] = _utils.xmlToJSON(response.data, 'PrincipalInfo');

							      deferred.resolve(_cachePeople[search]);

						      });

				}

				return deferred.promise;

			},

			/**
			 * Load user data and group membership
			 *
			 * Generates a SOAP request for the user data information including the groups the member is a part of if enabled
			 *
			 *
			 * @returns {*}
			 */
			'user'  : function () {

				var deferred = $q.defer();

				runner = function () {

					_cache.get('userData').then(function (user) {

						// Only get the groups if user data is cached
						if (user[0] && user[0].loginname) {

							deferred.resolve(user[0]);

						} else {

							$http({
								'method' : 'POST',
								'url'    : _config.user.url,
								'headers': {
									'Content-Type': 'application/soap+xml; charset=utf-8'
								},
								data     : CONST.SOAP.userinfo
							})

								.then(function (response) {

									      user = _utils.xmlToJSON(response.data, 'user');

									      _cache.put('userData', user);

									      deferred.resolve(user);

								      });

						}


					});

				};

				_cache.push ? _cache.push(runner) : runner();

				return deferred.promise;

			},
			/**
			 * Load group membership
			 *
			 * Generates a SOAP request for the user data information including the groups the member is a part of if enabled
			 *
			 *
			 * @returns {*}
			 */
			'groups': function () {

				var deferred = $q.defer();

				this.user().then(function (user) {

					$http({
						'method' : 'POST',
						'url'    : _config.user.url,
						'headers': {
							'Content-Type': 'application/soap+xml; charset=utf-8'
						},
						data     : CONST.SOAP.groups.replace('_USER_', user.loginname)
					})

						.then(function (response) {

							      deferred.resolve(_utils.xmlToJSON(response.data, 'group'));

						      });

				});

				return deferred.promise;


			},

			/**
			 * Execute SQL transaction
			 *
			 * Perform chained sequence of operations
			 *
			 * @param collection
			 * @returns {*}
			 */
			'batch': function (collection) {

				var hasChangeset = false,

					map = [],

					requests = _.map(angular.copy(collection), function (data) {

						map.push(data);

						// Flip the changeset indicator
						hasChangeset = hasChangeset || data.__metadata;

						var headers = (!hasChangeset ? ['GET ' + data.READ + ' HTTP/1.1'] :

						               data.__metadata.etag ?

						               [
							               'MERGE ' + data.__metadata.uri + ' HTTP/1.1',
							               'If-Match: ' + data.__metadata.etag

						               ] : ['POST ' + data.__metadata + ' HTTP/1.1'])

							.concat(['Accept: application/json']);

						return (data.READ ? headers :

						        headers.concat([
							        'Content-Type: application/json;charset=utf-8',
							        '',
							        JSON.stringify(_utils.beforeSend(data)),
							        ''
						        ]))

							.join('\n')

					}),

				// Generate a random string used for our multipart boundaries
					seed = Math.random().toString(36).substring(2),

				// Generate the boundary for this transaction set
					boundary = 'b_' + seed,

				// Generate the changeset that will separate each individual action
					changeset = 'c_' + seed,

				// The header that appears before each action(must have the extra linebreaks or SP will die)
					header = [
						'',
						'--' + (hasChangeset ? changeset : boundary),
						'Content-Type: application/http',
						'Content-Transfer-Encoding: binary',
						'',
						''
					].join('\n'),

				// Create the body of the request with lots of linebreaks to make SP not sad.....
					body = !hasChangeset ?

					       (header + requests.join('\n' + header) + '\n\n' + '--' + boundary + '--') :

					       [

						       // Body start
						       '--' + boundary,

						       // Content type & changeset declaration
						       'Content-Type: multipart/mixed; boundary="' + changeset + '"',

						       // Prepend a header to each request
						       header + requests.join(header),

						       // Another mandatory linebreak for SP
						       '',

						       '--' + changeset + '--',
						       // Close the changeset out
						       '--' + boundary + '--'

						       // Close the boundary as well

					       ].join('\n').replace(/\#\n/g, '');

				// Call $http against $batch with the mulitpart/mixed content type & our body
				return $http(
					{
						'method' : 'POST',
						'url'    : _config.baseURL + '$batch',
						'headers': {
							'Content-Type'      : 'multipart/mixed; boundary=' + boundary,
							'DataServiceVersion': CONST.ODATA_VERSION
						},
						data     : body
					})

					.then(function (response) {

						      var index = 0,

							      data = response.data,

							      split = new RegExp('--' + (hasChangeset ? 'changeset' : 'batch') +
							                         'response_([\\w-]+)'),

							      processed = data.split(data.match(split)[0]),

							      retVal = {

								      'success': true,

								      'transaction': {
									      'sent'    : response.config.data,
									      'received': data
								      }

							      };

						      processed = processed.slice(1, processed.length - 1);

						      _.each(processed, function (row) {

							      var callback = map[index++].callback,

								      json;

							      if (retVal.success) {

								      retVal.success = (row.indexOf('HTTP/1.1 200') > 0) ||
								                       (row.indexOf('HTTP/1.1 201') > 0) ||
								                       (row.indexOf('HTTP/1.1 204') > 0);

								      try {
									      json =
										      JSON.parse(row.split('Content-Type: application/json;charset=utf-8')[1])
								      } catch (e) {
									      json = false;
								      }

								      json = !hasChangeset ? json : {
									      'etag': row.match(/ETag\:\s(.+)/i)[1],
									      'json': json
								      };

								      callback && callback(json);

							      }

						      });

						      return retVal;

					      });


			},

			/**
			 * Create data
			 *
			 * Performs a CREATE with the given scope variable, The scope
			 *
			 * @param {Object} scope
			 * @returns {*}
			 */
			'create': function (scope, headers, customProps) {

				return $http(_.defaults(
					// Add any special properties to pass to $http
					customProps || {},

					{
						'method' : 'POST',
						'url'    : _config.baseURL + (scope.__metadata.uri || scope.__metadata),
						'headers': _.defaults(headers || {}, {
							'DataServiceVersion': CONST.ODATA_VERSION
						}),
						'data'   : _utils.beforeSend(scope)
					}
				));

			},

			/**
			 * Updated data
			 *
			 * @param scope
			 * @returns {*}
			 */
			'update': function (scope, headers, customProps) {

				return $http(_.defaults(
					// Add any special properties to pass to $http
					customProps || {},

					{
						'method' : 'POST',
						'url'    : scope.__metadata.uri,
						'headers': _.defaults(headers || {}, {
							'If-Match'          : scope.__metadata.etag,
							'X-HTTP-Method'     : 'MERGE',
							'DataServiceVersion': CONST.ODATA_VERSION
						}),
						'data'   : _utils.beforeSend(scope)
					}
				));

			},

			/**
			 * Read Data
			 *
			 * @param optOriginal
			 * @returns {*|Promise}
			 */
			'read': function (optOriginal) {

				var getData, getCache, options, deferred = $q.defer();

				options = angular.copy(optOriginal);

				// clear empty filters before we get started
				if (options.params && _.isEmpty(options.params.$filter)) {
					delete options.params.$filter;
				}

				/**
				 * getData $http wrapper, wraps the $http service with some SP-specific garbage
				 *
				 * @param opt Object
				 * @returns {*|Promise}
				 */
				getData = function (opt) {

					var httpDefer = $q.defer();

					clearTimeout(_batchTimer);

					// Join the params list if it is an array
					_.each(opt.params, function (param, key) {

						// Does nothing for Strings but for Arrays is equivalent to [].join(',')
						opt.params[key] = param.toString();

						// If this is a $select field and Id isn't specified, we'll need to add it for caching
						if (key === '$select' && param.indexOf('Id') < 0) {
							opt.params.$select += ',Id';
						}

					});

					_batchStore.push({
						'READ'    : _config.baseURL + opt.source + '?' + _.map(opt.params, function (param, key) {
							return key + '=' + encodeURI(param);
						}).join('&'),
						'callback': resolve
					});

					_batchTimer = setTimeout(function () {

						_self.batch(_batchStore);

						_batchStore = [];

					}, _config.batchReadWait);

					return httpDefer.promise;

					function resolve(response) {

						var increment = 0,

							data = response.d.results || response.d;

						if (data.length) {

							var json = _.filter(Object.keys(data[0]), function (test) {

								return (test.indexOf(CONST.FIELD_JSON_TRAIL) > -1);

							});

							data = _.reduce(data, function (o, row) {

								o[row.Id || increment++] = json.length ? decoder(row) : row;
								return o;

							}, {});


							function decoder(row) {

								_.each(json, function (field) {

									row[field] = JSON.parse(row[field]);

								});

								return row;
							}

						}

						httpDefer.resolve(data);

					}

				};

				/**
				 * getCache custom cache resolver/awesomeness generator
				 * This will attempt to read indexeddb for any previously cached data and merge
				 * updates with the cache.  An optional prefetch can also be specified for a two-stage
				 * cache system (less load on the SP server).
				 *
				 * YOU MUST HAVE A SP FIELD NUMBER FIELD NAMED "Timestamp" FOR THIS TO WORK
				 *
				 * The Modified field WOULD have been perfect if SP oData requests filtered times properly :-/
				 *
				 * @param callback
				 */
				getCache = function () {

					// Load the cached data, if it doesn't actually exist we'll deal with it later on
					var runner = function () {

						// Create a cache key based on the model
						var cacheString = _utils.cacheString(options),

							prefetchData = SP_PREFETCH && SP_PREFETCH[cacheString] || {json: {}, time: 0},

							combineCache = function (data) {

								// Merge our cache with the prefetch
								_.each(data.json, function (row, key) {
									prefetchData.json[key] = row;
								});

								return deferred.resolve(prefetchData.json);

							};

						_cache
							.get(cacheString)
							.then(
							function (cachedData) {

								// Lazy man's deep object clone

								var opts = JSON.parse(JSON.stringify(options)),

									oldStamp;

								// Save a copy of the old timestamp
								oldStamp = Math.max(cachedData.time, prefetchData.time);

								// Offline enabled and the item exists, just return it without checking SP
								if (_config.offline && oldStamp) {

									return deferred.resolve(combineCache(cachedData));

								}

								// If we already have cached data we need to add the timestamp to the filter
								if (oldStamp) {

									// This is a messy comparison to see if we're under the debounce threshold
									if (_debounce[cacheString] &&

									    _utils.getTimeStamp() -
									    _debounce[cacheString] <
									    (options.debounce || 15)

									) {

										return deferred.resolve(combineCache(cachedData));

									}

									// Start the filter with the timestamp--just in case SP is being dumb (optimization)
									opts.params.$filter = '(Timestamp gt ' + oldStamp + ')' +

									                      (opts.params.$filter ?
									                      ' and ' + opts.params.$filter : '');

								}

								if (opts.params.$select) {

									opts.params.$select.push('Timestamp');

								}

								// Add the last cachedData.time variable to our _debounce array
								_debounce[cacheString] = _utils.getTimeStamp();

								// Call getData() with the custom opts or options as applicable
								getData(opts)

									.then(function (data) {

										      // There was some data so we can add that to our cache and update everything
										      if (!_.isEmpty(data)) {

											      cachedData.time = _.max(data, 'Timestamp').Timestamp;

											      // Merge our updates with the cache
											      _.each(data, function (row, key) {
												      cachedData.json[key] = row;
											      });

											      // Fire & forget--just add this and keep going
											      _cache.put(cacheString, cachedData);

											      if (oldStamp) {

												      // Add an updated=true property to our response
												      _.each(function (row, key) {
													      cachedData.json[key].updated = true;
												      });

											      }

										      }

										      // All done, do the callback
										      return deferred.resolve(combineCache(cachedData));

									      });

							});

					};

					// Que up the requests if the _cache DB isn't loaded yet
					_cache.push ? _cache.push(runner) : runner();

				};

				// If caching is disabled for the service, then override the request
				if (_config.noCache) {
					options.cache = false;
				}

				options.cache ? getCache(options) : getData(options).then(deferred.resolve);

				return deferred.promise;

			}

		};

	return _self;

}
;
//# sourceMappingURL=out.js.map

}(window, window.angular));
