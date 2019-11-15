'use strict';

const linz = require('../');
const async = require('async');
const deep = require('deep-diff');
const moment = require('moment');

const { deprecate } = require('util');
const { getTransposeFn } = require('../lib/util');

const hasValue = (val) => {

    if (typeof val === 'undefined' || val === '' || val === null || val === '[]' || (Array.isArray(val) && val.length === 0) || (Array.isArray(val) && val.length === 1 && val[0] === '')) {
        return false;
    }

    return true;

};

const updateNumber = ({ data, fieldName, theirChange, yourChange }) => {

    data.theirChange[fieldName] = parseFloat(theirChange[fieldName]);
    data.yourChange[fieldName] = parseFloat(yourChange[fieldName]);

    if (isNaN(data.theirChange[fieldName])) {
        data.theirChange[fieldName] = '';
    }

    if (isNaN(data.yourChange[fieldName])) {
        data.yourChange[fieldName] = '';
    }

};

const updateBoolean = ({ data, fieldName, theirChange, yourChange }) => {

    data.theirChange[fieldName] = '';
    data.yourChange[fieldName] = '';

    if (hasValue(theirChange[fieldName])) {
        data.theirChange[fieldName] = theirChange[fieldName].toString();
    }

    if (hasValue(yourChange[fieldName])) {
        data.yourChange[fieldName] = yourChange[fieldName].toString();
    }

};

const updateDate = ({ data, fieldName, theirChange, yourChange }) => {

    data.theirChange[fieldName] = '';
    data.yourChange[fieldName] = '';

    if (hasValue(theirChange[fieldName])) {
        data.theirChange[fieldName] = moment(new Date(theirChange[fieldName])).format('YYYY-MM-DD');
    }

    if (hasValue(yourChange[fieldName])) {
        data.yourChange[fieldName] = moment(new Date(yourChange[fieldName])).format('YYYY-MM-DD');
    }

};

const updateDocumentArray = ({ data, fieldName, theirChange, yourChange }) => {

    data.yourChange[fieldName] = yourChange[fieldName];
    data.theirChange[fieldName] = JSON.stringify(theirChange[fieldName]);

};

const updateArray = ({ data, fieldName, theirChange, yourChange }) => {

    data.yourChange[fieldName] = [];
    data.theirChange[fieldName] = [];

    if (hasValue(yourChange[fieldName])) {

        // Handle when array field contains only one value which is not of type array
        data.yourChange[fieldName] = yourChange[fieldName];

        if (!Array.isArray(data.yourChange[fieldName])) {
            data.yourChange[fieldName] = data.yourChange[fieldName].split();
        }

    }

    if (hasValue(theirChange[fieldName])) {
        data.theirChange[fieldName] = theirChange[fieldName];
    }

};

const updateData = ({ data, fieldName, form, schema, theirChange, yourChange }) => {

    const type = form[fieldName] && form[fieldName].type || schema.paths[fieldName].type;

    if (type === 'number') {
        return updateNumber({ data, fieldName, theirChange, yourChange });
    }

    if (['boolean', 'objectid'].includes(type)) {
        return updateBoolean({ data, fieldName, theirChange, yourChange });
    }

    if (type === 'date') {
        return updateDate({ data, fieldName, theirChange, yourChange });
    }

    if (type === 'documentarray') {
        return updateDocumentArray({ data, fieldName, theirChange, yourChange });
    }

    if (type === 'array') {
        return updateArray({ data, fieldName, theirChange, yourChange });
    }

    data.yourChange[fieldName] = yourChange[fieldName];
    data.theirChange[fieldName] = theirChange[fieldName];

};

