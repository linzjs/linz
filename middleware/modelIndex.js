var util = require('util');

module.exports = function (model) {

	return function (req, res, next) {

		console.log(req.linz.models[req.params.model]);

		req.linz.model = req.linz.models[req.params.model];

		// make a reference to the model itself
		// req.linz.model = model;

		// get all of the models from the database
		// req.linz.models = [];

		// simply return all docs
		req.linz.model.find({}, function (err, docs) {

			if (!err) {
				req.linz.records = docs;
			}

			next();

		});

	}

}