'use strict';

const { isString } = require('../util');

/**
 * Render a boolean field as a string.
 * @param {Boolean} val The field value.
 * @param {Object} opts The options object.
 * @param {String} [opts.default='No'] An optional default string to return.
 * @return {Promise} Resolves with the string to display.
 */
const booleanRenderer = (val, opts) => new Promise((resolve) => {

    const options = Object.assign({ default: 'No' }, opts);

    if (!val && options.default) {
        return resolve(options.default);
    }

    if (isString(val)) {

        const isTrue = !['false', 'no', '0'].includes(val.toLowerCase());

        return resolve(isTrue ? 'Yes' : 'No');

    }

    return resolve((val) ? 'Yes' : 'No');

});

module.exports = booleanRenderer;
