var async = require('async');

module.exports = function () {

	return function (req, res, next) {

		req.linz.config = req.linz.get('configs')[req.params.config];

        async.series([

            function (cb) {

                // get doc
                var db  = req.linz.mongoose.connection.db;

                db.collection('linzconfigs', function (err, collection) {

                    collection.findOne({ _id: req.params.config}, function (err, doc) {
                        if (err) {
                            return cb(err);
                        }

                        req.linz.record = doc;
                        return cb(null);
                    });

                });

            },

            function (cb) {

                req.linz.config.schema.statics.getForm(function(err,form){

                    if (err) {
                        cb(err);
                    }

                    req.linz.config.form = form;

                    return cb(null);

                });

            },

            function (cb) {

                req.linz.config.schema.statics.getOverview(function(err,overview){

                    if (err) {
                        return cb(err);
                    }

                    req.linz.config.overview = overview;

                    return cb(null);

                });

            }

        ], function (err, results) {
            return next(err);
        });

	}

}
