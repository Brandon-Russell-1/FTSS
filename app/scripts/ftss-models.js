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
					    'InstructorName',
					    'InstructorEmail',
					    'Photo',
					    'Archived'
				    ]
			    }

		    },

		    'requests': {

			    'source': 'Requests',
			    'params': {
				    '$select': [
					    'Status',
					    'HostId',
					    'Notes',
					    'Response',
					    'Students_JSON',
					    'ClassId'
				    ]
			    }

		    },

		    'production': {

			    'source': 'Scheduled',
			    'params': {
				    '$filter': [
					    'Archived eq false',
					    'NA eq false'
				    ],
				    '$select': [
					    'Start',
					    'Days',
					    'CourseId',
					    'Hours',
					    'InstructorId',
					    'Host',
					    'Other',
					    'Approved',
					    'TS'
				    ]
			    }
		    },

		    'scheduled': {

			    'cache' : true,
			    'source': 'Scheduled',
			    'params': {
				    '$select': [
					    'Archived',
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
					    'NA',
				        'Location'
				    ]
			    }

		    },

		    'scheduledSearch': {

			    'cache' : !PRODUCTION,
			    'source': 'Scheduled',
			    'params': {
				    '$filter': [
					    'Archived eq false',
					    'NA eq false',
					    'Start ge ' + _today
				    ],
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
					    // Ignore unavailability and training sessions
					    'CourseId gt 1',
					    // Ignore cancelled classes
					    'Archived eq false'
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

		    'courseInvalidate': {

			    'source': 'Scheduled',
			    'params': {
				    '$select': [
					    'Start',
					    'TTMS'
				    ]
			    }

		    },

		    'requirements': {

			    'cache' : true,
			    'source': 'Requirements',
			    'params': {
				    '$expand': 'CreatedBy',
				    '$select': [
					    'UnitId',
					    'HostId',
					    'DateNeeded',
					    'Requirements_JSON',
					    'ApprovedCC',
					    'ApprovedMAJCOM',
					    'Funded',
					    'TDY',
					    'Notes',
					    'CreatedBy/Name',
					    'CreatedBy/WorkEMail'
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

		    }

	    };

	/**
	 * Allows us to capture a copy of the model without corrupting the original (immutable models FTW)
	 *
	 * @param  modelName String
	 * @returns model Object
	 */
	FTSS.models = function (modelName) {

		return _.cloneDeep(_models[modelName]);

	};

}());