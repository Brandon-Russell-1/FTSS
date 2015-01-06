/**
 * Setup our globals...
 */
(function () {

	"use strict";

	document.cookie = 'DodNoticeConsent=1';

	window.FTSS = {};
	window.utils = {};
	window.caches = {};
	window.PRODUCTION = (location.pathname.indexOf('/app.html') > -1);

	window.brunch = {
		'auto-reload': {
			'disabled': window.PRODUCTION
		}
	};

	if (Function('/*@cc_on return document.documentMode===10@*/')()) {
		document.documentElement.className += ' ie10';
	}

}());
