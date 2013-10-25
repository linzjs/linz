var util = require('util'),
	async = require('async');

module.exports = function (model) {

	return function (req, res, next) {

		req.linz.model = req.linz.models[req.params.model];

		async.series([

			// grab the columns
			function (cb) {

				req.linz.model.getColumns(function (err, columns) {
					req.linz.columns = columns;
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