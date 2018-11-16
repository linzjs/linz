'use strict';

const format = require('date-fns/format');

/**
 * Render a date field as a string.
 * @param {Date} val The field value.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=YYYY-MM-DDTHH:mm:ss.SSSZ'] An optional default string to return.
 * @return {Promise} Resolves with the string to display.
 */
const dateRenderer = (val, opts) => new Promise((resolve) => {

    const options = Object.assign({ default: format(new Date()) }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    return resolve(format(val, options.dateFormat));

});

module.exports = dateRenderer;
