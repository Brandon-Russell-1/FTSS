/*global FTSS, PRODUCTION, utils */

/**
 * Photo directive
 *
 * Generates the bio photo for a given instructor
 */
(function () {

	"use strict";

	var request = window.indexedDB.open('FTSS-Media', 1), db, cachedImages = {};

	request.onupgradeneeded = function (event) {

		event.target.result.createObjectStore('images');

	};

	// Once the DB is loaded, try to run any cached callbacks and setup the cacheDB reference
	request.onsuccess = function (event) {

		db = event.target.result;

	};

	FTSS.ng.directive(
		'bioPhoto',

		[
			'$http',
			function ($http) {

				return {
					'restrict': 'A',
					'scope'   : {
						'bioPhoto': '='
					},
					'compile' : function compile(tElement) {

						// Save a copy of the original classes
						var classes = tElement[0].className;

						// Add hide to this until the img is load (to avoid the ugly empty shadow)
						tElement[0].className = classes + ' hide';

						return {

							// Run our pre-linker
							pre: function preLink($scope, $el) {

								// We need to watch bioPhoto to make sure we get the right item
								$scope.$watch('bioPhoto', function () {

									if ($scope.bioPhoto) {

										// If there is a valid photo url, try to load it
										cachedImages[$scope.bioPhoto] ? loadImage() : readCache();

									} else {

										// Otherwise, empty the html and hide it
										$el[0].className = 'hide';

										$el[0].innerHTML = '';

									}

								});

								/**
								 * Process image data from the cache for rendering in the UI
								 *
								 * @param blob the cached data from indexeddb
								 */
								function processImage(blob) {

									cachedImages[$scope.bioPhoto] =
										'data:image/jpeg;base64,' + _arrayBufferToBase64(blob);

									loadImage();

								}

								/**
								 * Fetch the image data from our SharePoint list and store in the cache
								 */
								function getImageFromWeb() {

									$http({

										'url'             : FTSS.photoURL + '_w/' + $scope.bioPhoto + '_jpg.jpg',
										'method'          : 'GET',
										'responseType'    : 'arraybuffer',
										'ignoreLoadingBar': true

									}).success(function (blob) {

										processImage(blob);

										db.transaction('images', 'readwrite').objectStore('images').put(blob, $scope.bioPhoto);

									});

								}

								/**
								 * Try to find the data in IndexedDB
								 */
								function readCache() {

									// Retrieve the file from the browser db
									db.transaction('images').objectStore('images')
										.get($scope.bioPhoto).onsuccess = function (event) {

										event.target.result ? processImage(event.target.result) : getImageFromWeb();

									};

								}

								/**
								 * Load the image data for the UI and make visible
								 */
								function loadImage() {
									$el[0].innerHTML = '<img src="' + cachedImages[$scope.bioPhoto] + '" />';
									$el[0].className = classes + ' mask-img';
								}

								/**
								 * Convert a blob to a Base64 string
								 *
								 * @param buffer
								 * @returns {string}
								 * @private
								 */
								function _arrayBufferToBase64(buffer) {
									var binary = '';
									var bytes = new Uint8Array(buffer);
									var len = bytes.byteLength;
									for (var i = 0; i < len; i++) {
										binary += String.fromCharCode(bytes[i]);
									}
									return window.btoa(binary);
								}

							}

						};

					}

				};

			}
		]);


}());
