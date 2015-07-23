/*global FTSS */

/**
 *  FTSS Models
 *
 *      '$inlinecount': 'allpages',
 *      '$top'        : 25,
 *
 */
(function () {

	"use strict";

	// Keep track of today's integer
	var _today = moment().diff(moment('2000-01-01'), 'days'),

	// Our internal collection of models--these are immutable! :-)
		_models = {

			'assets': {

				'cache' : true,
				'debounce': 3600,
				'source': 'AppAssets',
				'params': {
					'$select': [
						'DataType',
						'Data_JSON'
					]
				}

			},

			'users': {

				'source': 'UserInformationList',
				'params': {
					'$select': [
						'Name',
						'WorkEMail'
					]
				}

			},

			'catalog': {

				'cache' : true,
				'source': 'MasterCourseList',
				'params': {
					'$select': [
						'PDS',
						'Days',
						'Hours',
						'Min',
						'Max',
						'Title',
						'Number',
						'IMDS',
						'G081',
						'Priority'
					]
				}

			},

			'units': {

				'cache' : true,
				'source': 'Units',
				'params': {
					'$select': [
						'Base',
						'Det',
						'Email',
						'Phone',
						'Location',
						'LCode',
						'Courses_JSON'
					]
				}

			},

			'hosts': {

				'cache'  : true,
				'source' : 'HostUnits',
				'params' : {
					'$select': [
						'Unit',
						'FTD',
						'Location',
						'Email'
					]
				},
				'version': 1

			},

			'instructors': {

				'cache' : true,
				'source': 'Instructors',
				'params': {
					'$select': [
						'UnitId',
						'Name',
						'Email',
						'Photo',
						'Archived'
					]
				}

			},

			'requests': {

				'source': 'Requests',
				'params': {
					'$expand': [
						'Class',
						'CreatedBy'
					],
					'$select': [
						'Status',
						'HostId',
						'UnitId',
						'Notes',
						'Response',
						'Students_JSON',
						'Created',
						'CreatedBy/Name',
						'Class/Id',
						'Class/TTMS',
						'Class/CourseId',
						'Class/Start',
						'Class/Days',
						'Class/Host',
						'Class/Other',
						'Class/Approved'
					]
				}

			},

			'scheduled': {

				'cache'  : true,
				'source' : 'Scheduled',
				'params' : {
					'$select': [
						'UnitId',
						'CourseId',
						'Start',
						'Days',
						'Hours',
						'InstructorId',
						'Host',
						'Other',
						'Approved',
						'ClassNotes',
						'J4Notes',
						'TTMS',
						'MTT',
						'TS',
						'Location',
					    'Reservations_JSON'
					]
				},
				'version': 1

			},

			'scheduledSearch': {

				'cache' : !PRODUCTION,
				'source': 'Scheduled',
				'params': {
					'$filter': ['Start ge ' + _today],
					'$select': [
						'UnitId',
						'MTT',
						'CourseId',
						'Start',
						'Days',
						'InstructorId',
						'Host',
						'Other',
						'Approved',
						'ClassNotes',
						'TTMS',
						'TS'
					]
				}

			},

			'ttms': {

				'source': 'Scheduled',
				'params': {
					'$filter': [
						// Only items needing action
						'TTMS eq null',
						// Only items starting after today
						'Start gt ' + _today,
						// Ignore training sessions
						'CourseId gt 1'
					],
					'$select': [
						'UnitId',
						'CourseId',
						'Start',
						'Days',
						'ClassNotes',
						'J4Notes'
					]
				}

			},

			'unavailable': {

				'cache' : true,
				'source': 'Unavailable',
				'params': {
					'$select': [
						'InstructorId',
						'Start',
						'Days'
					]
				}

			},

			'courseInvalidate': {

				'source': 'Scheduled',
				'params': {
					'$select': [
						'Start',
						'TTMS'
					]
				}

			},

			'requirements_stats': {

				'cache' : true,
				'source': 'RequirementsStats',
				'params': {
					'$select': [
						'Month',
						'Data_JSON'
					]
				}

			},

			'support': {

				'debounce': 3,
				'cache'   : true,
				'source'  : 'Support',
				'params'  : {
					'$expand': 'CreatedBy',
					'$select': [
						'Page',
						'Thread',
						'Staff',
						'Comment',
						'Created',
						'CreatedBy/Name',
						'CreatedBy/WorkEMail'
					]
				}

			},

			'updates': {

				'cache' : true,
				'source': 'Updates',
				'params': {
					'$select': [
						'Date',
						'Fix',
						'Feat',
						'Misc'
					]
				}

			}

		};

	/**
	 * Allows us to capture a copy of the model without corrupting the original (immutable models FTW)
	 *
	 * @param {String} modelName
	 * @returns {Object} model
	 */
	FTSS.models = function (modelName) {

		return _.cloneDeep(_models[modelName]);

	};

}());