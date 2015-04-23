/*global FTSS */

'use strict';

window.addEventListener('dragover', function (e) { e.preventDefault() }, false);

window.addEventListener('drop', function (e) { e.preventDefault() }, false);

document.addEventListener('past', function (e) {
	if (FTSS.pasteAction) {

		e.stopImmediatePropagation();
		e.preventDefault();
		FTSS.pasteAction((window.clipboardData || e.originalEvent.clipboardData).getData('Text'));

	}
});

(function ($) {
	$.event.special.destroyed = {
		remove: function (el) {
			el.handler && el.handler(this);
		}
	};
})(jQuery);