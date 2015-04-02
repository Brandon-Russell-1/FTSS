/*global FTSS, angular */

(function () {

	"use strict";

	FTSS.ng.directive(
		'flickr',

		[
			'$http',

			function ($http) {

				return {
					'restrict': 'A',
					'scope'   : {},
					'link'    : function ($scope) {

						var _now = moment(),

						    _refresh,

						    _flip = 0,

						    _parent = $('html');

						if (localStorage.FTSS_Slides_Content &&
						    _now.diff(moment(localStorage.FTSS_Slides_Time), 'days') < 6) {

							loadFlickr(JSON.parse(localStorage.FTSS_Slides_Content));

						} else {

							$http({

								      'method'          : 'jsonp',
								      'url'             : 'https://api.flickr.com/services/feeds/photos_public.gne?id=39513508@N06&format=json&jsoncallback=JSON_CALLBACK',
								      'ignoreLoadingBar': true

							      })

								.success(function (resp) {

									         localStorage.FTSS_Slides_Time = _now.toISOString();
									         localStorage.FTSS_Slides_Content = JSON.stringify(resp.items);

									         loadFlickr(resp.items);

								         });

						}

						function loadFlickr(items) {

							var text = $('#bgText');

							_refresh = function () {

								if (!$scope.$$destroyed) {

									var item = _.shuffle(items).pop();

									_flip ^= 1;

									$(_flip ? '#bg2' : '#bg1').unbind()

										.load(function () {

											      if (this.height < this.width) {

												      if (_flip) {
													      _parent.addClass('flip');
												      } else {
													      _parent.removeClass('flip');
												      }

												      text.html(
													      '<b>' + item.title + '</b>: ' +
													      $(item.description.replace(/src=/g, 'fake=')).text()
												      );
											      }

											      setTimeout(_refresh, 7000);

										      })

										.attr('src', item.media.m.replace('_m.', '_c_d.'));

								}

							};

							_refresh();

						}
					}
				}
			}
		]);

}());