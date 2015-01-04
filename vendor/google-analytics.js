/**
 * Google analytics
 */
(function () {

	"use strict";

	// Ideally, we would just watch PRODUCTION, but there seemed to be some issues with GA firing properly that way...
	if (location.pathname === '/app.html') {

		(function (i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function () {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o),
				m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

		ga('create', 'UA-37620839-9', 'af.mil');
		ga('send', 'pageview');

	}

}());
