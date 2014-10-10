/*global FTSS, _, moment, utils */

/**
 *
 */
(function () {

	"use strict";

	FTSS.ng.controller(
		'adminController',
		[
			'$scope',
			'SharePoint',
			'$timeout',
			function ($scope, SharePoint, $timeout) {

				var self = FTSS.controller($scope, {

					'sort' : 'Created',
					'group': 'Page',

					'grouping': {
						'Page': 'Page'
					},

					'sorting': {

						'Created': 'Created'

					},

					'model': 'support',

					'refresh': 3

				});

				self

					.bind()

					.then(function (data) {

						      $scope.edit = angular.noop;

						      var comments = {};

						      _(data)

							      .sortBy('Created')

							      .reverse()

							      .each(function (d) {

								            // Get the time from now with the GMT offset of the CS3 servers (-5)
								            d.TimeAgo = moment(d.Created).add('h', 5).fromNow();

								            if (d.Thread < 1) {
									            d.replies = [];
									            comments[d.Id] = d;
								            }

							            })

							      .each(function (d) {

								            if (d.Thread > 0) {
									            comments[d.Thread].replies.push(d);
								            }

							            });

						      self.initialize(comments).then();

					      });


				/*


				 var model = FTSS.models.support,

				 page = FTSS._fn.getPage(),

				 update,

				 previous;

				 model.params.$filter = "";

				 $scope.startReply = function (comment) {

				 comment.reply = true;

				 };

				 $scope.addReply = function (comment) {

				 $scope.supportLoaded = false;

				 var send = {
				 '__metadata': 'Support',
				 'cache'     : true,
				 'Page'      : page,
				 'Staff'     : false,
				 'Comment'   : comment ? comment.writeReply : $scope.askQuestion
				 };

				 if (comment) {
				 send.Thread = comment.Id;
				 }

				 send.Comment && SharePoint.create(send).then(update, utils.alert.error);

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

				 // Get the time from now with the GMT offset of the CS3 servers (-5)
				 d.TimeAgo = moment(d.Created).add('h', 5).fromNow();

				 if (d.Thread < 1) {
				 d.replies = [];
				 $scope.comments[d.Id] = d;
				 }

				 })

				 .each(function (d) {

				 if (d.Thread > 0) {
				 $scope.comments[d.Thread].replies.push(d);
				 }

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

				 update(true);*/

			}
		]);

}());
