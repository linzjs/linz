var util = require('util'),
	async = require('async');

module.exports = function (model) {

	return function (req, res, next) {

        var records = [];

        // set the model on linz
		req.linz.model = req.linz.get('models')[req.params.model];

		async.series([

			// grab the grid object and append it to the model, i.e. req.linz.model.grid.columns
			function (cb) {

				req.linz.model.getGrid(function (err, grid) {

                    if (!err) {
                        req.linz.model.grid = grid;
                    }

					cb(err);

				});

			},

			// find the docs
			function (cb) {

				var query = req.linz.model.find({});

				// sort by the chosen sort field, or use the first sortBy option as the default
				if (!req.query.sort && req.linz.model.grid.sortBy.length) {

					query.sort(req.linz.model.grid.sortBy[0].field);

				} else if (req.query.sort) {

					query.sort(req.query.sort);

				}

				query.exec(function (err, docs) {

					if (!err) {

                        records = docs;
                    }

					cb(err);

				});

			},

            // create the values for the datagrids for each doc
            function (cb) {

                // loop through each record
                async.each(Object.keys(records), function (index, recordDone) {

                    // turn each mongoose record, into a plain javascript object
                    // otherwise it won't accept a string in a field of type Date
                    records[index] = records[index].toObject();

                    // loop through each column
                    async.each(Object.keys(req.linz.model.grid.columns), function (column, columnDone) {

                        // call the cell renderer and update the content with the result
                        req.linz.model.grid.columns[column].renderer(records[index][column], records[index], column, req.linz.model.modelName, function (err, value) {

                            if (!err) {
                                records[index][column] = value;
                            }

                            return columnDone(err);

                        });


                    }, function (err) {

                        recordDone(err);

                    });


                }, function (err) {

                    cb(err);

                });

            }

		], function (err, result) {

            // map the update records to linz
            req.linz.records = records;

			// next middleware
			next(err);

		});

	}

}
