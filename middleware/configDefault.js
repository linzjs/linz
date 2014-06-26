var linz = require('../'),
    async = require('async');

module.exports = function () {

    return function (req, res, next) {

        // set the config on linz
        req.linz.config = linz.get('configs')[req.params.config];

        async.waterfall([

            // find the configs
            function (cb) {

                var db  = linz.mongoose.connection.db;

                db.collection(linz.get('configs collection name'), function (err, collection) {
                    return cb(err, collection);
                });

            },

            function (collection, cb) {

                // remove this config from db
                collection.remove({ _id: req.params.config }, { w: 1 }, function (err, result) {
                    return cb(err, collection);
                });

            },

            function (collection, cb) {

                // now that we have removed the record, let's add it again with default values.
                // this is a more efficient way of resetting the config values than updating the existing record.

                var newConfig = {};

                // contruct doc from config schema
                req.linz.config.schema.eachPath(function (fieldName, field) {
                    newConfig[fieldName] = linz.formtools.utils.getDefaultValue(field);
                });

                // overwrite _id field with custom id name
                newConfig['_id'] = req.params.config;

                collection.insert(newConfig, { w: 1 }, function (err, result) {

                    if (err) {
                        throw new Error('Unable to write config file %s to database. ' + err.message, configName);
                    }

                    // add new config to linz
                    linz.get('configs')[req.params.config].config = newConfig;

                    return cb(null);

                });

            }

        ], function (err, result) {

            return next(err);

        });

    }

}
