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

			// find the docs
			function (cb) {

				var query = req.linz.model.find({});

				// sort by the chosen sort field, or use the first sortBy option as the default
				if (!req.query.sort && req.linz.model.grid.sortBy.length) {

					query.sort(req.linz.model.grid.sortBy[0].field);

				} else if (req.query.sort) {

					query.sort(req.query.sort);
					
				}

				query.exec(function (err, docs) {

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