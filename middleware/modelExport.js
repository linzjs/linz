const linz = require('../');
const moment = require('moment');
const { deprecate } = require('util');

const { isDate } = require('../lib/util');
const {
    boolean,
    date,
    referenceName,
} = require('../lib/formtools/renderers-cell');
const { getTransposeFn } = require('../lib/util');

const promisify = (fn, callWith = []) => () => new Promise((resolve, reject) => {

    fn.apply(null, callWith.concat((err, form) => {

        if (err) {
            return reject(err);
        }

        return resolve(form);

    }));

});

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

// When deprecating this, also remove the following lines:
// plugin-helps.js#L361: exclusions: exp.exclusions || '_id,dateCreated,dateModified,createdBy,modifiedBy',
const getInclusionsFromExclusions = deprecate(function (exportObj, model) {

    const exclusions = (exportObj.exclusions || '').split(',');
    const inclusions = [];

    model.schema.eachPath(function (pathname) {

        const exclude = ['__v'].concat(exclusions);

        if (exclude.includes(pathname)) {
            return;
        }

        inclusions.push(pathname);

    });

    return inclusions;

}, 'Export exclusions have been deprecated, use inclusions instead.');

module.exports = {

    get: function (req, res, next) {

        const getLabels = promisify(req.linz.model.getLabels);
        const getList = promisify(req.linz.model.getList, [req]);

        Promise.all([
            getLabels(),
            getList(),
        ])
            .then(([labels, list]) => {

                // attach our list object to the model
                req.linz.model.list = list;

                // retrieve the export object
                req.linz.export = getExport(list.export);
                req.linz.export.fields = {};

                const includedFields = req.linz.export.inclusions.length > 0 ? req.linz.export.inclusions.split(',') : getInclusionsFromExclusions(req.linz.export, req.linz.model);

                const fieldLabels = {};
                const includedPaths = Object
                    .keys(req.linz.model.schema.paths)
                    .filter((key) => includedFields.includes(key));

                includedPaths.forEach(function (field) {

                    if (!labels[field]) {
                        throw new Error(`Could not find ${field} field in the labels object.`);
                    }

                    // get a list of fields by the label ready for sorting
                    fieldLabels[labels[field]] = field;

                });

                // sort fields by label
                var sortedFieldsByLabel = Object.keys(fieldLabels).sort();

                // iterate through sorted label and re-constructs in the order of labels
                sortedFieldsByLabel.forEach(function (label) {
                    req.linz.export.fields[fieldLabels[label]] = label;
                });

                return next(null);

            })
            .catch(next);

    },

    post: function (req, res, next) {

        var Model = req.linz.model;
        const getForm = promisify(req.linz.model.getForm, [req]);
        const getLabels = promisify(req.linz.model.getLabels);
        const getList = promisify(req.linz.model.getList, [req]);

        return Promise.all([
            getForm(),
            getLabels(),
            getList(),
            linz.api.formtools.list.getFilters(req),
        ])
            .then(([form, labels, list, filters]) => {

                const exportObj = getExport(list.export);
                const includedFields = exportObj.inclusions.length > 0 ? exportObj.inclusions.split(',') : getInclusionsFromExclusions(exportObj, Model);
                const bodyFields = req.body.selectedFields.split(',');
                const refFieldNames = [];
                const fields = [];

                // Maintain selected field order.
                bodyFields.forEach((field) => {
                    const index = includedFields.indexOf(field);

                    if (index >= 0) {
                        fields.push(includedFields[index]);
                    }
                });

                let filterFieldNames = [];

                fields.forEach(function (fieldName, index, arr) {

                    // check if there any ref fields selected to be exported
                    if(!Model.schema.tree[fieldName] || !Model.schema.tree[fieldName].ref) {
                        return;
                    }

                    return refFieldNames.push(fieldName);

                });

                // If _id is not included, exclude it from the export;
                if (!fields.includes('_id')) {
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
                        const formattedFields = fields
                            .map(fieldName => ({
                                header: labels[fieldName],
                                key: fieldName,
                            }));
                        const columns = columnsFn(formattedFields);

                        linz.api.util.generateExport({
                            columns,
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

            })
            .catch(next);

    }
};
