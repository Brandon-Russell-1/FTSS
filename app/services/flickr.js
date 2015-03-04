FTSS.ng.service('flickr', [

	'$http',

	function ($http) {

		var _now = moment(),

		    _refresh,

		    _abort;

		this.init = function () {

			_abort = false;

			if (localStorage.FTSS_Slides &&
			    _now.diff(moment(localStorage.FTSS_Slides), 'days') < 6) {

				loadFlickr(JSON.parse(localStorage.FTSS_Slides_JSON));

			} else {

				$http({

					      'method'          : 'jsonp',
					      'url'             : 'https://api.flickr.com/services/feeds/photos_public.gne?id=39513508@N06&format=json&jsoncallback=?',
					      'ignoreLoadingBar': true

				      })

					.then(function (resp) {

						      localStorage.FTSS_Slides = _now.toISOString();
						      localStorage.FTSS_Slides_JSON = JSON.stringify(resp);

						      loadFlickr(resp);

					      });

			}

		};

		this.destroy = function () {
			_abort = true;
		};

		function loadFlickr(resp) {

			var secondsInterval = 12,

			    timer,

			    flip = false,

			    shuffle = function () {

				    var index = Math.floor(Math.random() * resp.items.length),

				        item = resp.items[index];

				    return item ? [
					    index,
					    item.media.m.replace('_m.', '_c_d.'),
					    item
				    ] : shuffle();

			    },

			    parent = $('html'),

			    text = $('#bgText');

			_refresh = function () {

				clearTimeout(timer);

				if (!_abort) {

					var item = shuffle();

					flip = !flip;

					$(flip ? '#bg2' : '#bg1').unbind().load(function () {

						if (this.height < this.width) {

							if (flip) {
								parent.addClass('flip');
							} else {
								parent.removeClass('flip');
							}

							text.html(
								'<b>' + item[2].title + '</b>: ' +
								$(item[2].description.replace(/src=/g, 'fake='))
									.toArray()
									.pop()
									.innerText
							);

							timer = setTimeout(_refresh, secondsInterval * 1000);

						} else {

							resp.items[item[0]] = false;
							flip = !flip;
							_refresh();

						}

					})

						.attr('src', item[1]);

				}

			};

			_refresh();

		}

	}

]);