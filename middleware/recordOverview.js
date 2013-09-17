var util = require('util');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.models[req.params.model];

		// simply return all docs
		req.linz.model.findById(req.params.id, function (err, doc) {

			if (!err) {
				req.linz.record = doc;
			}

			console.log(req.linz.model.schema);

			next();

		});

	}

}