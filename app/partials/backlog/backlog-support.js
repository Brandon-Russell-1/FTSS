/*
/!*global FTSS *!/

/!**
 *
 *!/
(function () {

	"use strict";



	var timeAvg = function (time, length) {

		return moment.duration(Math.ceil(time.days / length), 'days').humanize();

	},

		timeMax = function (reqs) {

			return moment.duration(_(reqs).pluck('days').max().value(), 'days').humanize();

		},

		parseText = function (text) {

			// This is the header for our AAA text dump
			$scope.viewPaste =
			$scope.previousRequests =
			'NAME                EMP #  GRD   DAFSC  PAFSC     COURSE                          STATUS    DATE\n\n';

			var _collection = {},

			    // Keep track of the IMDS user ID (we're outside the closure to handle multi-page data
			    last = false,

			    // Keep track of the text value of last
			    mLast = false,

			    // The result of our string sanitization
			    parsed = text

				    // Strip the page header junk
				    .replace(/PERSONAL\sDATA[\s\S]+?EVT\-ID/gim, '')

				    // Strip the page footer junk
				    .replace(/^PCN\s.*!/gim, '')

				    // Strip ANG prefix from some names -- why would they do that anyway?!?!?!
				    .replace(/^ANG\s/gi, '')

				    // First, remove all QUAL & COMP text (but don't remove line in case this is the name line)
				    .replace(/(\s([\d]{6})\s).+(QUAL|COMPL).*$/gim, '')

				    // Strip blank lines
				    .replace(/^\s+$/gm, '')

				    // Strip all extra line-breaks
				    .replace(/\n+/gm, '\n');

			// Iterate over each line
			_.each(parsed.split('\n'), function (s) {

				s

					// Match the last, first, CAMSID and grade for each student
					.replace(/^([a-z]+)\s([a-z]+).*\s(\d{5})\s+([\da-z]{3})\s+\w+\s+\w+\s+/gi,

				             function (match, lastName, firstName, CAMSID, grade) {

					             // remember the last match
					             mLast = match;

					             last = {

						             // Concat the first + last
						             'name' : firstName + ' ' + lastName,

						             // Last name
						             'last' : lastName,

						             // First name
						             'first': firstName,

						             // Trim the IMDS(CAMS)ID in case we need to use later
						             'id'   : CAMSID ? CAMSID.trim() : name.replace(/[^\w]/gi, '-'),

						             // This is used by the hover so add some HTML decoration
						             'text' : '<h4>' + match + '</h4>',

						             // Try to guess the grade of this student (not very reliable right now)
						             'grade': (function () {

							             // We have to do some guessing about the grade as GS & enlisted grades overlap
							             grade = parseInt(grade, 10);

							             switch (true) {

								             // Invalid INT--might be "CON" or missing so we'll assume civilian
								             case !grade:
									             return 3;

								             // Typically grades 6 and below are enlisted guys
								             case grade < 7:
									             return 1;

								             case grade < 13:
									             return 3;
							             }

							             // Everyone else seems to be an officer
							             return 2;
						             }())

					             };

					             // return our CAMSID
					             return ' ' + CAMSID + ' ';

				             })

					// Look for each course code left (always a six-digit number)
					.replace(/\s([\d]{6})\s(.+)/,

				             function (match, courseCode, textMatch) {

					             // Test if the courseCode is listed in our course catalog
					             if (caches.IMDS.indexOf(courseCode) > -1) {

						             // Add the name + matching text to the requested field
						             var ptLine = function (field) {

							             $scope[field] += mLast + textMatch + '\n';

						             };

						             // Add the matching text to our hover info
						             last.text += '<br>' + textMatch;

						             // Now find the first date if it exists
						             s.replace(/\d\d\s[a-z]{3}\s\d\d/i, function (match) {

							             // Create a moment() object based on the match
							             last.date = moment(match);

							             // Also, just copy the text for display
							             last.dueDate = match;
						             });

						             if (textMatch.indexOf(' SCHED ') < 0 &&

						                 ($scope.old[caches.imds[courseCode]] || '').indexOf(last.id) < 0) {

							             // Add to the course array if it already exists
							             _collection[courseCode] = _collection[courseCode] || [];

							             // Now add the student to the course collection
							             _collection[courseCode].push(angular.copy(last));

							             // Dump match courses
							             ptLine('viewPaste');

						             } else {

							             // Dump prior course text
							             ptLine('previousRequests');

						             }

					             }

				             });


			});

			// Done, send the _collection back now
			return _collection;

		};

}());
*/
