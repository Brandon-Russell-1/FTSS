/*global FTSS, angular */

/**
 * This small directive fetches program update messages and formats them in a human-friendly view
 */
(function () {

	"use strict";

	FTSS.ng.directive(
		'ftssUpdates',

		[
			'SharePoint',

			function (SharePoint) {

				return {
					'restrict': 'E',
					'replace' : true,
					'scope'   : true,
					'link'    : function ($scope, el) {

						SharePoint.read(FTSS.models('updates')).then(function (updates) {

							var html = '',

								// Map SP column names to our category titles
								map = {
									'Feat': 'Improvements',
									'Fix' : 'Fixed',
									'Misc': 'Other Notes'
								};

							// Iterate over each update set
							_(updates).sortBy('Timestamp').reverse().each(function (update) {

								// Create the update header/wrapper div
								html += '<h4 class="border-bottom">Program Updates<span class="pull-right">(' +
								        update.Date + ')</span></h4><div class="dl dl-horizontal">';

								// Check for each column and add if it exists (mapping double line breaks to li elements)
								_.each(map, function(Title, Index) {

									html += update[Index] ? '<dt>' + Title + '</dt><dd><ul><li>' +
									                        update[Index].split('\r\n\r\n').join('</li><li>') +
									                      '</li></ul></dd>' : '';

								});

								html += '</div>';

							}).value();

							// Update our html element
							el.html(html);

						});


					}

				}

			}

		]
	)

}());