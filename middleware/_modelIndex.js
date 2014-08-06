var async = require('async');

module.exports = function  (req, res, next) {

    return {

        getModelIndex: function getModelIndex () {

            var records = [],
                filters = {},
                totalRecords = 0,
                pageSize = linz.get('page size'),
                pageIndex = req.body.page || 1;

            // set the model on linz
            req.linz.model = req.linz.get('models')[req.params.model];

            async.series([

                // grab the grid object and append it to the model, i.e. req.linz.model.grid.columns
                function (cb) {

                    req.linz.model.getGrid(function (err, grid) {

                        if (!err) {
                            req.linz.model.grid = grid;
                        }

                        // reset the pageSize value
                        pageSize = req.body.pageSize || req.linz.model.grid.paging.size;

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

                // count the docs
                function (cb) {

                    // consolidate filters into query
                    if (Object.keys(filters).length) {
                        filters = req.linz.model.setFiltersAsQuery(filters);
                    }

                    req.linz.model.count(filters, function (err, docs) {

                        if (!err) {
                            totalRecords = docs;
                        }

                        return cb(null);

                    });

                },

                // find the docs
                function (cb) {

                    var query = req.linz.model.find(filters);

                    // sort by the chosen sort field, or use the first sortBy option as the default
                    if (!req.body.sort && req.linz.model.grid.sortBy.length) {

                        query.sort(req.linz.model.grid.sortBy[0].field);

                    } else if (req.body.sort) {

                        query.sort(req.body.sort);

                    }

                    if (req.linz.model.grid.paging.active === true) {
                        // add in paging skip and limit
                        query.skip(pageIndex*pageSize-pageSize).limit(pageSize);
                    }

                    query.exec(function (err, docs) {

                        if (!err && docs.length === 0) {

                            return cb(new Error('No records found'));

                        }

                        if (!err) {

                            mongooseRecords = docs;
                            // convert mongoose documents to plain javascript objects
                            mongooseRecords.forEach(function (record) {
                                records.push(record.toObject({ virtuals: true}));
                            });

                        }

                        cb(err);

                    });

                },

                // check if each doc can be edited
                function (cb) {

                    // skip this if canEdit is not define for model
                    if (!mongooseRecords[0].canEdit) {
                        return cb(null);
                    }

                    async.each(Object.keys(mongooseRecords), function (index, recordDone) {

                        mongooseRecords[index].canEdit(function (err, result, message) {

                            if (err) {
                                return recordDone(err);
                            }

                            records[index].edit = { disabled: !result, message: message };

                            return recordDone(null);

                        });

                    }, function (err) {

                        cb(err);

                    });

                },

                // check if each doc can be deleted
                function (cb) {

                    // skip this if canEdit is not define for model
                    if (!mongooseRecords[0].canDelete) {
                        return cb(null);
                    }

                    async.each(Object.keys(mongooseRecords), function (index, recordDone) {

                        mongooseRecords[index].canDelete(function (err, result, message) {

                            if (err) {
                                return recordDone(err);
                            }

                            records[index].delete = { disabled: !result, message: message };

                            return recordDone(null);

                        });

                    }, function (err) {

                        cb(err);

                    });

                },

                // create the values for the datagrids for each doc
                function (cb) {

                    // loop through each record
                    async.each(Object.keys(records), function (index, recordDone) {

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

                },

                // check if we need to process each record again record actions
                function (cb) {

                    if (!req.linz.model.grid.recordActions.length) {
                        return cb(null);
                    }

                    async.each(req.linz.model.grid.recordActions, function (action, actionDone) {

                        if (!action.disabled) {
                            return actionDone(null);
                        }

                        if (typeof action.disabled !== 'function') {
                            throw new Error('Invalid type for record.action.disabled. It must be a function');
                        }

                        async.each(records, function (record, recordDone) {

                            action.disabled(record, function (err, isDisabled, message) {

                                record.recordActions = record.recordActions || {};

                                record.recordActions[action.label] = {
                                    disabled: isDisabled,
                                    message: message
                                };

                                return recordDone(null);

                            });

                        }, function (err) {

                            return actionDone(err);

                        });


                    }, function (err) {

                        return cb(err);

                    });
                }

            ], function (err, result) {

                // map the update records to linz
                req.linz.records = {
                    records: records,
                    page: pageIndex,
                    total: totalRecords,
                    pages: Math.ceil(totalRecords/pageSize),
                    pageSize: pageSize
                };

                req.linz.model.formData = req.body;

                // add session control data
                req.session[req.params.model] = req.session[req.params.model] || {};
                req.session[req.params.model].grid = req.linz.model.grid;
                req.session[req.params.model].records = req.linz.records;
                req.session[req.params.model].formData = req.linz.model.formData;

                if (err && err.message === 'No records found') {
                    err = null;
                }

                // next middleware
                next(err);

            });

        } // end getModelIndex()

    }

}
