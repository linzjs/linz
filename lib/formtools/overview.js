
var async = require('async'),
    cellRenderers = require('./renderers-cell');

function getOverviewFields(labels, form, fieldsetCaption, selectedFields, record, model, callback) {

    var fieldset = {
        label: fieldsetCaption,
        fields: []
    };

    async.eachSeries(selectedFields, function (field, cb) {

        var formField = form[field];

        if (!formField) {
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
    getOverviewFields: getOverviewFields
};
