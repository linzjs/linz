var linz = require('../'),
    async = require('async');

module.exports = function() {
    return function(req, res, next) {
        async.waterfall(
            [
                // find the configs
                function(cb) {
                    const { db } = linz.mongoose.connection;
                    const collection = db.collection(
                        linz.get('configs collection name')
                    );

                    return cb(null, collection);
                },

                async function(collection) {
                    // remove this config from db
                    await collection.deleteOne(
                        { _id: req.params.config },
                        { w: 1 }
                    );

                    return collection;
                },

                async function(collection) {
                    // now that we have removed the record, let's add it again with default values.
                    // this is a more efficient way of resetting the config values than updating the existing record.

                    var newConfig = {
                        dateModified: new Date(),
                        modifiedBy: req.user._id,
                    };

                    // contruct doc from config schema
                    req.linz.config.schema.eachPath(function(fieldName, field) {
                        newConfig[
                            fieldName
                        ] = linz.formtools.utils.getDefaultValue(field);
                    });

                    // overwrite _id field with custom id name
                    newConfig['_id'] = req.params.config;

                    try {
                        await collection.insertOne(newConfig, { w: 1 });

                        // add new config to linz
                        linz.get('configs')[
                            req.params.config
                        ].config = newConfig;

                        return;
                    } catch (err) {
                        throw new Error(
                            'Unable to write config file %s to database. ' +
                                err.message,
                            req.params.config
                        );
                    }
                },
            ],
            function(err) {
                return next(err);
            }
        );
    };
};
