var linz = require('../'),
    async = require('async'),
    formtoolsAPI = require('../lib/api/formtools'),
    clone = require('clone'),
    dedupe = require('dedupe'),
    escapeStringRegexp = require('escape-string-regexp');

module.exports = function  (req, res, next) {

    const isDevelopment = process.env.NODE_ENV === 'development';
    let body = req.body;
    let queryErrorCount = 0;

    // set up session control
    var session = req.session[req.params.model] = req.session[req.params.model] || {};
        session.list = session.list || {};
        session.list.formData = session.list.formData || {};

    // Store the previous version of the selectedFilters
    session.list.previous = { formData: session.list.formData || {} };

    // Use the incoming form post for filter, paging, and sorting information.
    if (Object.keys(body).length) {
        session.list.formData = body;
    }

    /**
     * This method should be executed when a query error is returned.
     * It will abort the current query and return the results of the previous query instead.
     * @return {Void}
     */
    function handleQueryError (err) {

        queryErrorCount++;

        // Something has gone terribly wrong. Break from loop.
        if (queryErrorCount > 1) {

            // Reset all filters.
            session.list.formData = {};

            // Notify the user that an error has occured.
            req.linz.notifications.push(linz.api.views.notification({
                text: 'One of the filters is repeatedly generating an error. All filters have been removed.',
                type: 'error'
            }));

            // Rerun the query at the last known working state.
            // eslint-disable-next-line no-use-before-define
            return getModelIndex();

        }

        // Reset the last known working state.
        session.list.formData = session.list.previous.formData;

        // If we're in development mode, return the error
        // so that the developers are aware of it and can fix it.
        if (isDevelopment) {
            return next(err);
        }

        // Notify the user that an error has occured.
        req.linz.notifications.push(linz.api.views.notification({
            text: 'An error has occured with one of the filters you added. It has been removed.',
            type: 'error'
        }));

        // Rerun the query at the last known working state.
        // eslint-disable-next-line no-use-before-define
        return getModelIndex();

    }

    /**
     * Use this method to completely render the index.
     * @return {Void}
     */
    function getModelIndex () {

        var records = [],
            filters = {},
            refColData = {},
            totalRecords = 0,
            pageSize = Number(linz.get('page size')),
            pageIndex = Number(session.list.formData.page || 1),
            query,
            mongooseRecords;

        // cloned a copy of list settings and append it to the request model
        req.linz.model.list = clone(req.linz.model.linz.formtools.list);

        // reset the pageSize value
        pageSize = Number(session.list.formData.pageSize || req.linz.model.list.paging.size);

        // holder for the sortingBy value
        req.linz.model.list.sortingBy = {};

        async.series([

            // check if there are toolbar items required
            function (cb) {

                formtoolsAPI.list.renderToolbarItems(req, res, req.params.model, function (err, result) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.model.list.toolbarItems = result;

                    return cb(null);

                });

            },

            // render the filters
            function (cb) {

                // check if we need to render the filters
                if (!Object.keys(req.linz.model.list.filters).length) {
                    return cb(null);
                }

                formtoolsAPI.list.renderFilters(req, req.params.model, function (err, result) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.model.list.filters = result;

                    return cb(null);
                });

            },

            // Add in alwaysOn filters that have default values, that aren't already present.
            function (cb) {

                const filters = req.linz.model.list.filters;
                const formData = session.list.formData;

                // Make sure we have some filters.
                if (!filters) {
                    return cb(null);
                }

                // Find the alwaysOn filters, that have a default.
                const alwaysOnWithDefault = Object.keys(filters).filter((key) => filters[key].alwaysOn === true && Object.keys(filters[key]).includes('default'));

                if (!alwaysOnWithDefault) {
                    return cb(null);
                }

                // If it already exists, turn it into an array for easy manipulation.
                if (formData.selectedFilters && formData.selectedFilters.length) {
                    formData.selectedFilters = formData.selectedFilters.split(',');
                }

                // If it doesn't exist create a default array.
                if (!formData.selectedFilters || !formData.selectedFilters.length) {
                    formData.selectedFilters = [];
                }

                // Make sure the alwaysOnWithDefault filters have entries in session.list.formData.selectedFilters.

                alwaysOnWithDefault.forEach((key) => {

                    const filter = filters[key];

                    if (!formData.selectedFilters.includes(key)) {

                        // Add to the selected filters list.
                        formData.selectedFilters.push(key);

                        formData[key] = filter.default;

                    }

                });

                formData.selectedFilters = formData.selectedFilters.join(',');

                return cb(null);

            },

            // render the active filters
            function (cb) {

                req.linz.model.list.activeFilters = {};

                // check if there are any filters in the form post
                if (!session.list.formData.selectedFilters) {
                    return cb(null);
                }

                formtoolsAPI.list.getActiveFilters(req, session.list.formData.selectedFilters.split(','), session.list.formData, req.params.model, function (err, result) {

                    if (err) {
                        return cb(err);
                    }

                    req.linz.model.list.activeFilters = result;

                    return cb(null);
                });

            },

            // get the filters
            function (cb) {

                // check if there are any filters in the form post
                if (!session.list.formData.selectedFilters) {
                    return cb(null);
                }

                formtoolsAPI.list.renderSearchFilters(req, session.list.formData.selectedFilters.split(','), session.list.formData, req.params.model, function (err, result) {

                    if (err) {
                        return cb(err);
                    }

                    filters = result;

                    return cb(null);

                });

            },

            // add the seach filters
            function (cb) {

                if (!session.list.formData.search || !session.list.formData.search.length || !req.linz.model.list.search || !Array.isArray(req.linz.model.list.search)) {
                    return cb(null);
                }

                // Default the `$and` key.
                if (!filters.$and) {
                    filters.$and = [];
                }

                async.map(req.linz.model.list.search, (field, fieldCallback) => {

                    linz.api.model.titleField(req.params.model, field, (err, titleField) => {

                        if (err) {
                            return fieldCallback(err);
                        }

                        fieldCallback(null, linz.api.query.fieldRegexp(titleField, session.list.formData.search));

                    });

                }, (err, $or) => {

                    filters.$and.push({ $or });

                    return cb(null);

                });

            },

            // create the query
            function (cb) {

                req.linz.model.getQuery(req, filters, function (err, result) {

                    if (err) {
                        return cb(err);
                    }

                    query = result;

                    return cb(null);

                });

            },

            // minimise the fields we're selecting
            function (cb) {

                let fields = Object.keys(req.linz.model.list.fields);

                // Work in the title field
                linz.api.model.titleField(req.params.model, 'title', (err, titleField) => {

                    if (err) {
                        return cb(err);
                    }

                    fields.push(titleField);

                    const select = fields.join(' ');

                    query.select(select);

                    // If they've provided the `listQuery` static, use it to allow customisation of the fields we'll retrieve.
                    if (!req.linz.model.listQuery) {
                        return cb();
                    }

                    req.linz.model.listQuery(req, query, cb);

                });

            },

            // get page total
            function (cb) {

                req.linz.model.getCount(req, query, function (err, countQuery) {

                    if (err) {
                        return cb(err);
                    }

                    countQuery.exec(function (countQueryErr, count) {

                        // A query error has occured, let's short circuit this entire process
                        // and start again from the last known working state.
                        if (countQueryErr) {
                            return handleQueryError(countQueryErr);
                        }

                        if (!countQueryErr && count === 0) {
                            return cb(new Error('No records found'));
                        }

                        if (!countQueryErr) {
                            totalRecords = count;
                        }

                        return cb(countQueryErr);

                    });


                });

            },

            // find the docs
            function (cb) {

                if (!session.list.formData.sort && req.linz.model.list.sortBy.length) {

                    req.linz.model.list.sortingBy = req.linz.model.list.sortBy[0];

                    // set default form sort
                    session.list.formData.sort = `-${req.linz.model.list.sortingBy.field}`;

                } else {

                    req.linz.model.list.sortBy.forEach(function (sort) {
                        if (sort.field === session.list.formData.sort || '-' + sort.field === session.list.formData.sort) {
                            req.linz.model.list.sortingBy = sort;
                        }
                    });

                }

                query.sort(session.list.formData.sort);

                if (req.linz.model.list.paging.active === true) {
                    // add in paging skip and limit
                    query.skip(pageIndex*pageSize-pageSize).limit(pageSize);
                }

                query.exec(function (err, docs) {

                    // A query error has occured, let's short circuit this entire process
                    // and start again from the last known working state.
                    if (err) {
                        return handleQueryError(err);
                    }

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

                    mongooseRecords[index].canEdit(req, function (err, result, message) {

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

                    mongooseRecords[index].canDelete(req, function (err, result, message) {

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

            function (cb) {

                // Determine if there are any fields with refs
                for (let field in req.linz.model.list.fields) {

                    // Support multiple types ref fields.

                    if (req.linz.model.schema.tree[field] && req.linz.model.schema.tree[field].ref) {

                        // Get the records.
                        // Start by filtering records which have valid ObjectIds (support multiple types of reference fields).
                        // Then deduplicate them using a custom hashing function.
                        refColData[field] = {
                            records: dedupe(records.filter(record => !(!record[field]) && linz.api.model.getObjectIdFromRefField(record[field]) instanceof linz.mongoose.Types.ObjectId), record => linz.api.model.getObjectIdFromRefField(record[field]).toString())
                        };

                        // Now get the values.
                        refColData[field].values = refColData[field].records.map(record => linz.api.model.getObjectIdFromRefField(record[field]));

                    }

                }

                // Now we have the objectIds, asynchronously loop through them
                // and retrieve the actual values from the database.
                async.each(Object.keys(refColData), function (field, fieldDone) {

                    let args = [
                        refColData[field].values,
                        refColData[field].records,
                        field,
                        req.linz.model,
                        function (err, value) {

                            refColData[field].rendered = value;

                            return fieldDone(err);

                        }
                    ];

                    // Call the cell renderer and update the content with the result.
                    // val, record, fieldname, model, callback
                    linz.formtools.cellRenderers.reference.apply(null, args);

                }, function (err) {

                    if (err) {
                        return cb(err);
                    }

                    return cb();

                });

            },

            // create the values for the datalists for each doc
            function (cb) {

                // loop through each record
                async.each(Object.keys(records), function (index, recordDone) {

                    // store the rendered content into a separate property
                    records[index]['rendered'] = {};

                    // loop through each field
                    async.each(Object.keys(req.linz.model.list.fields), function (field, fieldDone) {

                        // Skip this field if we have a falsy value
                        if (!req.linz.model.list.fields[field]) {
                            return fieldDone();
                        }

                        // If we have a reference field, data has been pre-rendered.
                        // Let's grab it from there.
                        if (req.linz.model.schema.tree[field] && req.linz.model.schema.tree[field].ref) {

                            // The default value, but could be replaced below if the conditions are right.
                            records[index]['rendered'][field] = records[index][field];


                            // Do we have a rendered result for this field in this particular record?
                            // Support multiple types ref fields.
                            if (refColData[field].rendered && records[index][field] && refColData[field].rendered[linz.api.model.getObjectIdFromRefField(records[index][field]).toString()]) {

                                records[index]['rendered'][field] = refColData[field].rendered[linz.api.model.getObjectIdFromRefField(records[index][field]).toString()];

                            }

                            // We're all done here.
                            return fieldDone();

                        }

                        // This will only execute if we don't have a ref field.

                        let args = [];

                        // value is not applicable for virtual field
                        if (!req.linz.model.list.fields[field].virtual) {
                            args.push(records[index][field]);
                        }

                        args.push(mongooseRecords[index]);
                        args.push(field);
                        args.push(req.linz.model);
                        args.push(function (err, value) {

                            if (!err) {
                                records[index]['rendered'][field] = value;
                            }

                            return fieldDone(err);

                        });

                        // call the cell renderer and update the content with the result
                        // val, record, fieldname, model, callback
                        req.linz.model.list.fields[field].renderer.apply(this, args);

                    }, function (err) {

                        recordDone(err);

                    });


                }, function (err) {

                    cb(err);

                });

            },

            // check if we need to process each record again record actions
            function (cb) {

                if (!req.linz.model.list.recordActions.length) {
                    return cb(null);
                }

                async.each(req.linz.model.list.recordActions, function (action, actionDone) {

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

            req.linz.model.formData = session.list.formData;

            if (err && err.message === 'No records found') {
                err = null;
            }

            // next middleware
            next(err);

        });

    }; // end getModelIndex()

    return { getModelIndex };

}
