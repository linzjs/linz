'use strict';

const async = require('async');
const defaultRenderer = require('./default');

const documentArray = function documentArrayRenderer (val, record, fieldName, model, callback) {

    const tableHeading = [];
    // Labels for the embedded field, rather than the model in which the document is embedded.
    const labels = model.linz.formtools.form[fieldName].linz.formtools.labels;
    const form = model.linz.formtools.form[fieldName].linz.formtools.form;
    // This is the embedded schema, not the record schema.
    const schema = model.schema.tree[fieldName][0];
    const fields = Object.keys(form);

    let content = '';
    let heading = '';

    // Loop over each document.
    async.eachSeries(record[fieldName], function (doc, cb) {

        let row = '';

        async.eachSeries(fields, function (key, fieldValueDone) {

            // Grab the label if we have it.
            const label = labels[key];

            // Add unique table heading.
            if (tableHeading.indexOf(label) < 0 ) {
                tableHeading.push(label);
            }

            // <imic the format expected for model.
            const embeddedModel = { schema };

            // render field value
            defaultRenderer(doc[key], doc, key, embeddedModel, function (err, value) {

                if (err) {
                    return fieldValueDone(err);
                }

                row += `<td>${value}</td>`;

                return fieldValueDone(null);

            });

        }, function (err) {

            if (err) {
                return cb(err);
            }

            // turn content to row
            row = `<tr>${row}</tr>`;
            content += row;

            return cb(null);

        });


    }, function (err) {

        if (err) {
            return callback(err);
        }

        if (content.length) {

            tableHeading.forEach(function (title) {
                heading += `<th>${title}</th>`;
            });

            if (heading.length) {
                heading = `<tr>${heading}</tr>`;
            }

            content = `<table class="table table-bordered table-responsive">${heading}${content}</table>`;
        }

        return callback(null, content);

    });

};

module.exports = documentArray;
