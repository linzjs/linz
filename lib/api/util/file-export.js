'use strict';

const csvTransform = require('stream-transform');
const csvStringify = require('csv-stringify');

/**
 * Generate an export file from a stream.
 * Options can be found here https://csv.js.org
 * @param {Object} opts The options object.
 * @param {Array} opts.columns An array of key and header objects to use as the column header.
 * @param {Object} opts.stream A stream.
 * @param {Object} opts.res HTTP response object.
 * @param {String} [opts.extension='csv'] The name of the file extension.
 * @param {String} opts.name The name of the file.
 * @param {Function} opts.transform A transform function to pass to the stream.
 * @return {Void} Send back a CSV file.
 */
const generateExport = (opts) => {

    const options = Object.assign({
        extension: 'csv',
        name: 'export',
        transform: (doc) => doc,
    }, opts);

    if (!options.res) {
        throw new Error('res is a required property');
    }

    if (!options.stream) {
        throw new Error('stream is a required property');
    }

    options.res.setHeader('Content-disposition', `attachment; filename=${options.name}.${options.extension}`);

    if (options.contentType) {
        options.res.setHeader('Content-Type', options.contentType);
    }

    options.stream.pipe(csvTransform(options.transform))
        .pipe(csvStringify({
            columns: options.columns,
            header: true,
        }))
        .pipe(options.res);

};

module.exports = { generateExport };
