
var linz = require('../'),
	async = require('async');

module.exports = function (router) {

	// set the model param on the linz namespace
	router.param('model', function (req, res, next, modelName) {

		// grab the model
		req.linz.model = linz.api.model.get(modelName);

		// setup the grid for this particular request
		async.parallel([

			function (cb) {

				req.linz.model.getGrid(req.user, function (err, grid) {

					if (err) {
						return cb(err);
					}

					req.linz.model.linz.formtools.grid = grid;

					cb(null);

				});

			}

		], function (err) {

			console.log('------------------');
			console.log(req.linz.model.linz.formtools.grid);

			return next(err);

		});

	});

};
