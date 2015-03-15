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

	$(document).keyup(function (e) {

		if (e.keyCode === 27) {
			$('.popover').remove();
		}

	});

	var body, popover, pasteAction;

	body = $('body');

	if (!FTSS.prefs.animate) {
		$('html').attr('id', 'noAnimate');
	}

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

	popover = {

		/**
		 * Internal data parser that converts [icon=someicon] into the SVG icon form FTSS.icons:
		 *
		 * [icon=info] => <div class="icon icon-info"><svg>...</svg></div>
		 *
		 * @param content
		 * @returns string
		 */
		'icon': function (content) {

			return content

				.replace(/\[icon\=([a-z\-\_]+)\]/g,

			             function (match, icon) {
				             return '<svg class="icon icon-' +
				                    icon +
				                    '"><use xlink:href="#icon-' +
				                    icon +
				                    '"/></use></svg>';
			             });

		},

		/**
		 *
		 */
		'enter': function () {

			if (!FTSS.prefs.tooltips) {
				return;
			}

			var $el = $(this), title, content, placement;

			$('.popover').remove();

			content = $el.attr('content');

			if (content) {
				title = $el.attr('hover') || $el.attr('explain');
				title = FTSS.messages[title] || title;
			} else {
				content = $el.attr('hover') || $el.attr('explain');
				content = FTSS.messages[content] || content;
			}

			if (content) {

				content = popover.icon(content);

				placement = $el.attr('placement') ||
				            $el[0].hasAttribute('left') && 'left' ||
				            $el[0].hasAttribute('right') && 'right' ||
				            $el[0].hasAttribute('top') && 'top' ||
				            $el[0].hasAttribute('botom') && 'botom' ||
				            'auto';

				$el.popover({
					            'trigger'  : 'manual',
					            'html'     : true,
					            'title'    : title,
					            'content'  : content,
					            'placement': placement,
					            'container': 'body'
				            });

				// Bind to element removal (fixes a long-standing bug that causes orphaned popovers)
				$el.bind('destroyed', function () {
					$el.popover('destroy');
				});

				$el.popover('show');

				$el[0].hasAttribute('no-arrow') && $el.data('bs.popover').$tip.addClass('no-arrow');

				$el[0].hasAttribute('hoverClass') && $el.data('bs.popover').$tip.addClass($el.attr('hoverClass'));

			}

		},

		/**
		 *
		 */
		'exit': function () {

			popover.clear($(this));

		},

		/**
		 *
		 * @param self
		 * @param tip
		 */
		'clear': function (self) {

			self.popover((self[0].hasAttribute('live')) ? 'destroy' : 'hide');

		}
	};

	// Use jQuery on() to bind to future elements
	$(document)

		.on('click', '.slideToggleEffect *', function (evt) {
			    evt.stopImmediatePropagation();
			    $(this).parents('.slideToggleEffect').toggleClass('slideOut');
		    })

		.on('mouseenter', '[hover]', popover.enter)

		.on('focusin', '[explain],[explain] *', popover.enter)

		.on('mouseleave', '[hover]', popover.exit)

		.on('focusout', '[explain],[explain] *', popover.exit)

		.on('paste', '*', pasteAction);

}());