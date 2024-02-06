var linz = require('../'),
    async = require('async');

module.exports = function() {
    return function(req, res, next) {
        // set the config on linz
        req.linz.configs = linz.get('configs');
        req.linz.configsPerm = {};

        // construct the list object
        req.linz.configList = {
            fields: {
                label: {
                    label: 'Label',
                    renderer: linz.formtools.cellRenderers.overviewLink,
                },
                _id: {
                    label: 'Config key',
                    renderer: linz.formtools.cellRenderers.default,
                },
                dateModified: {
                    label: 'Modified on',
                    renderer: linz.formtools.cellRenderers.date,
                },
                modifiedBy: {
                    label: 'Modified by',
                    renderer: linz.formtools.cellRenderers.reference,
                },
            },
        };

        async.waterfall(
            [
                // find the configs
                async function(cb) {
                    const db = linz.mongoose.connection.db;
                    const configKeys = Object.keys(req.linz.configs);
                    const filter = { _id: { $in: configKeys } };
                    const collection = db.collection(
                        linz.get('configs collection name')
                    );

                    // find documents matching each of the available config schema name
                    try {
                        const items = await collection.find(filter).toArray();

                        if (items.length === 0) {
                            // return error to skip the next asyn function that inspect the records since none is found.
                            return cb(new Error('No record found.'), items);
                        }

                        return cb(null, items);
                    } catch (err) {
                        return cb(err);
                    }
                },

                function(records, cb) {
                    async.map(
                        records,
                        function(config, configDone) {
                            req.linz.configs[
                                config._id
                            ].schema.statics.getPermissions(req.user, function(
                                permsErr,
                                perms
                            ) {
                                config.permissions = perms;

                                return configDone(permsErr, config);
                            });
                        },
                        function(err, results) {
                            return cb(err, results);
                        }
                    );
                },

                // apply renderer to values of each configs
                function(records, cb) {
                    // loop through each record
                    async.each(
                        records,
                        function(record, recordDone) {
                            // loop through each field
                            async.each(
                                Object.keys(req.linz.configList.fields),
                                function(field, fieldDone) {
                                    req.linz.configList.fields[field].renderer(
                                        record[field],
                                        record,
                                        field,
                                        req.linz.configs[record._id],
                                        function(err, value) {
                                            if (err) {
                                                return fieldDone(err, records);
                                            }

                                            var index = records.indexOf(record);
                                            records[index][field] = value;

                                            return fieldDone(null, records);
                                        }
                                    );
                                },
                                function(err) {
                                    return recordDone(err, records);
                                }
                            );
                        },
                        function(err) {
                            return cb(err, records);
                        }
                    );
                },
            ],
            function(err, records) {
                // handle the returned error when no records are found
                if (err && err.message === 'No record found.') {
                    err = null;
                }

                // map the update records to linz
                req.linz.records = records;

                // next middleware
                return next(err);
            }
        );
    };
};
