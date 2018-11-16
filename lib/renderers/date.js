'use strict';

const moment = require('moment');

/**
 * Render a date field as a string.
 * @param {Date} val The field value.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=moment().format()] An optional default string to return.
 * @param {String} format An optional moment date format string.
 * @return {Promise} Resolves with the string to display.
 */
const dateRenderer = (val, opts) => new Promise((resolve) => {

    const options = Object.assign({ default: moment().format() }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    return resolve(moment(val).format(options.format));

});

module.exports = dateRenderer;
