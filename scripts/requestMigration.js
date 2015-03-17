var send = [];

FTSS.SP

	.read({
		      'cache' : true,
		      'source': 'Scheduled',
		      'params': {'$select': ['Requests_JSON', 'UnitId'], '$filter': 'Requests_JSON ne null'}
	      })

	.then(function (data) {

		      _.each(data, function (req) {

			      var requests = req.Requests_JSON,

			          classid = req.Id,

			          classUpdate = {

				          'cache'     : true,
				          '__metadata': req.__metadata,
				          'Approved'  : 0

			          };

			      _.each(requests, function (request) {

				      var map = {

					      '__metadata': 'Requests',
					      'ClassId'   : classid,

					      'HostId': request[3],

					      'UnitId': req.UnitId,

					      'Status': [
						      '',
						      'Pending',
						      'Approved',
						      'Denied'
					      ][request[0]],

					      'Students_JSON': {}

				      };

				      _.each(request[1], function (name) {

					      if (name.length > 0) {map.Students_JSON[name] = ''}

				      });

				      if (request[2]) {map.Notes = request[2]}

				      if (request[4]) {map.Response = request[4]}

				      if (request[0] === 2) { classUpdate.Approved += request[1].length }

				      _.size(map.Students_JSON) > 0 && send.push(map);

			      });

			      classUpdate.Approved && send.push(classUpdate);

		      });


	      });


// FTSS.SP.batch(send.slice(500,511));