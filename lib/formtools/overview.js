
var async = require('async'),
    cellRenderers = require('./renderers-cell');


function getOverviewFields(schema, form, selectedFields, record, model, callback) {

    var fieldsets = {},
        fields = {};

    selectedFields.forEach( function(fieldName) {

        if (form[fieldName]) {

            fields[fieldName] = {
                label: form[fieldName].label,
                type: form[fieldName].type,
                fieldset: form[fieldName].fieldset
            };
        }

    });

    async.eachSeries(Object.keys(fields), function (fieldName, cb) {

        var field = fields[fieldName],
            title = field.fieldset || '(No fieldset defined)';

        fieldsets[title] = fieldsets[title] || [];

        var renderer = (cellRenderers[field.type]) ? field.type : 'text';

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
