'use strict';

/**
 * Render an array field as a string.
 * @param {Array} val The field value.
 * @param {Object} opts The options object.
 * @param {String} [opts.default=''] An optional default string to return.
 * @return {Promise} Resolves with the string to display.
 */
const arrayRenderer = (val, opts) => new Promise((resolve) => {

    const options = Object.assign({ default: '' }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    return resolve(val.join(', '));

});

module.exports = arrayRenderer;
