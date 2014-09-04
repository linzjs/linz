var cellRenderers = require('./');

module.exports = function documentArrayRenderer (val, record, fieldName, model, callback) {

    // get form configurations
    model.schema.tree[fieldName][0].statics.getForm(function (err, form) {

        var content = '',
            tableHeading = [],
            heading = '';

        async.eachSeries(record[fieldName], function (field, cb) {

            var table = '';

            if (field.__parentArray) {
                // this is a mongoose record, let's convert to object literal
                field = field.toObject({ virtuals: true});
            }

            async.eachSeries(Object.keys(field), function (key, fieldValueDone) {

                if (key === '_id' || key === 'id') {
                    return fieldValueDone(null);
                }

                table += '<tr><td>' + form[key].label + '</td>';

                // mimic the format expected for model
                var embeddedModel = {
                    schema: model.schema.tree[fieldName][0]
                };

                // render field value
                cellRenderers.default(field[key], field, key, embeddedModel, function (err, value) {

                    if (err) {
                        return fieldValueDone(err);
                    }

                    table += '<td>' + value + '</td></tr>';

                    return fieldValueDone(null);

                });

            }, function (err) {

                if (err) {
                    return fieldValueDone(err);
                }

                // turn content to table
                table = '<table class="table table-bordered"><tr><th>Field name</th><th>Value</th></tr>' + table + '</table>';
                content += table;

                return cb(null);

            });


        }, function (err) {

            if (err) {
                return callback(err);
            }

            return callback(null, content);

        });

    });

}
