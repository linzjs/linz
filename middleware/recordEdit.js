var linz = require('linz'),
	async = require('async');

module.exports = function () {

	return function (req, res, next) {

		async.series([

			function (cb) {

                req.linz.model.getForm(function(err,form){

                    req.linz.model.form = form;
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
