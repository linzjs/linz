var linz = require('../'),
    async = require('async');

module.exports = function(router) {

    // Set the model param on the linz namespace.
    router.param('model', function(req, res, next, modelName) {

        // grab the model
        req.linz.model = linz.api.model.get(modelName);

        // Setup the shared formtools data for this particular request.
        async.parallel([

            function(cb) {

                req.linz.model.linz.formtools.labels = linz.api.model.labels(modelName);

                return cb();

            },

            function(cb) {

                linz.api.model.permissions(req.user, modelName, function(err, permissions) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.model.linz.formtools.permissions = permissions;

                    return cb(null);

                });

            },

        ], function(err) {

            return next(err);

        });

    });

};
