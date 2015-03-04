/*global FTSS, _, moment, utils */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.controller(
		'supportController',
		[
			'$scope',
			'SharePoint',
			'$timeout',
			'notifier',
			'utilities',
			'security',
			function ($scope, SharePoint, $timeout, notifier, utilities, security) {

				var model = FTSS.models('support'),

				    page = $scope.PAGE,

				    update,

				    previous;

				$scope.$parent.$on('modal.hide', function () {

					update = function () {};
					$scope.$destroy();

				});

				model.params.$filter = "Page eq '" + page + "'";

				$scope.startReply = function (comment) {

					comment.reply = true;

				};

				$scope.addReply = function (comment) {

					$scope.supportLoaded = false;

					var send = {
						'__metadata': 'Support',
						'cache'     : true,
						'Page'      : page,
						'Staff'     : security.hasRole('admin'),
						'Comment'   : comment ? comment.writeReply : $scope.askQuestion
					};

					if (comment) {

						send.Thread = comment.Id;

						// Send the email notification to the user with the reply
						notifier.generic(
							{
								'to'     : comment.CreatedBy.WorkEMail,
								'subject': 'Help Page Reply',
								'body'   : $scope.user.name +
								         ' replied to your question or comment:\n\n' +
								         comment.writeReply
							}
						);

					} else {

						notifier.generic(
							{
								'to'     : FTSS.supportEmail,
								'subject': 'FTSS Support Question: ' + $scope.askQuestion.substring(0, 15) + '...',
								'body'   : $scope.user.name +
								         ' asked the following question on the ' +
								         page + ' page:\n\n' + $scope.askQuestion
							}
						);

					}

					send.Comment && SharePoint.create(send).then(update, utilities.alert.error);

					$scope.writeReply = '';
					$scope.askQuestion = '';

				};

				update = function (repeat) {

					SharePoint.read(model).then(function (data) {

						var size = _.size(data);

						if (size && size !== previous) {

							previous = size;

							$scope.comments = {};

							_(data)

								.sortBy('Created')

								.reverse()

								.each(function (d) {

									      // Get the time from now with the GMT offset of the CS1 servers (-6)
									      d.TimeAgo = moment(d.Created).add('h', 6).fromNow();

									      if (d.Thread < 1) {
										      d.replies = [];
										      $scope.comments[d.Id] = d;
									      }

								      })

								.each(function (d) {

									      (d.Thread > 0) && $scope.comments[d.Thread].replies.push(d);

								      });

							$scope.comments = _($scope.comments)

								.each(function (c) {

									      c.search = c.Comment + _.pluck(c.replies, 'Comment').join(' ');

								      })

								.sortBy('Created')

								.reverse()

								.value();

						}

						(repeat === true) && $timeout(function () {
							update(repeat);
						}, 5000);

						$scope.supportLoaded = true;

					});
				};

				update(true);

			}
		]);

}());
