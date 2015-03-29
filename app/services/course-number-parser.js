FTSS.ng.service('courseNumberParser', [

	function () {

		"use strict";

		// Current as of 1 April 2015
		var _mdsTable = {
			'00': 'A-10',
			'01': 'B-1B',
			'02': 'B-2',
			'03': 'B-52',
			'04': 'C-5',
			'05': 'C-9',
			'06': 'C-12',
			'07': 'C-17',
			'08': 'EC/C-18',
			'09': 'C-20',
			'10': 'C-21',
			'11': 'C-22',
			'12': 'C-26',
			'13': 'C-27',
			'14': 'C-32',
			'15': 'C-37',
			'16': 'C-38',
			'17': 'AC/EC/HC/MC/WC/C-130',
			'18': 'EC/KC/OC/RC/C-135',
			'19': 'C-137',
			'20': 'C-141',
			'21': 'CV-22 ',
			'22': 'E-3',
			'23': 'E-4',
			'24': 'E-8 JSTARS',
			'25': 'F-15',
			'26': 'F-16',
			'27': 'F-22',
			'28': 'F-35 ',
			'29': 'F-117',
			'30': 'HH-60',
			'31': 'KC-10',
			'32': 'MH-53',
			'33': 'OA/A-37',
			'34': 'MQ-1',
			'35': 'RQ-4',
			'36': 'T-1',
			'37': 'T-6',
			'38': 'T-37',
			'39': 'T-38',
			'40': 'T-43',
			'41': 'U-2',
			'42': 'UH-1',
			'43': 'VC-25',
			'44': 'VC-137',
			'45': 'YAL-12A AABL ',
			'46': 'Aerospace Ground Equipment ',
			'47': 'Munitions',
			'48': 'Multi-Systems',
			'49': 'Engines (Pratt & Whitney)',
			'50': 'Engines (General Electric)',
			'51': 'MQ-9',
			'52': 'KC-46',
			'71': 'Space Based Infrared System (SBIRS)',
			'72': 'Phased Array Warning System (PAWS)',
			'73': 'Perimeter Acquisition Radar Characterization System (PARCS)',
			'74': 'Active Space Surveillance',
			'75': 'Global Positioning System',
			'76': 'Defense Satellite Communications System',
			'77': 'MILSTAR/AEHF',
			'78': 'Defense Support Program (DSP)',
			'79': 'Ballistic Missile Early Warning System (BMEWS) ',
			'80': 'Space Control',
			'81': 'Wideband Gapfiller System (WGS)',
			'82': 'Advanced Wideband System (Future Sys)',
			'83': 'MILSATCOM',
			'84': 'Rapid Execution and Combat Targeting (REACT)',
			'85': 'Peacekeeper',
			'86': 'Spacelift (Future Sys)',
			'87': 'Cheyenne Mountain Operations Center (CMOC)***',
			'88': 'Minuteman',
			'89': 'Cruise (AGM86/129)',
			'90': 'Distributed Common Ground System'
		};

		/**
		 * Takes a course number and parses the official AETC MDS based off the course number
		 */
		return function(course) {

			return _mdsTable[course.substring(12,14)];

		};
	}

]);