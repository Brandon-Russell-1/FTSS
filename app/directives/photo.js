/*global FTSS, PRODUCTION, utils */

/**
 * Photo directive
 *
 * Generates the bio photo for a given instructor
 */
(function () {

	"use strict";

	var request = window.indexedDB.open('FTSS-Media', 1),

	    db,

	    noPhoto = 'data:image/jpeg;base64,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';

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

							     url         : photo,
							     method      : 'GET',
							     responseType: 'arraybuffer'

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

						    force = $attrs.hasOwnProperty('force'),

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

								    } else {
									    force && $el.find('img').attr('src', noPhoto);
								    }

							    }

						    };

						$el.prev().data('update', linker);

						if ($attrs.hasOwnProperty('watch')) {
							$scope.$watch($attrs.data, linker);
							$scope.$watch($attrs.data + '.Photo', linker);
						} else {
							linker();
							utils.ignore($scope);
						}

					}
				};

			}
		]);


}());
