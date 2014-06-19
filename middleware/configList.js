var linz = require('../'),
	async = require('async');

module.exports = function () {

	return function (req, res, next) {

        // set the config on linz
		req.linz.configs = req.linz.get('configs');

        // construct the grid object
        req.linz.configGrid = {
            columns: {
                label: {
                    label: 'Label',
                    renderer: linz.formtools.cellRenderers.overviewLink
                },
                dateModified: {
                    label: 'Modified on',
                    renderer: linz.formtools.cellRenderers.date
                },
                modifiedBy: {
                    label: 'Modified by',
                    renderer: function configReferenceRenderer (val, record, fieldName, model, callback) {

                        if (linz.mongoose.models[linz.get('user model')].findForReference) {
                            return linz.mongoose.models[linz.get('user model')].findForReference(val,callback);
                        }

                        linz.mongoose.models[linz.get('user model')].findById(val, function (err, doc) {
                            return callback(null, (doc) ? doc.title : ((val && val.length) ? val + ' (missing)' : ''));
                        });

                    }
                }
            }
        };

		async.waterfall([

			// find the configs
			function (cb) {

                var db  = req.linz.mongoose.connection.db;

                db.collection('linzconfigs', function (err, collection) {
                    collection.find().toArray(function(err, items) {

                        if (err) {
                            return cb(err);
                        }

                        if (!items || (items && items.lenth === 0)) {
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

            // map the update records to linz
            req.linz.records = records;

			// next middleware
			return next(err);

		});

	}

}
