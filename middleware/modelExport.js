var linz = require('../'),
    async = require('async'),
    moment = require('moment');

const { isDate } = require('../lib/util');
const {
    boolean,
    date,
    referenceName,
} = require('../lib/formtools/renderers-cell');
const { getTransposeFn } = require('../lib/util');

const prettifyData = (req, fieldName, val) => new Promise((resolve, reject) => {

    if (typeof val === 'boolean') {

        return boolean(val, null, null, null, (err, result) => {

            if (err) {
                return reject(err);
            }

            return resolve(result);

        });

    }

    if (isDate(val)) {

        return date(val, null, null, null, (err, result) => {

            if (err) {
                return reject(err);
            }

            return resolve(result);

        });

    }

    if (val && req.linz.model.schema.tree[fieldName].ref) {

        return referenceName(val, null, fieldName, req.linz.model, (err, result) => {

            if (err) {
                return reject(err);
            }

            return resolve(result);

        });

    }

    return resolve(val);

});

var modelExportHelpers = function modelExportHelpers (req) {

    return {

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

            // retrieve the labels to provide a list of fields to choose from
            req.linz.model.getLabels((labelErr, labels) => {

                if (labelErr) {
                    return next(labelErr);
                }

                var excludedFieldNames = req.linz.export.exclusions.concat(',__v').split(','),
                    fieldLabels = {};

                // get a list of field names
                req.linz.model.schema.eachPath(function (pathname) {

                    if (excludedFieldNames.indexOf(pathname) >= 0) {
                        // exit if current field name is one of the exclusion fields
                        return;
                    }

                    if (!labels[pathname]) {
                        throw new Error(`Could not find ${pathname} field in the labels object.`);
                    }

                    // get a list of fields by the label ready for sorting
                    fieldLabels[labels[pathname]] = pathname;

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

        asyncFn.push((cb) => {

            linz.api.middleware.getFilters(req)
                .then((filters) => cb(null, filters))
                .catch(cb);

        });
        asyncFn.push(helpers.getForm);
        asyncFn.push(helpers.getList);

        // get the actual export object
        asyncFn.push(function (filters, form, list, callback) {

            // retrieve the export
            var _export = getExport(list.export);
            _export.fields = {};

            return callback(null, filters, form, list, _export);

        });

        asyncFn.push(function (filters, form, list, exportObj, cb) {
            return req.linz.model.getLabels((err, labels) => cb(err, filters, form, list, exportObj, labels));
        });

        async.waterfall(asyncFn, function (err, filters, form, list, exportObj, labels) {

            if (err) {
                return next(err);
            }

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

                req.linz.model.listQuery(req, query, (listQueryErr, listQuery) => {

                    if (listQueryErr) {
                        return next(listQueryErr);
                    }

                    const exportQuery = listQuery.select(filterFieldNames.join(' '));
                    const columnsFn = exportObj.columns || ((columns) => columns);

                    linz.api.util.generateExport({
                        columns: columnsFn(fields.map((fieldName) => ({
                            key: fieldName,
                            header: labels[fieldName],
                        }))),
                        contentType: 'text/csv',
                        name: `${Model.linz.formtools.model.plural}-${moment(Date.now()).format('l').replace(/\//g, '.', 'g')}`,
                        req,
                        res,
                        stream: exportQuery.lean().cursor(),
                        transform: (doc, callback) => {

                            const fields = Object.keys(doc);
                            const promises = [];

                            fields.forEach((fieldName) => {

                                if (getTransposeFn(form, fieldName, 'export')) {

                                    return promises.push(getTransposeFn(form, fieldName, 'export')(doc[fieldName], doc)
                                        .then((result) => {

                                            const updatedDoc = doc;
                                            let val = result;
                                            let merge = false;

                                            if (Array.isArray(val)) {
                                                [val, merge = false] = val;
                                            }

                                            if (!merge) {
                                                return (doc[fieldName] = val);
                                            }

                                            return (doc = Object.assign({}, updatedDoc, val));

                                        }));

                                }

                                return promises.push(prettifyData(req, fieldName, doc[fieldName])
                                    .then((val) => (doc[fieldName] = val)));

                            });

                            Promise.all(promises)
                                .then(() => callback(null, doc))
                                .catch(callback);

                        },
                    });

                });

            });

        });

    }
};
