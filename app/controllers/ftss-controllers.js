/*global utils, FTSS, caches, _, Sifter, angular */

/**
 * FTSS.controller()
 *
 * Utility for page controllers to process SP REST data
 *
 * @param $scope
 * @param opts
 * @returns {{$scope: *, bind: 'bind', initialize: 'initialize', process: 'process', scheduledClass: 'scheduledClass', postProcess: 'postProcess'}}
 *
 * @todo need some more commenting/cleanup in FTSS.controller
 */
FTSS.controller = (function () {

	var tagBox, $modal, SharePoint, $timeout, $alert;

	// Grab some angular variables for use later on
	FTSS.ng.run(
		[
			'$modal',
			'SharePoint',
			'$timeout',
			'$alert',
			function (_modal, _SharePoint, _timeout, _alert) {
				$modal = _modal;
				SharePoint = _SharePoint;
				$timeout = _timeout;
				$alert = _alert;
			}
		]);

	return function ($scope, opts) {

		var model, process, actions;

		actions = {

			// Enable access to $scope externally
			'$scope': $scope,

			/**
			 * Creates a $scope.$watcher to perform actions on change.  This function will call sharePoint.read() and pass
			 * the returned data to a promise, then().
			 *
			 * @param String prop the $scope property to watch, "loaded" will be a bind-once watcher, "filter" will stay
			 * bound and add the filter to model.params.$filter before passing the promise.
			 *
			 * @returns {{then: 'then'}}
			 */
			'bind': function (prop) {

				// If loaded we only want to bind the first time

				var single = !prop,

				    page = $scope.fn.getPage();

				// Default to cached mode & watch cleanSlate
				prop = prop || 'cleanSlate';

				// The tagBox controls whether the search or tagBox are shown
				$scope.$parent.tagBox = tagBox = !single;

				// Copy the model to a local variable for reuse without affecting the original model
				model = angular.copy(FTSS.models[opts.model]);

				// Bind archive() & edit() to the scope in case they are needed
				$scope.archive = actions.archive;
				$scope.edit = actions.edit(opts.edit);

				$scope.showHelp = FTSS.prefs.page && (localStorage['FTSS_show_help_' + page] !== '');

				$scope.hideHelp = function () {
					$scope.showHelp = localStorage['FTSS_show_help_' + page] = '';
				};

				// Return the promise, then()
				return {
					'then': function (callback) {

						$scope.fn.doInitPage();

						// Create a $scope.$watch and unwatch = to the return value for unbinding
						var unwatch = $scope.$watch(prop, function (watch) {

							// Only act if there is a valid change to our watch
							if (watch) {

								var last;

								actions.reload = function () {

									var finalize = function (data) {

										if (JSON.stringify(data) !== last) {

											last = JSON.stringify(data);
											callback && callback(data);

										}

									};

									if (!opts.static) {

										var filters = [];

										opts.filter && filters.push(opts.filter);

										(prop === 'filter') && filters.push(watch);

										model.params.$filter = filters.join(' and ');

										SharePoint

											.read(model)

											.then(finalize);

									} else {

										finalize();

									}

								};

								actions.reload();

								// If this is a bind-once and has been called, delete the watch
								single && unwatch();

								(opts.refresh > 1) && window.setInterval(actions.reload, opts.refresh * 1000);

							}

						});

					}
				};

			},

			/**
			 * Initializes the received data and calls any extra init functions from the controller
			 *
			 * @param data
			 * @returns {{then: 'then'}}
			 */
			'initialize': function (data) {

				// Pass the response to actions.data for access externally
				actions.data = data;

				/**
				 * Updates the page count/overload class and passes user messages for no data
				 *
				 * @param count
				 * @param overload
				 */
				$scope.counter = function (count, overload) {

					$scope.$parent.count = count;
					$scope.$parent.overload = overload;

				};

				// If there was no data found pass the User Empty Message and abort the operation
				if (_.keys(data || {}).length < 1) {

					// We must still pass a then() promise to prevent an error, we're just not executing the callback
					return {
						'then': function () {

							$scope.fn.setLoaded();

						}
					};

				} else {

					return {
						/**
						 * The success promise that takes a processCallback to pre-process received data.
						 * The pre-processor is stored internally and used by action.process().
						 *
						 * @param processCallback
						 */
						'then': function (processCallback) {

							// Add our pre-processor (optional), if undefined it just won't be called by actions.process.
							process = processCallback;

							// Call the internal pre-processor
							actions.process(data);

						}
					};

				}
			},

			/**
			 *
			 * @param data
			 */
			'process': function (data) {

				// Use data if valid, otherwise actions.data our cached dataset
				data = data || actions.data;

				// If there is a defined data processor, then execute it against the data as well
				process && _(data).each(process);

				// If this is a tagBox then we should call taghighlight as well
				if (tagBox) {
					utils.tagHighlight(data);
				}

				// Finally, send our data off to the post-processor
				actions.postProcess(data);

			},

			/**
			 * Controller Post-Processor
			 * Here we setup sifter() for full-text searching
			 *
			 * @param data
			 */
			'postProcess': function (data) {

				$timeout(function () {

					var doProcess = function (oldVal, newVal) {

						// Only post-process if we actually have data to work with
						if (data && oldVal !== newVal) {

							var sifter, results, watcher, exec;

							// Initialize sifter with the array of data after passing through some string sanitization
							sifter = new Sifter(
								_(data)

									// Wrap our dataset in an array with a search property (just a flattened version of the data)
									.map(function (d) {

										     // Use our search prop if it already exists
										     d.search = d.search ||
										                JSON.stringify(d)
											                .replace(/([,{]"\w+":)|([{}"])/gi, ' ')
											                .toLowerCase();

										     return {
											     /* We're using JSON stringify to fast deep-read our data & then stripping out the JSON junk
											      * with a regex & then setting lowercase for faster text-processing
											      */
											     'search': d.search,

											     // Also, send the data to sifter for use later on
											     'data'  : d
										     };

									     })

									// Perform filtering for Archived so we can shrink our processing load down
									.filter(function (test) {

										        // Add if this object does not have an Archived property or if showArchive is enabled
										        return !test.data.Archived || !!$scope.showArchive;

									        })

									.value()
							);

							// This will let us debounce our searches to speed up responsiveness
							watcher = _.debounce(function (newVal, oldVal) {

								// Make sure the array of watchers are really different before running exec
								!_.isEqual(newVal, oldVal) && $timeout(exec);

							}, 300);

							// The main limiting, filtering, grouping, sorting function our views
							exec = function () {

								if ($scope.abort) {
									return false;
								}

								// reference for our searchText
								var text = $scope.searchText.$ || '';

								_verify && _verify(text);

								// Update our permalink for this custom view
								$scope.fn.setPermaLink();

								// Reset groups, counter & count
								$scope.groups = false;
								$scope.counter('-', false);
								$scope.count = 0;

								// Perform the sifter search using the pageLimit, for no search, all results up to the pageLimit are returned
								results = sifter.search(text, {
									'fields'     : [
										'search'
									],
									'limit'      : $scope.pageLimit,
									'conjunction': 'and'
								});

								// Create our sorted groups and put in our scope
								$scope.groups = _(results.items)

									// we just need the data back into our $scope
									.map(function (match) {
										     return sifter.items[match.id].data;
									     })

									// Run sortBy first on our mapped data
									.sortBy(function (srt) {
										        return utils.deepRead(srt, opts.sort || false);
									        })

									// Group the data by the given property
									.groupBy(function (gp) {
										         $scope.count++;
										         return opts.group ?
										                utils.deepRead(gp, opts.group) ||
										                '' : false;
									         })

									.value();

								opts.finalProcess && opts.finalProcess($scope.groups);

								// Update the scope counter + overload indicator
								$scope.counter($scope.count, $scope.count !== results.total);

								// Finally, do our tagHighlighting if this is a tagBox
								tagBox && utils.tagHighlight(data);

								// Perform final loading
								$scope.fn.setLoaded(function () {

									// De-register the watcher if it exists
									(FTSS.searchWatch || Function)();

									// Create a watcher that monitors our searchText for changes
									FTSS.searchWatch = $scope.$watch('searchText.$', watcher);

									// De-register the watcher if it exists
									(FTSS.archiveWatch || Function)();
									FTSS.archiveWatch = $scope.$watch('showArchive', doProcess);

								});

							};

							exec();

						}

					};

					doProcess(true);

				});

			},

			/**
			 * Modal Add/Edit Callback
			 * The main add/edit dialog for then entire app--this one is kinda important.  First, generate a new isolated
			 * scope then copy the row data to scope.data & launch the angular-strap modal dialog, also bind some close
			 * & update actions and fire an optional post-processor to do more fancy stuff with the data from the
			 * parent controller
			 *
			 * @param callback Function acts as a data post-processor for the calling controller to manipulate modal data
			 * @returns {Function}
			 */
			'edit': function (callback) {

				// the isNew boolean determines if this is a create or update action
				return function (isNew, data) {

					var scope, instance;

					// Create a new isolated scope for this modal
					scope = $scope.$new(true);

					// We handle add vs edit within the modal templates for simplicity
					scope.createData = isNew || false;

					// Create the angular-strap modal using this model's modal template
					instance = $modal({
						                  'placement'      : opts.modalPlacement || 'top',
						                  'scope'          : scope,
						                  'backdrop'       : 'static',
						                  'contentTemplate': '/partials/modal-' + (opts.modal || opts.model) + '.html'
					                  });

					// Bind close to instance.destroy to remove this modal
					scope.close = instance.destroy;

					// Allow archiving within an edit modal
					scope.archive = actions.archive;

					// Bind the submit action with a destroy callback
					if (opts.submit) {

						scope.submit = function () {

							opts.submit(scope);

						};

					} else {

						scope.submit = actions.update(scope, scope.close, isNew);

					}

					// Pass action.update to the scope for our traverse directive
					scope.update = actions.update;

					// Copy the row data to our isolated scope
					scope.data = isNew ? {} : angular.copy(this.row);

					// If the callback (our post-processor exists, call it too)
					callback && callback(scope, isNew, data);

				};

			},

			/**
			 * Row archive function
			 *
			 * This is FTSS's version of a record deletion; the record Archived attribute is flipped with this function
			 * to mark as archived/deleted
			 */
			'archive': function () {

				// Allow handling modal archives
				var close = this.close || false,

				    data = this.row || this.data;

				// Double check that this model can actually perform this action
				if (data && data.hasOwnProperty('Archived')) {

					var send = {
						'Archived'  : !data.Archived,
						'__metadata': data.__metadata,
						'cache'     : true
					};

					// Call sharePoint.update() with our data and handle the success/failure response
					SharePoint.update(send).then(function (resp) {

						// HTTP 204 is the status given for a successful update, there will be no body
						if (resp.status === 204) {

							// If this is a modal, lets close it too
							close && close();

							utils.alert.update();

							// Update the etag so we can rewrite this data again during the session if we want
							data.__metadata.etag = resp.headers('etag');

							data.Archived = !data.Archived;

							// Copy the updated back to the original dataset
							actions.data[data.Id] = angular.copy(data);

							// Call actions.process() to reprocess the data by our controllers
							actions.process();

						}

					}, utils.alert.error);

				}

			},

			'_postCRUD': function (data, callback, noProcess) {

				// Mark the data as updated for the <updated> directive
				data.updated = true;

				// Copy the updated back to the original dataset
				actions.data[data.Id] = angular.copy(data);

				// If there is a callback, then fire it
				callback && callback(data);

				// Call actions.process() to reprocess the data by our controllers
				!noProcess && $timeout(actions.process);

			},

			'_create': function (send, callback, noProcess) {

				SharePoint.create(send).then(function (resp) {

					if (resp.status === 201) {

						// Notify user of success
						utils.alert.create();

						// Perform final CRUD operations
						actions._postCRUD(resp.data.d || resp.data, callback, noProcess);

					}

				}, utils.alert.error);

			},

			'_update': function (scope, send, callback, noProcess) {

				var data = scope.data || scope;

				// Call sharePoint.update() with our data and handle the success/failure response
				SharePoint.update(send).then(function (resp) {

					scope.submitted = false;

					// HTTP 204 is the status given for a successful update, there will be no body
					if (resp.status === 204) {

						// Notify user of success
						utils.alert.update();

						// Update the etag so we can rewrite this data again during the session if we want
						data.__metadata.etag = resp.headers('etag');

						// Perform final CRUD operations
						actions._postCRUD(data, callback, noProcess);

					} else {

						utils.alert.error('unknown update failure');

					}

				}, utils.alert.error);


			},

			'inlineUpdate': function (field, callback) {

				var scope = this.row || this.data,

				    send = {
					    'cache'     : true,
					    '__metadata': scope.__metadata
				    };

				send[field] = scope[field];

				actions._update(scope, send, callback, true);

			},

			/**
			 * Performs our update to the SP model.  Sends only changes to the server for efficiency and handles update response
			 *
			 * @param scope
			 * @returns {Function}
			 */
			'update': function (scope, callback, isNew) {

				callback = callback || function () {};

				return function (eventData) {

					var old, fields, send = {}, complete;

					if (scope.modal.$dirty) {

						// Used by modal.footer.html to disable the submit button
						scope.submitted = true;

						// Keep a copy of the original data for comparison
						old = actions.data[scope.data.Id] || {};

						// angular.copy() so we don't overwrite the original model
						fields = angular.copy(model.params.$select);

						//  Compare each field from the list of fields to the old data
						_(fields).each(function (field) {

							var data = scope.data[field];

							// First check for valid fields as the model includes expanded and temporary that can not be sent
							if (scope.data.hasOwnProperty(field) && (isNew || !_.isEqual(data, old[field]))) {

								send[field] = data;

							}

						});

					}

					// If nothing was updated then fire the callback with false
					if (_.isEmpty(send)) {

						scope.submitted = false;
						callback(eventData, false);

					} else {

						// Use the model's cache setting & __metadata
						send.cache = model.cache;
						send.__metadata = scope.data.__metadata || model.source;

						complete = function () {
							callback(eventData, true);
						};

						if (isNew) {

							actions._create(send, complete);

						} else {

							actions._update(scope, send, complete);

						}

					}

				};

			}


		};

		return actions;

	};

}());