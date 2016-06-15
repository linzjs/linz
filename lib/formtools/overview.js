
var async = require('async'),
    cellRenderers = require('./renderers-cell');

function getOverviewFields(schema, form, selectedFields, record, model, callback) {

    var fieldsets = {},
        fields = {};

    selectedFields.forEach( function(fieldName) {

        var ref = form[fieldName];

        if (ref) {

            fields[fieldName] = {
                label: ref.label,
                type: ref.type,
                fieldset: ref.fieldset
            };

        }

    });

    async.eachSeries(Object.keys(fields), function (fieldName, cb) {

        var field = fields[fieldName],
            title = field.fieldset || '(No fieldset defined)',
            renderer = (cellRenderers[field.type]) ? field.type : 'text';

        fieldsets[title] = fieldsets[title] || [];

        cellRenderers[renderer](record[fieldName], record, fieldName, model, function (err, value) {

            if (err) {
                return cb(err);
            }

            fieldsets[title].push({

                label: field.label,
                value: value

            });

            return cb();
        });

    }, function (err) {
        return callback(err, fieldsets);
    });

}

module.exports = {
    getOverviewFields: getOverviewFields
};
