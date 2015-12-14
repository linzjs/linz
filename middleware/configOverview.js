var linz = require('../'),
    async = require('async');

module.exports = function () {

	return function (req, res, next) {

        async.series([

            function (cb) {

                // get doc
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

            },

            function (cb) {

                req.linz.config.schema.statics.getPermissions(req.user, function (err, permissions) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.config.permissions = permissions;

                    return cb(null);

                });

            }

        ], function (err, results) {
            return next(err);
        });

	}

}
