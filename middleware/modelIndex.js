var util = require('util');

module.exports = function (model) {

	return function (req, res, next) {

		// make a reference to the model itself
		req.linz.model = model;

		// get all of the models from the database
		req.linz.models = [];

		// simply return all docs
		model.find({}, function (err, docs) {

			if (!err) {
				req.linz.models = docs;
			}

			next();

		});

	}

}