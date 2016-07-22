
var async = require('async'),
    cellRenderers = require('./renderers-cell');

function body(req, res, record, model, overview, cb) {

    // if overview is function execute it and return the content
    if (typeof overview === 'function') {

        return overview(req, res, record, model, function (err, content) {

            if (err) {
                return cb(err);
            }

            return cb(null, {body: content});

        });

    }

    if (!(Array.isArray(overview) && overview.length)) {
        return cb(null, []);
    }

    var overviewBody = [];

    // loop through overview array, if body is a fuction, execute it to return the html content,
    // if  body has fields, render field values,
    // finally return the overview data
    async.eachSeries(overview, function (field, callback) {

        if (typeof field !== 'object') {
            return callback();
        }

        if (typeof field.body === 'function') {

            return field.body(req, res, record, model, function (err, content) {

                if (err) {
                    return callback(err);
                }

                overviewBody.push({
                    label: field.label,
                    body: content
                });

                return callback();

            });

        }

        // make recursive call, if field or field.body is an Array
        if (Array.isArray(field) || Array.isArray(field.body)) {

            var fieldOverview = (Array.isArray(field)) ? field : field.body;

            return body(req, res, record, model, fieldOverview, function (err, data) {

                if (err) {
                    return cb(err);
                }

                if (Array.isArray(data) && data.length) {

                    var fieldData = (Array.isArray(field)) ? data : { label: field.label, body: data };

                    overviewBody.push(fieldData);
                }

                return callback();
            });

        }

        if (Array.isArray(field.fields) && field.fields.length) {

            return renderFields(record, model, model.linz.formtools.labels, model.linz.formtools.form, field.label, field.fields, function (err, fieldset) {

                if (err) {
                    return callback(err);
                }

                overviewBody.push(fieldset);

                return callback();

            });

        }

        // return if field does not meet any of the above conditions
        return callback();

    }, function (err) {
        return cb(err, overviewBody);
    });

}

function renderFields(record, model, labels, form, fieldsetCaption, fields, callback) {

    var fieldset = {
        label: fieldsetCaption,
        fields: []
    };

    async.eachSeries(fields, function (field, cb) {

        var formField = form[field];

        if (!formField || !formField.visible) {
            return cb();
        }

        var renderer = (cellRenderers[formField.type]) ? formField.type : 'text',
            fieldLabel = labels[field] ? labels[field] : '';

        cellRenderers[renderer](record[field], record, field, model, function (err, value) {

            if (err) {
                return cb(err);
            }

            fieldset.fields.push({
                label: fieldLabel,
                value: value
            });

            return cb();
        });

    }, function (err) {
        return callback(err, fieldset);
    });

}

module.exports = {
    body: body,
    renderFields: renderFields
};
