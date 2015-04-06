(function () {

	"use strict";

	FTSS.ng.directive(
		'urlShortner',

		[
			'$location',
			'$rootScope',
			'$http',

			function ($location, $rootScope, $http) {

				return {

					'link': function ($scope, $el) {

						$el.on('click', function () {

							var page = encodeURIComponent('https://cs1.eis.af.mil/sites/FTSS#' + $location.path());

							// Check for a local cache first
							$rootScope.shortURL = localStorage['FTSS_URL_Shortner_' + page];

							// If cached, exit now
							if ($rootScope.shortURL) {return;}

							// Send our JSONP request to go.usa.gov using the FTSS apiKey
							$http(
								{

									'method': 'jsonp',

									'url': [
										'https://go.usa.gov/api/shorten.jsonp',
										'?login=af-ftss',
										'&apiKey=76856686bb86523732e316b4fd0d867a',
										'&longUrl=',
										page,
										'&callback=JSON_CALLBACK'
									].join('')

								})

								.then(function (response) {

									      if (response.status === 200) {

										      // Convert/save our url
										      localStorage['FTSS_URL_Shortner_' + page] =
											      $rootScope.shortURL =
												      (response.data.response.data.entry[0].short_url ||
												       page).split('://')[1];

									      }

								      });

						});

					}
				}

			}
		])

}());