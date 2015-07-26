/**
 * This is a helper to migrate approvals back to the scheduled list, part of the reservation system
 *
 * The requests lists will still hold pending/denied requests, but approvals will be moved to the scheduled list to allow privilege separation
 */


var send = {};

FTSS.SharePoint.read({
	'source': 'Requests',
	'params': {
		'$filter': "Class/Timestamp ne null and Status eq 'Approved'",
		'$expand': [
			'Class'
		],
		'$select': [
			'HostId',
			'Notes',
			'Response',
			'Students_JSON',
			'Class/Timestamp'
		]
	}

}).then(function (data) {
	_.each(data, function (row) {
		send[row.Class.__metadata.uri] = send[row.Class.__metadata.uri] || {cache: true, __metadata: row.Class.__metadata, Students_JSON: []};

		send[row.Class.__metadata.uri].Students_JSON.push({HostId: row.HostId, Host: row.Notes, FTD: row.Response, Students: row.Students_JSON});
	});

});

var batchSend = _.toArray(send);


FTSS.SharePoint.batch(batchSend.slice(0, 99));