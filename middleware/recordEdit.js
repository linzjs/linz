var util = require('util'),
	async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = req.linz.get('models')[req.params.model];

		async.series([

			function (cb) {

				req.linz.model.getFieldLabels(function (err, fieldLabels) {
					req.linz.model.fieldLabels = fieldLabels;
					cb(null);
				});

			},

			function (cb) {

				// simply return all docs
				req.linz.model.findById(req.params.id, function (err, doc) {

					if (!err) {
						req.linz.record = doc;
						cb(null);
					}

				});

			},

		], function () {

			// call the next middleware
			next();

		});

	}

}