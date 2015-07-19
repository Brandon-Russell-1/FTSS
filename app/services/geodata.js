FTSS.ng.service('geodata', [

		'utilities',
		'appAssets',

		function (utilities, appAssets) {

			"use strict";

			var _self = this;

			// Stub out our deferred values
			_self.index = {};
			_self.map = angular.noop;

			// Load the data from SharePoint
			appAssets.process(function (data) {

				/**
				 * @name geodata#index
				 * @type Object
				 */
				_self.index = data.geodata;

				/**
				 * name geodata#map
				 * @type {Array}
				 */
				_self.map = _.map(_self.index, function (row, key) {

					return {

						'Id'    : key,
						'label' : key,
						'coord' : row,
						'search': key

					}

				});

			});


			/**
			 * Calculate distance between two coordinates
			 *
			 * @name geodata#distanceCalc
			 * @param start
			 * @param end
			 * @returns {number}
			 */
			this.distanceCalc = function (start, end) {

				if (start && end) {

					start = _self.index[start] || JSON.parse('[' + start + ']');
					end = _self.index[end] || JSON.parse('[' + end + ']');

					var deg2rad = function (deg) {
						return deg * (Math.PI / 180);
					};

					var R = 3963.1676; // Radius of the earth in miles
					var dLat = deg2rad(end[0] - start[0]);  // deg2rad below
					var dLon = deg2rad(end[1] - start[1]);
					var a = Math.sin(dLat / 2) *
					        Math.sin(dLat / 2) +
					        Math.cos(deg2rad(start[0])) *
					        Math.cos(deg2rad(end[0])) *
					        Math.sin(dLon / 2) *
					        Math.sin(dLon / 2);
					var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

					return Math.ceil(R * c); // Distance in miles

				}
			};

			/**
			 * @name geodata#distances
			 * @param row
			 * @param start
			 * @param end
			 */
			this.distances = function (row, start, end) {

				// attempt Cartesian calculation for a distance estimate (except local)
				var d = (start === end) ? 1 : _self.distanceCalc(start, end);

				// Need this as a number for sorting
				row.distanceInt = parseInt(d, 10);

				// we can't just use toLocale() thanks to our favorite browser (IE)...grrrr
				row.distance = row.distanceInt ? (row.distanceInt < 50 ? 'local' : utilities.prettyNumber(d) + ' miles') : '';

			}


		}

	]
);