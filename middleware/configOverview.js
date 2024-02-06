var linz = require('../'),
    async = require('async');

module.exports = function() {
    return function(req, res, next) {
        req.linz.overview = req.linz.overview || {};

        async.series(
            [
                async function(cb) {
                    // get doc
                    const { db } = linz.mongoose.connection;
                    const collection = db.collection(
                        linz.get('configs collection name')
                    );

                    try {
                        const doc = await collection.findOne({
                            _id: req.params.config,
                        });

                        req.linz.record = doc;

                        return cb();
                    } catch (findErr) {
                        return cb(findErr);
                    }
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
