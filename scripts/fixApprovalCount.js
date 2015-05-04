var send = [],

	classes = {};

FTSS.SP

	.read({
		'source': 'Requests',
		'params': {
			'$expand': 'Class',
			'$select': ['Students_JSON', 'Class/Approved', 'ClassId'],
			'$filter': "Status eq 'Approved'"
		}
	})

	.then(function (data) {

		      _.each(data, function (req) {

			             classes[req.ClassId] = classes[req.ClassId] || {reqs: [], org: req.Class.Approved, num: 0};

			             classes[req.ClassId].num += _.size(req.Students_JSON);

			             classes[req.ClassId].reqs.push(req);

		             }
		      );

		      _.each(classes, function (row) {

			      if (row.num !== row.org) {

				      send.push({

					      'cache': true,

					      '__metadata': row.reqs[0].Class.__metadata,

					      'Approved': row.num

				      })

			      }

		      });
	      });


// FTSS.SP.batch(send.slice(500,511));