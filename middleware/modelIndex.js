var util = require('util'),
	async = require('async');

module.exports = function (model) {

	return function (req, res, next) {

        var records = [],
            filters = {};

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

            // render the filters
            function (cb) {

                async.each(Object.keys(req.linz.model.grid.filters), function (fieldName, filtersDone) {

                    if (req.linz.model.grid.filters[fieldName].formControls) {
                        return filtersDone(null);
                    }

                    // call the filter renderer and update the content with the result
                    req.linz.model.grid.filters[fieldName].filter.renderer(fieldName, function (err, result) {

                        if (!err) {
                            req.linz.model.grid.filters[fieldName].formControls = result;
                        }

                        return filtersDone(err);

                    });

                }, function (err) {

                    return cb(err);

                });

            },

            // render the active filters
            function (cb) {

                req.linz.model.grid.activeFilters = {};

                // check if there are any filters in the form post
                if (!req.body.selectedFilters) {
                    return cb(null);
                }

                async.each(req.body.selectedFilters.split(','), function (fieldName, filtersDone) {

                    // call the filter binder to render active filter form controls with form value added
                    req.linz.model.grid.filters[fieldName].filter.bind(fieldName, req.body, function (err, result) {

                        if (!err) {
                            req.linz.model.grid.activeFilters[fieldName] = {
                                label: req.linz.model.grid.filters[fieldName].label,
                                controls: result
                            }
                        }

                        return filtersDone(err);

                    });

                }, function (err) {

                    return cb(err);

                });

            },

            // get the filters
            function (cb) {

                // check if there are any filters in the form post
                if (!req.body.selectedFilters) {
                    return cb(null);
                }

                async.each(req.body.selectedFilters.split(','), function (fieldName, filtersDone) {

                    // call the filter renderer and update the content with the result
                    req.linz.model.grid.filters[fieldName].filter.filter(fieldName, req.body, function (err, result) {

                        if (!err) {

                            filters = req.linz.model.addSearchFilter(filters, result);

                        }

                        return filtersDone(err);

                    });

                }, function (err) {

                    return cb(err);

                });

            },

			// find the docs
			function (cb) {

                // consolidate filters into query
                if (Object.keys(filters).length) {
                    filters = req.linz.model.setFiltersAsQuery(filters);
                }

				var query = req.linz.model.find(filters);

				// sort by the chosen sort field, or use the first sortBy option as the default
				if (!req.body.sort && req.linz.model.grid.sortBy.length) {

					query.sort(req.linz.model.grid.sortBy[0].field);

				} else if (req.body.sort) {

					query.sort(req.body.sort);

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
                    records[index] = records[index].toObject({ virtuals: true});

                    // loop through each column
                    async.each(Object.keys(req.linz.model.grid.columns), function (column, columnDone) {

                        var args = [];

                        // value is not applicable for virtual column
                        if (!req.linz.model.grid.columns[column].virtual) {
                            args.push(records[index][column]);
                        }

                        args.push(records[index]);
                        args.push(column);
                        args.push(req.linz.model);
                        args.push(function (err, value) {

                            if (!err) {
                                records[index][column] = value;
                            }

                            return columnDone(err);

                        });

                        // call the cell renderer and update the content with the result
                        req.linz.model.grid.columns[column].renderer.apply(this,args);

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
