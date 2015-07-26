/**
 * This is a helper to migrate host/other generic reservations to the reservation system
 *
 * Each one will be listed as "General Reservation" "AJ40" "AP" initially.
 */


var send = [];

FTSS.SharePoint.read({
	'source': 'Scheduled',
	'params': {
		'$filter': 'UnitId eq 9',
		'$select': [
			'Host',
			'Other',
			'Students_JSON'
		]
	}

}).then(function (data) {
	_.each(data, function (row) {

		var count = row.Host + row.Other;

		if (count) {
			row.Reservations_JSON = row.Reservations_JSON || [];

			row.Reservations_JSON.push({
				'HostId': 0,
				'TRQI'  : 'AJ40',
				'Quota' : 'AP',
				'Qty'   : count
			})
		}

		row.Approved = _.sum(row.Reservations_JSON, 'Qty');

		_.each(row.Students_JSON, function (students) {
			row.Approved += _.size(students.Students);
		});

		console.log(row);

		send.push({
			cache            : true,
			__metadata       : row.__metadata,
			Approved         : row.Approved,
			Reservations_JSON: row.Reservations_JSON
		});
	});

});

var i = 0;

console.log(send.length);

function batchProcess() {
	FTSS.SharePoint.batch(send.slice(i, i + 99));
	i = i + 100;
}