'use strict';

const linz = require('../../../');
const csv = require('csv');

/**
 * Generate an export file from a query.
 * Options can be found here https://csv.js.org
 * @param {Object} opts The options object.
 * @param {Array} opts.columns An array of key and header objects to use as the column header.
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
        name: 'export',
        transform: (doc) => doc,
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

    options.query.lean()
        .cursor()
        .pipe(csv.transform(options.transform))
        .pipe(csv.stringify({
            columns: options.columns,
            header: true,
        }))
        .pipe(options.res);

};

module.exports = { generateExport };
