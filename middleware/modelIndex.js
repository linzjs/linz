var util = require('util');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.models[req.params.model];

		// simply return all docs
		req.linz.model.find({}, function (err, docs) {

			if (!err) {
				req.linz.records = docs;
			}

			next();

		});

	}

}