var linz = require('../'),
    async = require('async');

module.exports = function() {
    return function(req, res, next) {
        req.linz.overview = req.linz.overview || {};

        async.series(
            [
                function(cb) {
                    // get doc
                    var db = linz.mongoose.connection.db;

                    db.collection(linz.get('configs collection name'), function(
                        err,
                        collection
                    ) {
                        if (err) {
                            return cb(err);
                        }

                        collection.findOne({ _id: req.params.config }, function(
                            findErr,
                            doc
                        ) {
                            if (findErr) {
                                return cb(findErr);
                            }

                            req.linz.record = doc;

                            return cb(null);
                        });
                    });
                },

                function(cb) {
                    linz.formtools.overview.body(
                        req,
                        res,
                        req.linz.record,
                        req.linz.config,
                        function(err, body) {
                            if (err) {
                                return cb(err);
                            }

                            // body could be a string of HTML content OR an array of objects
                            req.linz.overview.body = body;

                            return cb();
                        }
                    );
                },
            ],
            next
        );
    };
};
