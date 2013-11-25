var util = require('util'),
	async = require('async');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.models[req.params.model];

		async.series([

			// grab the columns and append them to the model, i.e. req.linz.model.columns
			function (cb) {

				req.linz.model.getColumns(function (err, columns) {
					req.linz.model.columns = columns;
					cb(null);
				});

			},

			// grab the actions and append them to the model, i.e req.linz.model.modelActions
			function (cb) {

				req.linz.model.getModelActions(function (err, modelActions) {
					req.linz.model.modelActions = modelActions;
					cb(null);
				});

			},

			// find the docs
			function (cb) {

				// simply return all docs
				req.linz.model.find({}, function (err, docs) {

					if (!err) req.linz.records = docs;
					cb(null);

				});

			}

		], function () {

			// ndext middleware
			next();

		});

	}

}