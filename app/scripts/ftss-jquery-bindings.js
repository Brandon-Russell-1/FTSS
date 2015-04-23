/*global FTSS, _ */

/**
 * jQuery .on() bindings
 */
(function () {

	'use strict';

	/**
	 * prevent dragover & drop from exiting the application if a user misses the drop target
	 */
	window.addEventListener("dragover", function (e) {
		e = e || event;
		e.preventDefault();
	}, false);

	window.addEventListener("drop", function (e) {
		e = e || event;
		e.preventDefault();
	}, false);

	(function ($) {
		$.event.special.destroyed = {
			remove: function (el) {
				el.handler && el.handler(this);
			}
		};
	})(jQuery);

	var pasteAction, popoverService;

	FTSS.ng.run([
		'$popover',

		function ($popover) {

			popoverService = $popover;

		}
	]);

	/**
	 * Intercepts paste events and handles if we have a paste handler set (FTSS.pasteAction)
	 *
	 * @param e jQuery event
	 */
	pasteAction = function (e) {

		if (FTSS.pasteAction) {

			e.stopImmediatePropagation();
			e.preventDefault();
			FTSS.pasteAction((window.clipboardData || e.originalEvent.clipboardData).getData('Text'));

		}

	};

	// Use jQuery on() to bind to future elements
	$(document)

		.on('click', '.slideToggleEffect *', function (evt) {
			    evt.stopImmediatePropagation();
			    $(this).parents('.slideToggleEffect').toggleClass('slideOut');
		    })

		.on('paste', '*', pasteAction);

}());