/*global FTSS, PRODUCTION, utils */

/**
 * Photo directive
 *
 * Generates the bio photo for a given instructor
 */
(function () {

	"use strict";

	var request = window.indexedDB.open('FTSS-Media', 1),

	    db;

	request.onupgradeneeded = function (event) {

		var db = event.target.result;

		// Create an objectStore
		db.createObjectStore('images');

	};

	// Once the DB is loaded, try to run any cached callbacks and setup the cacheDB reference
	request.onsuccess = function (event) {

		db = event.target.result;

	};


	FTSS.ng.run(
		['$http',
		 function ($http) {

			 var cachedImages = {};

			 utils.fetchPhoto = function (url, callback) {

				 if (cachedImages[url]) {
					 callback(cachedImages[url]);
					 return;
				 }

				 var photo = FTSS.photoURL + '_w/' + url + '_jpg.jpg',

				     setImage = function (blob) {

					     if (blob) {

						     // Create and revoke ObjectURL
						     var imgURL = 'data:image/jpeg;base64,' +
						                  utils._arrayBufferToBase64(blob);

						     cachedImages[url] = imgURL;
						     callback(imgURL);

					     } else {
						     getImageFromWeb();
					     }

				     },

				     getImageFromWeb = function () {

					     $http(
						     {

							     'url'             : photo,
							     'method'          : 'GET',
							     'responseType'    : 'arraybuffer',
							     'ignoreLoadingBar': true

						     })

						     .success(function (blob) {

							              setImage(blob);

							              db.transaction('images', 'readwrite')
								              .objectStore('images')
								              .put(blob, url);

						              });

				     };

				 // Retrieve the file that was just stored
				 db.transaction('images')
					 .objectStore('images')
					 .get(url)
					 .onsuccess = function (event) {

					 if (event.target.result) {
						 setImage(event.target.result);
					 } else {
						 getImageFromWeb();
					 }

				 };

			 };

		 }
		]);

	FTSS.ng.directive(
		'photo',

		[
			function () {

				return {
					'restrict': 'E',
					'replace' : true,
					'link'    : function ($scope, $el, $attrs) {

						var lastPhoto = false,
						    
						    shape = $attrs.shape || 'circle',

						    linker = function () {

							    var data = utils.deepRead($scope, $attrs.data) || {};

							    data = isNaN(data) ? data : caches.Instructors[data] || data;

							    if (lastPhoto !== data.Photo) {

								    lastPhoto = data.Photo;

								    $el[0].innerHTML = [
									    '<div class="mask-img',
									    shape,
									    (data.Photo ? 'valid' : 'invalid'),
									    '"><img /></div>'
								    ].join(' ');

								    if (data.Photo) {

									    utils.fetchPhoto(data.Photo, function (imgURL) {
										    $el.find('img').attr('src', imgURL);
									    });

								    }

							    }

						    };

						$el.prev().data('update', linker);

						if ($attrs.hasOwnProperty('watch')) {
							$scope.$watch($attrs.data, linker);
							$scope.$watch($attrs.data + '.Photo', linker);
						} else {
							linker();
						}

					}
				};

			}
		]);


}());