const sanitiseData = (model, exclusions, yourChange, theirChange) => new Promise((resolve, reject) => {

    const promises = [];
    const data = {
        theirChange: {},
        yourChange: {},
    };
    const { form } = model;

    model.schema.eachPath((fieldName) => {

        if (Object.prototype.hasOwnProperty.call(exclusions, fieldName)) {
            return;
        }

        if (fieldName === '__v') {

            data.yourChange.versionNo = yourChange.versionNo;
            // eslint-disable-next-line no-underscore-dangle
            data.theirChange.versionNo = theirChange.__v;

            return;

        }

        const transposeFn = getTransposeFn(form, fieldName, 'form');

        // If transpose is defined for this field, let's transpose their change so it can compare in the correct format on client side
        if (transposeFn) {

            let transposeResult = transposeFn(theirChange[fieldName], theirChange);

            if (!(transposeResult instanceof Promise)) {
                transposeResult = Promise.resolve(deprecate(() => transposeResult, 'Transposing a field without returning a promise has been deprecated.')());
            }

            promises.push(transposeResult.then(result => (theirChange[fieldName] = result)));

        }

        updateData({ data, fieldName, form, schema: model.schema, theirChange, yourChange });

    });

    return Promise.all(promises)
        .then(() => resolve(data))
        .catch(reject);

});

module.exports = (req, res, next) => {

    const { model } = req.linz;
    const ccSettings = model.concurrencyControl;
    const formData = req.body;
    const resData = { hasChanged: false };
    const exclusionFields = {};

    ccSettings.settings.exclusions.forEach((fieldName) => {
        exclusionFields[fieldName] = 0;
    });

    // Exclude fields that are not editable.
    if (model.linz.formtools.form) {

        Object.keys(model.linz.formtools.form).forEach((fieldName) => {

            if (model.linz.formtools.form[fieldName].edit && model.linz.formtools.form[fieldName].edit.disabled) {
                exclusionFields[fieldName] = 0;
            }

        });

    }

    // Remove modifiedByProperty field if it exists in exclusion fields.
    delete exclusionFields[ccSettings.modifiedByProperty];

    async.waterfall([

        (cb) => {

            model.findById(req.params.id, exclusionFields, { lean: 1 }, (err, doc) => {

                if (err) {
                    return cb(err);
                }

                return cb(null, doc);

            });
        },

        (doc, cb) => {

            if (!doc) {
                return cb(null);
            }

            ccSettings.modifiedByCellRenderer(doc[ccSettings.modifiedByProperty], doc, ccSettings.modifiedByProperty, model, (err, result) => {

                if (err) {
                    return cb(err);
                }

                doc[ccSettings.modifiedByProperty] = result;

                return cb(null, doc);

            });

        },

    ], (err, result) => {

        if (err) {
            return next(linz.api.error.json(err));
        }

        if (!result) {
            return res.status(200).json(resData);
        }

        sanitiseData(model, exclusionFields, formData, result)
            .then(({ yourChange, theirChange }) => {

                // Check if version number for yourChange and theirChange, if it is the same, no changes occurred, exit!
                // Also check if version number from form request is the same as yourChange, this means the conflict has been resolved, exit!
                if (parseInt(yourChange.versionNo, 10) === parseInt(theirChange.versionNo, 10) || (req.params.versionNo && parseInt(req.params.versionNo, 10) === parseInt(theirChange.versionNo, 10))) {

                    return res.status(200).json(resData);

                }

                // Let's do a diff for the fields changed.
                const diffResult = deep.diff(theirChange, yourChange, (path, key) => {

                    if (key === 'versionNo') {

                        return true;

                    }

                });

                if (!diffResult || (diffResult.length === 1 && diffResult[0].path && diffResult[0].path[0] === 'modifiedBy')) {

                    // Exit if there is not diff result or if diff result only contains the modifiedBy field.
                    return res.status(200).json(resData);

                }

                const diffKeys = {};

                // Get a list of unique field names and it's type
                diffResult.forEach((diff) => {

                    let [fieldName] = diff.path;
                    let field = model.form && model.form[fieldName] || model.schema.paths[fieldName];

                    // Change fieldname to the related field defined in the relationship.
                    if (field && field.relationship) {
                        fieldName = field.relationship;
                    }

                    if (!diffKeys[fieldName]) {
                        diffKeys[fieldName] = field.type;
                    }

                });

                resData.hasChanged = true;
                resData.theirChange = theirChange;
                resData.yourChange = yourChange;
                resData.diff = diffKeys;

                return res.status(200).json(resData);

            })
            .catch(caughtErr => next(linz.api.error.json(caughtErr)));

    });

};
