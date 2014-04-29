var util = require('util'),
	async = require('async');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

		async.parallel([

			// grab the grid object and append it to the model, i.e. req.linz.model.grid.columns
			function (cb) {

				req.linz.model.getGrid(function (err, grid) {
					req.linz.model.grid = grid;
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

			// next middleware
			next();

		});

	}

}