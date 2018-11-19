'use strict';

const linz = require('../../../');

/**
 * Generate an export file from a query.
 * @param {Object} opts The options object.
 * @param {Object} opts.query Mongoose query object.
 * @param {Object} opts.req HTTP request object.
 * @param {Object} opts.res HTTP response object.
 * @param {String} [opts.extension='csv'] The name of the file extension.
 * @param {Function} opts.format Format function that takes the result of the query and returns the file string.
 * @param {String} opts.name The name of the file.
 * @return {Void} Send back a CSV file.
 */
const generateExport = (opts) => {

    const options = Object.assign({
        extension: 'csv',
        format: (result) => {

            const file = [].concat(result);

            return Promise.resolve(file.join('\n'));

        },
        name: 'export',
    }, opts);

    if (!options.req) {
        throw new Error('req is a required property');
    }

    if (!options.res) {
        throw new Error('res is a required property');
    }

    if (!options.query) {
        throw new Error('query is a required property');
    }

    options.res.setHeader('Content-disposition', `attachment; filename=${options.name}.${options.extension}`);

    if (options.contentType) {
        options.res.setHeader('Content-Type', options.contentType);
    }

    options.query.exec()
        .then(result => options.format(result))
        .then(file => options.res.send(file))
        .catch((err) => {

            options.req.flash('linz-notification', linz.api.views.notification({
                layout: 'bottomCenter',
                text: err.message,
                theme: 'sunset',
                timeout: 5000,
                type: 'error',
            }));

            return options.res.redirect('back');

        });

};

module.exports = { generateExport };
