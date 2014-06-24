var async = require('async');

module.exports = function () {

	return function (req, res, next) {

        // set the config on linz
		req.linz.configs = req.linz.get('configs');

        // construct the grid object
        req.linz.configGrid = {
            columns: {
                label: {
                    label: 'Label',
                    renderer: req.linz.formtools.cellRenderers.overviewLink
                },
                _id: {
                    label: 'Config key',
                    renderer: req.linz.formtools.cellRenderers.default
                },
                dateModified: {
                    label: 'Modified on',
                    renderer: req.linz.formtools.cellRenderers.date
                },
                modifiedBy: {
                    label: 'Modified by',
                    renderer: req.linz.formtools.cellRenderers.reference
                }
            }
        };

		async.waterfall([

			// find the configs
			function (cb) {

                var db  = req.linz.mongoose.connection.db,
                    configKeys = Object.keys(req.linz.configs),
                    filter = { _id: { $in: configKeys } };

                db.collection(req.linz.get('configs collection name'), function (err, collection) {

                    // find documents matching each of the availabel config schema name
                    collection.find(filter).toArray(function(err, items) {

                        if (err) {
                            return cb(err);
                        }

                        if (items.length === 0) {
                            // return error to skip the next asyn function that inspect the records since none is found.
                            return cb(new Error('No record found.'), items) ;
                        }

                        return cb(null, items);

                    });
                });

			},

            // apply renderer to values of each configs
            function (records, cb) {

                // loop through each record
                async.each(records, function (record, recordDone) {

                    // loop through each column
                    async.each(Object.keys(req.linz.configGrid.columns), function (column, columnDone) {

                        req.linz.configGrid.columns[column].renderer(record[column], record, column, req.linz.configs[record._id], function (err, value) {

                            if (err) {
                                return columnDone(err, records);
                            }

                            var index = records.indexOf(record);
                            records[index][column] = value;

                            return columnDone(null, records);

                        });

                    }, function (err) {

                        return recordDone(err, records);

                    });


                }, function (err) {

                    return cb(err, records);

                });

            }

		], function (err, records) {

            // handle the returned error when no records are found
            if (err && err.message === 'No record found.') {
                err = null;
            }

            // map the update records to linz
            req.linz.records = records;

			// next middleware
			return next(err);

		});

	}

}
