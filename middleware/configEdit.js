var linz = require('../'),
    util = require('util'),
	async = require('async');

module.exports = function () {

	return function (req, res, next) {

		async.series([

			function (cb) {

                req.linz.config.schema.statics.getForm(function(err, form){

                    if (err) {
                        return cb(err);
                    }

                    req.linz.config.form = form;

                    return cb(null);

                });

			},

			function (cb) {

                var db  = linz.mongoose.connection.db;

                db.collection(linz.get('configs collection name'), function (err, collection) {

                    collection.findOne({ _id: req.params.config}, function (err, doc) {
                        if (err) {
                            return cb(err);
                        }

                        req.linz.record = doc;
                        return cb(null);
                    });

                });

			},

		], function (err) {

			// call the next middleware
			return next(err);

		});

	}

}
