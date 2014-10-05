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

	FTSS.models = {

		'catalog': {

			'cache' : true,
			'source': 'MasterCourseList',
			'params': {
				'$select': [
					'PDS',
					'MDS',
					'Days',
					'Hours',
					'Min',
					'Max',
					'AFSC',
					'Title',
					'Number',
					'IMDS',
					'Priority',
					'Archived'
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
					'Courses_JSON',
					'Thumb'
				]
			}

		},

		'hosts': {

			'cache' : true,
			'source': 'HostUnits',
			'params': {
				'$select': [
					'Unit',
					'FTD',
					'Location',
					'Email'
				]
			}

		},

		'instructors': {

			'cache' : true,
			'source': 'Instructors',
			'params': {
				'$select': [
					'UnitId',
					'AFSC',
					'InstructorName',
					'InstructorEmail',
					'Photo',
					'Archived'
				]
			}

		},

		'requests': {

			'cache' : true,
			'source': 'Requests',
			'params': {
				'$expand': [
					'CreatedBy',
					'Scheduled/Course'
				],
				'$select': [
					'Archived',
					'Notes',
					'Status',
					'Created',
					'CreatedBy/Name',
					'CreatedBy/WorkEMail',
					'CreatedBy/WorkPhone',
					'Response',
					'Responder',
					'Students_JSON',
					'Scheduled/UnitId',
					'Scheduled/CourseId',
					'Scheduled/Start',
					'Scheduled/End',
					'Scheduled/Host',
					'Scheduled/Other',
					'Scheduled/InstructorId'
				]
			}

		},

		'scheduled': {

			'cache' : true,
			'source': 'Scheduled',
			'params': {
				'$expand': [
					'Course',
					'Requests'
				],
				'$select': [
					'Archived',
					'UnitId',
					'CourseId',
					'Start',
					'End',
					'InstructorId',
					'Host',
					'Other',
					'Requests/Status',
					'Requests/Students_JSON'
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
					'CreatedBy/Name'
				]
			}

		},


		'updates': {

			'debounce': 21600,
			'cache'   : true,
			'source'  : 'Updates',
			'params'  : {
				'$select': [
					'Update',
					'Created'
				]
			}

		}

	};

}());