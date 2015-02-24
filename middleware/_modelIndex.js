var async = require('async');

module.exports = function  (req, res, next) {

    return {

        getModelIndex: function getModelIndex () {

            // set up session control
            var session = req.session[req.params.model] = req.session[req.params.model] || {};
            session.grid = session.grid || {};
            session.grid.formData = session.grid.formData || {};

            if (Object.keys(req.body).length) {
                session.grid.formData = req.body;
            }

            var records = [],
                filters = {},
                totalRecords = 0,
                pageSize = linz.get('page size'),
                pageIndex = session.grid.formData.page || 1;

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
                        pageSize = session.grid.formData.pageSize || req.linz.model.grid.paging.size;

                        // holder for the sortingBy value
                        req.linz.model.grid.sortingBy = {};

                        cb(err);

                    });

                },
                // check if there are toolbar items required
                function (cb) {

                    if (!req.linz.model.grid.toolbarItems.length) {
                        return cb(null);
                    }

                    async.each(req.linz.model.grid.toolbarItems, function (item, itemDone) {

                        if (!item.renderer) {
                            return itemDone(null);
                        }

                        // this is a custom action, let's execute the function to get the HTML markup
                        item.renderer(function (err, html) {

                            if (err) {
                                return itemDone(err);
                            }

                            item.html = html;

                            return itemDone(null);
                        });

                    }, function (err) {
                        return cb(err);
                    });

                },

                // render the filters
                function (cb) {

                    async.each(Object.keys(req.linz.model.grid.filters), function (fieldName, filtersDone) {

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
                    if (!session.grid.formData.selectedFilters) {
                        return cb(null);
                    }

                    async.each(session.grid.formData.selectedFilters.split(','), function (fieldName, filtersDone) {

                        // call the filter binder to render active filter form controls with form value added
                        req.linz.model.grid.filters[fieldName].filter.bind(fieldName, session.grid.formData, function (err, result) {

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
                    if (!session.grid.formData.selectedFilters) {
                        return cb(null);
                    }

                    async.each(session.grid.formData.selectedFilters.split(','), function (fieldName, filtersDone) {

                        if (!session.grid.formData[fieldName]) {
                            return filtersDone(null);
                        }

                        // call the filter renderer and update the content with the result
                        req.linz.model.grid.filters[fieldName].filter.filter(fieldName, session.grid.formData, function (err, result) {

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

                    if (!session.grid.formData.sort && req.linz.model.grid.sortBy.length) {

                        req.linz.model.grid.sortingBy = req.linz.model.grid.sortBy[0];

                        // set default form sort
                        session.grid.formData.sort = req.linz.model.grid.sortingBy.field;

                    } else {

                        req.linz.model.grid.sortBy.forEach(function (sort) {
                            if (sort.field === session.grid.formData.sort || '-' + sort.field === session.grid.formData.sort) {
                                req.linz.model.grid.sortingBy = sort;
                            }
                        });

                    }

                    query.sort(session.grid.formData.sort);

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

                        // store the rendered content into a separate property
                        records[index]['rendered'] = {};

                        // loop through each column
                        async.each(Object.keys(req.linz.model.grid.columns), function (column, columnDone) {

                            var args = [];

                            // value is not applicable for virtual column
                            if (!req.linz.model.grid.columns[column].virtual) {
                                args.push(records[index][column]);
                            }

                            args.push(mongooseRecords[index]);
                            args.push(column);
                            args.push(req.linz.model);
                            args.push(function (err, value) {

                                if (!err) {
                                    records[index]['rendered'][column] = value;
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

                        async.each(Object.keys(records), function (index, recordDone) {

                            action.disabled(mongooseRecords[index], function (err, isDisabled, message) {

                                records[index].recordActions = records[index].recordActions || {};

                                records[index].recordActions[action.label] = {
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

                req.linz.model.formData = session.grid.formData;

                if (err && err.message === 'No records found') {
                    err = null;
                }

                // next middleware
                next(err);

            });

        } // end getModelIndex()

    }

}
