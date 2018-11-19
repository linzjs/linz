var linz = require('../'),
    async = require('async'),
    moment = require('moment');

let useLocalTime = false;
let dateFormat = false;

const {
    isDate,
} = require('../lib/util');

const {
    arrayRenderer,
    booleanRenderer,
    dateRenderer,
    referenceRenderer,
} = require('../lib/renderers');

const prettifyData = (req, fieldName, val) => {

    if (typeof val === 'boolean') {
        return booleanRenderer(val);
    }

    if (isDate(val)) {

        return dateRenderer(val, {
            format: (typeof dateFormat === 'string') && dateFormat,
            offset: (useLocalTime && linz.api.session.getTimezone(req)) || 0,
        });

    }

    if (Array.isArray(val)) {
        return arrayRenderer(val);
    }

    if (req.linz.model.schema.tree[fieldName].ref) {

        return referenceRenderer(val, {
            link: false,
            model: linz.mongoose.models[req.linz.model.schema.tree[fieldName].ref],
        });

    }

    return Promise.resolve(val);

};

var modelExportHelpers = function modelExportHelpers (req) {

    return {

        getFilters: function getFilters (cb) {

            if (!req.body.filters.length) {
                return cb(null, {});
            }

            var Model = req.linz.model,
                form = JSON.parse(req.body.filters);

            // check if there are any filters in the form post
            if (!form.selectedFilters) {
                return cb(null, {});
            }

            async.waterfall([

                function (callback) {

                    Model.getList(req, function (err, list) {

                        if (err) {
                            return cb(err);
                        }

                        return callback(null, list);

                    });
                },

                function (list, callback) {

                    var filters = {};

                    async.each(form.selectedFilters.split(','), function (fieldName, filtersDone) {

                        // call the filter renderer and update the content with the result
                        list.filters[fieldName].filter.filter(fieldName, form, function (err, result) {

                            if (err) {
                                return filtersDone(err);
                            }

                            filters = Model.addSearchFilter(filters, result);

                            return filtersDone(null);

                        });

                    }, function (err) {

                        if (err) {
                            return cb(err);
                        }

                        // consolidate filters into query
                        if (Object.keys(filters).length) {
                            filters = Model.setFiltersAsQuery(filters);
                        }

                        return callback(err, filters);

                    });

                }

            ]);

        },

        addIdFilters: function addIdFilters (filters, cb) {

            if (!req.body.selectedIds.length) {
                return cb(null, filters);
            }

            filters = filters || { '$and': [] };
            filters.$and = filters.$and || [];

            var ids = [],
                db  = linz.mongoose.connection.db;

            // compile ids into ObjectId type
            req.body.selectedIds.split(',').forEach(function (id) {
                ids.push(new db.bsonLib.ObjectID(id));
            });

            // let's add selected Ids to the filters
            filters.$and.push({
                _id: { $in: ids}
            });

            return cb(null, filters);

        },

        getForm: function getForm(filters, cb) {

            req.linz.model.getForm(req, function (err, form) {
                return cb(err, filters, form);
            });

        },

        getList: function getList (filters, form, cb) {

            req.linz.model.getList(req, function (err, list) {
                return cb(err, filters, form, list);
            });

        }

    };

};

// this will retrieve the export object, using Linz's default export handler amongst custom export handlers
// this is based on the knowledge that only Linz's default export handler can have an `action` of `export`
// `exports` should be model.list.export
var getExport = function (exports) {

    var exp = undefined;

    // retrieve the export object
    exports.forEach(function (_export) {

        // Linz's default export function is called export
        if (_export.action && _export.action === 'export') {
            exp = _export;
        }

    });

    // if the export object could not be found, throw an error
    if (!exp) {
        throw new Error('The export was using Linz default export method, yet the model\'s list.export object could not be found.');
    }

    return exp;

}

