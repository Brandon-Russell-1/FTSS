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
					'link'    : function ($scope, $el) {

						var classes = $el[0].className;

						$scope.$watch('bioPhoto', function () {

							if ($scope.bioPhoto) {

								$el[0].className = classes + ' mask-img';

								cachedImages[$scope.bioPhoto] ? loadImage() : readCache();

							} else {

								$el[0].className = classes + ' invalid';

								$el[0].innerHTML = '';

							}

						});

						function processImage(blob) {

							cachedImages[$scope.bioPhoto] = 'data:image/jpeg;base64,' + _arrayBufferToBase64(blob);

							loadImage();

						}

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

						function readCache() {

							// Retrieve the file from the browser db
							db.transaction('images').objectStore('images')
								.get($scope.bioPhoto).onsuccess = function (event) {

								event.target.result ? processImage(event.target.result) : getImageFromWeb();

							};

						}

						function loadImage() {
							$el[0].innerHTML = '<img src="' + cachedImages[$scope.bioPhoto] + '" />';
						}

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
		]);


}());
