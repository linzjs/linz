'use strict';

const async = require('async');
const cellRenderers = require('./');

const documentArrayRenderer = (val, record, fieldName, model, callback) => {
    const getLabels = () => {
        try {
            const labels =
                model.linz.formtools.form[fieldName].linz.formtools.labels;

            return labels;
        } catch (err) {
            return {};
        }
    };

    let content = '';

    async.eachSeries(
        record[fieldName],
        (field, cb) => {
            let table = '';

            if (field.__parentArray) {
                // this is a mongoose record, let's convert to object literal
                field = field.toObject({ virtuals: true });
            }

            async.eachSeries(
                Object.keys(field),
                (key, fieldValueDone) => {
                    if (key === '_id' || key === 'id') {
                        return fieldValueDone(null);
                    }

                    table += '<tr><td>' + getLabels()[key] + '</td>';

                    // mimic the format expected for model
                    const embeddedModel = {
                        schema: model.schema.tree[fieldName][0],
                    };

                    // render field value
                    cellRenderers.default(
                        field[key],
                        field,
                        key,
                        embeddedModel,
                        (err, value) => {
                            if (err) {
                                return fieldValueDone(err);
                            }

                            table += '<td>' + value + '</td></tr>';

                            return fieldValueDone(null);
                        }
                    );
                },
                (err) => {
                    if (err) {
                        return cb(err);
                    }

                    // turn content to table
                    table =
                        '<table class="table table-bordered"><tr><th>Field name</th><th>Value</th></tr>' +
                        table +
                        '</table>';
                    content += table;

                    return cb(null);
                }
            );
        },
        (err) => {
            if (err) {
                return callback(err);
            }

            return callback(null, content);
        }
    );
};

module.exports = documentArrayRenderer;
