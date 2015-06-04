var linz = require('../'),
	async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.model = linz.api.model.get(req.params.model);

		async.series([

			function (cb) {

                req.linz.model.getForm(function(err,form){

                    req.linz.model.form = form;
                    cb(null);

                });

			},

			function (cb) {

				linz.api.model.getData(req.params.model, req.params.id, function (err, doc) {

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
