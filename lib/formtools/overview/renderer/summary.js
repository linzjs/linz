var handlebars = require('handlebars'),
    templates = require('../../templates'),
    linz = require('../../../../'),
    async = require('async');

module.exports = function defaultSummaryRenderer (record, model, callback) {

    var locals = {},
        content,
        fields = linz.utils.clone(model.overview.summary.fields);

    async.each(Object.keys(fields), function (fieldName, valuesDone) {

        // call the cell renderer and update the content with the result
        fields[fieldName].renderer(record[fieldName], record, fieldName, model, function (err, value) {

            if (!err) {
                fields[fieldName].value = value;
            }

            return valuesDone(err);

        });

    }, function (err) {

        if (!err) {
            locals.fields = [];

            // pass fields as array in locals
            for (var fieldName in fields) {

                locals.fields.push({
                    label: fields[fieldName].label,
                    value: fields[fieldName].value
                });
            }

            locals.label = model.overview.summary.label;
            content = templates.overview.summary(locals);
        }

        return callback(err, content);

    });

}