module.exports = {

    get: function (req, res, next) {

        req.linz.model.getList(req, function (err, list) {

            if (err) {
                return next(err);
            }

            // attach our list object to the model
            req.linz.model.list = list;

            // retrieve the export object
            req.linz.export = getExport(list.export);
            req.linz.export.fields = {};

            // retrieve the form to provide a list of fields to choose from
            req.linz.model.getForm(req, function (formErr, form){

                if (formErr) {
                    return next(formErr);
                }

                var excludedFieldNames = req.linz.export.exclusions.concat(',__v').split(','),
                    fieldLabels = {};

                // get a list of field names
                req.linz.model.schema.eachPath(function (pathname) {

                    if (excludedFieldNames.indexOf(pathname) >= 0) {
                        // exit if current field name is one of the exclusion fields
                        return;
                    }

                    if (!form[pathname]) {
                        throw new Error(`Could not find ${pathname} field in the labels array.`);
                    }

                    // get a list of fields by the label ready for sorting
                    fieldLabels[form[pathname].label] = pathname;

                });

                // sort fields by label
                var sortedFieldsByLabel = Object.keys(fieldLabels).sort();

                // iterate through sorted label and re-constructs in the order of labels
                sortedFieldsByLabel.forEach(function (label) {
                    req.linz.export.fields[fieldLabels[label]] = label;
                });

                return next(null);

            });

        });

    },

    post: function (req, res, next) {

        var Model = req.linz.model;

        // since a custom export function is not defined for model, use local export function
        var asyncFn = [],
            helpers = modelExportHelpers(req);

        asyncFn.push(helpers.getFilters);
        asyncFn.push(helpers.addIdFilters);
        asyncFn.push(helpers.getForm);
        asyncFn.push(helpers.getList);

        // get the actual export object
        asyncFn.push(function (filters, form, list, callback) {

            // retrieve the export
            var _export = getExport(list.export);
            _export.fields = {};

            return callback(null, filters, form, list, _export);

        });

        async.waterfall(asyncFn, function (err, filters, form, list, exportObj) {

            if (err) {
                return next(err);
            }

            useLocalTime = exportObj && exportObj.useLocalTime;
            dateFormat = exportObj && exportObj.dateFormat;

            var fields = req.body.selectedFields.split(','),
                refFieldNames = [],
                filterFieldNames = [];

            fields.forEach(function (fieldName, index, arr) {

                // remove any property that doesn't exist in the model
                if (!Model.schema.tree[fieldName]) {
                    return arr.splice(index, 1);
                }

                // check if there any ref fields selected to be exported
                if(!Model.schema.tree[fieldName].ref) {
                    return;
                }

                return refFieldNames.push(fieldName);

            });

            // check if _id is excluded
            if (exportObj.exclusions.indexOf('_id') >= 0) {
                filterFieldNames.push('-_id');
            }

            filterFieldNames = filterFieldNames.concat(fields);

            // pipe data to response stream
            req.linz.model.getQuery(req, filters, function getQuery (err, query) {

                if (err) {
                    return next(err);
                }

                const exportQuery = query.select(filterFieldNames.join(' '))
                    .populate(refFieldNames.join(' '), '-_id -__v -dateCreated -dateModified -createdBy -modifiedBy');

                linz.api.util.generateExport({
                    contentType: 'text/csv',
                    format: results => new Promise((resolve, reject) => {

                        // Wrap the doc in an array if it only returns a single document.
                        const docs = [].concat(results);

                        // Generate the header rows using the form label.
                        const headers = fields.map(fieldName => form[fieldName] && form[fieldName].label);

                        // The docs coming from the db can be in a different order, re-arrange them so they match with the headers.
                        const sortedDocs = docs.map(doc => {

                            const sortedDoc = {};

                            fields.forEach(fieldName => sortedDoc[fieldName] = doc[fieldName]);

                            return sortedDoc;

                        });

                        // Generate the cells using the default render or transpose function if provided.
                        Promise.all(sortedDocs.map((doc) => new Promise((rowResolve, rowReject) => {

                            const row = {};

                            Promise.all(fields.map((fieldName) => {

                                // Support an additional context layer.
                                if (form[fieldName].transpose && form[fieldName].transpose.export) {

                                    // For backwards compatibility, wrap in a promise function.
                                    return Promise.resolve(form[fieldName].transpose.export(doc[fieldName], doc))
                                        .then(val => row[fieldName] = val);

                                }

                                // Support a transpose function.
                                if (form[fieldName].transpose) {

                                    // For backwards compatibility, wrap in a promise function.
                                    return Promise.resolve(form[fieldName].transpose(doc[fieldName], doc))
                                        .then(val => row[fieldName] = val);

                                }

                                return prettifyData(req, fieldName, doc[fieldName])
                                    .then(val => row[fieldName] = val);

                            }))
                                .then(() => {

                                    // The promises can resolve at different times, causing the headers and rows to be out of sync.
                                    // This fixes that issue so the headers match with the cell values.
                                    const orderedRow = [];

                                    fields.forEach(fieldName => orderedRow.push(row[fieldName]))

                                    return rowResolve(orderedRow.join(', '));

                                })
                                .catch(rowReject);

                        })))
                            .then(rows => resolve(`${headers.join(', ')}\n${rows.join('\n')}`))
                            .catch(reject);

                    }),
                    name: `${Model.linz.formtools.model.plural}-${moment(Date.now()).format('l').replace(/\//g, '.', 'g')}`,
                    query: exportQuery,
                    req,
                    res,
                });

            });

        });

    }
};
